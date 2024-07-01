import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  Signal,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewChildren,
  WritableSignal,
  computed,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Subscription, distinctUntilChanged, filter, timer } from 'rxjs';
import { LayoutService } from '../../service/layout.service';
import { CarouselItemComponent } from './carousel-item/carousel-item.component';
import { ImgCarouselBreakpoint, ImgCarouselOptions } from './img-carousel-options.interface';

@Component({
  selector: 'app-img-carousel',
  templateUrl: './img-carousel.component.html',
  styleUrls: ['./img-carousel.component.scss'],
  host: {
    '[class.panning]': 'isPanning()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImgCarouselComponent implements OnInit, OnChanges, AfterViewInit {
  constructor(
    public elementRef: ElementRef<HTMLElement>,
    public cdr: ChangeDetectorRef,
    private destroyRef: DestroyRef,
    private layoutService: LayoutService,
  ) {}

  private _activeIndex: number = 0;
  /** 当前索引 */
  set activeIndex(value: number) {
    if (value != this._activeIndex) {
      this._activeIndex = value;
      this.IndexChange.emit(this._activeIndex);
    }
  }
  get activeIndex(): number {
    if (this._activeIndex > this.maxIndex) {
      this.activeIndex = this.maxIndex;
      return this._activeIndex;
    }
    return this._activeIndex;
  }

  private _slidesPerView: number = 1;
  /** 当前要显示的数量 可以为小数 */
  @Input()
  set slidesPerView(value: number) {
    this._slidesPerView = value;
  }
  get slidesPerView(): number {
    return this.breakpointConfig?.slidesPerView ?? this._slidesPerView;
  }

  private _slidesPerGroup: number = 1;
  /** 一次滚动的数量 必须为整数 */
  @Input()
  set slidesPerGroup(value: number) {
    this._slidesPerGroup = value;
  }
  get slidesPerGroup(): number {
    return this.breakpointConfig?.slidesPerGroup ?? this._slidesPerGroup;
  }

  private _spaceBetween: number = 5;
  /** Item间距，单位px */
  @Input()
  set spaceBetween(value: number) {
    this._spaceBetween = value;
  }
  get spaceBetween(): number {
    return this.breakpointConfig?.spaceBetween ?? this._spaceBetween;
  }

  private _allowTouchMove: boolean = true;
  /** 是否支持手势滑 */
  @Input()
  set allowTouchMove(value: boolean) {
    this._allowTouchMove = value;
  }
  get allowTouchMove(): boolean {
    return this.breakpointConfig?.allowTouchMove ?? this._allowTouchMove;
  }

  /** 是否显示分页 */
  @Input() pagination: boolean = false;

  /** 滚动速度,单位毫秒 */
  @Input() speed: number = 1000;

  /** 是否为循环模式 */
  @Input() loop: boolean = false;

  /** 断点 */
  @Input() breakpoints: ImgCarouselBreakpoint | null = null;

  /** 是否自动播放 */
  @Input() autoplay: boolean = false;

  /** 延迟时间 */
  @Input() deplay: number = 3000;

  /** 配置文件 */
  @Input() config: ImgCarouselOptions | null = null;

  /** 索引变化事件通知 */
  @Output() IndexChange: EventEmitter<number> = new EventEmitter<number>();

  /** 轮播图数据 */
  @Input() itemsData: unknown[] | null = null;

  /** 变化之后的轮播图数据 */
  updatedItemsData: WritableSignal<unknown[] | null> = signal(null);

  /** 轮播图子元素 */
  @ViewChildren(CarouselItemComponent) carouselItems!: QueryList<CarouselItemComponent>;

  /** 轮播图子元素模板 */
  @ContentChild('carouselItemTpl') itemTemplate!: TemplateRef<unknown>;

  /** container容器 */
  @ViewChild('container') containerElement!: ElementRef<HTMLDivElement>;

  /**
   * 轮播图子元素
   *
   * @returns `QueryList<CarouselItemComponent>`
   */
  get items(): QueryList<CarouselItemComponent> {
    return this.carouselItems?.length ? this.carouselItems : ([] as unknown as QueryList<CarouselItemComponent>);
  }

  /** 上一个激活的索引 */
  private oldIndex: number = 0;

  /** 断点生效配置文件 */
  private breakpointConfig: ImgCarouselOptions | null = null;

  /**
   * 最大索引
   *
   * @returns `number`
   */
  get maxIndex(): number {
    const count = Math.ceil((this.itemsData?.length ?? 0) - this.slidesPerView);
    const pageCount = Math.ceil(count / this.slidesPerGroup);
    return pageCount < 0 ? 0 : pageCount;
  }

  /**
   * 是否为第一页
   *
   * @returns `boolean`
   */
  get isBeginning(): boolean {
    return this.loop ? false : this.activeIndex == 0;
  }

  /**
   * 是否为最后一页
   *
   * @returns `boolean`
   */
  get isEnd(): boolean {
    return this.loop ? false : this.activeIndex >= this.maxIndex;
  }

  /** 是否有动画效果 */
  private hasTransition: boolean = false;

  /** 是否在滑动中 */
  isPanning = signal(false);

  /** 是否变换中 */
  inTransition = signal(false);

  /**是否动画中 */
  animating = computed(() => {
    return this.isPanning() || this.inTransition();
  });

  /** 滑动中的样式 */
  private panningTransformStyle: string = '';
  /** 滚动方向 */
  private slideDirection?: 'prev' | 'next' | null;

  /**
   * 页面切换变化的transform
   *
   * @returns `string`
   */
  get transformStyle() {
    //如果是在手势滑动中，返回滑动中的样式，避免冲突
    if (this.isPanning()) return this.panningTransformStyle;
    //重置边缘动画
    const resetAnimation = () => {
      setTimeout(() => {
        this.oldIndex = this.activeIndex;
        this.hasTransition = true;
        this.transformStyle;
        this.cdr.detectChanges();
      });
    };
    // last -> other
    if (this.loop && !this.isLoading() && this.oldIndex == this.maxIndex && this.activeIndex < this.maxIndex) {
      let curTranslateX = -(this.maxIndex + 1) * this.slidesPerGroup * (this.itemWidth + this.spaceBetween);
      // last -> first
      if (this.activeIndex == 0 && this.slideDirection == 'next') {
        curTranslateX = 0;
      }
      resetAnimation();
      return `transform:translateX(${curTranslateX}px);`;
    }
    if (this.isLoading() || this.activeIndex == 0) {
      //如果为loop模式，跳过第一页
      let translateStyle = 'transform:translateX(0px);';
      if (this.loop && !this.isLoading()) {
        const curTranslateX = -1 * this.slidesPerGroup * (this.itemWidth + this.spaceBetween);
        translateStyle = `transform:translateX(${curTranslateX}px);`;
      }
      let transitionStyle = '';
      if (this.speed && this.hasTransition) {
        transitionStyle = `transition-duration:${this.speed}ms;`;
      }
      return `${translateStyle}${transitionStyle}`;
    }
    // first -> other
    if (this.loop && this.oldIndex == 0) {
      // this.activeIndex != this.maxIndex
      let curTranslateX = -1 * this.slidesPerGroup * (this.itemWidth + this.spaceBetween);
      // first -> last
      if (this.activeIndex == this.maxIndex && this.slideDirection == 'prev') {
        curTranslateX = -(this.maxIndex + 2) * this.slidesPerGroup * (this.itemWidth + this.spaceBetween);
      }
      resetAnimation();
      return `transform:translateX(${curTranslateX}px);`;
    }
    // 其它正常滚动
    const curTranslateX =
      -(this.activeIndex + (this.loop ? 1 : 0)) * this.slidesPerGroup * (this.itemWidth + this.spaceBetween);
    const maxTranslateX =
      -this.items.length * (this.itemWidth + this.spaceBetween) + this.componentWidth() + this.spaceBetween;
    const translateStyle = `transform:translateX(${Math.max(curTranslateX, maxTranslateX)}px);`;
    let transitionStyle = '';
    if (this.speed && this.hasTransition) {
      transitionStyle = `transition-duration:${this.speed}ms;`;
    }
    return `${translateStyle}${transitionStyle}`;
  }

  /**当前组件尺寸信号 */
  componentRect: WritableSignal<DOMRect | null> = signal(null);
  componentWidth: Signal<number> = computed(() => {
    return this.componentRect()?.width ?? 0;
  });

  /**
   * 每一项的宽度
   *
   * @returns `number`
   */
  get itemWidth(): number {
    //总间距
    let totalSpaceBetween = 0;
    if (this.spaceBetween) {
      totalSpaceBetween = (Math.ceil(this.slidesPerView) - 1) * this.spaceBetween;
    }
    return (this.componentWidth() - totalSpaceBetween) / this.slidesPerView;
  }

  /** 是否加载中 无数据（撑骨架的不算数据） */
  isLoading: Signal<boolean> = computed(() => {
    const data = this.updatedItemsData();
    return !data || [data].flat().some(y => !y);
  });

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    //通过配置文件覆盖当前的设置
    const { config, itemsData } = changes;
    const currentConfig = config?.currentValue;
    if (currentConfig) {
      this.pagination = currentConfig.pagination ?? false;
      this.speed = currentConfig.speed ?? 1000;
      this.slidesPerView = currentConfig.slidesPerView ?? 1;
      this.slidesPerGroup = currentConfig.slidesPerGroup ?? 1;
      this.spaceBetween = currentConfig.spaceBetween ?? 5;
      this.loop = currentConfig.loop ?? false;
      this.breakpoints = currentConfig.breakpoints;
      this.allowTouchMove = currentConfig.allowTouchMove ?? true;
      this.autoplay = currentConfig.autoplay ?? false;
      this.deplay = currentConfig.deplay ?? 3000;
      if (!config.isFirstChange()) {
        this.resetItemWidth();
      }
    }
    //当传入的数据变化时，重新检查并设置loop的数据
    if (itemsData?.currentValue.length) {
      this.checkLoopItems();
      this.startPlay();
      this.resetItemWidth();
    }
  }

  /**
   * 检查loop模式下的轮播图数据
   */
  private checkLoopItems() {
    if (this.itemsData?.length) {
      if (this.loop) {
        const remainder = this.itemsData.length % this.slidesPerGroup;
        let newData = this.itemsData;
        if (remainder != 0) {
          const filler = this.itemsData.slice(0, this.slidesPerGroup - remainder);
          newData = newData.concat(filler);
        }
        this.updatedItemsData.set(
          newData.slice(-this.slidesPerGroup).concat(newData).concat(newData.slice(0, this.slidesPerGroup)),
        );
      } else {
        this.updatedItemsData.set(this.itemsData);
      }
      this.cdr?.detectChanges();
    }
  }

  /** 相交检查轮询订阅 */
  checkIntersect$?: Subscription;
  /** 动画中订阅 */
  animating$ = toObservable(this.animating).pipe(takeUntilDestroyed(), distinctUntilChanged());
  /** 尺寸变化订阅 */
  sizeChange$ = toObservable(this.componentRect).pipe(
    filter(x => !!x),
    takeUntilDestroyed(),
  );

  ngAfterViewInit(): void {
    this.processSize(this.elementRef.nativeElement.getBoundingClientRect());
    //检测当前元素尺寸变化
    this.layoutService
      .resizeObservable(this.elementRef.nativeElement)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(e => {
        this.processSize(e.target.getBoundingClientRect());
      });
    //动画开始时候轮询检查相交
    this.animating$.subscribe(state => {
      if (state) {
        this.checkIntersect$ = timer(0, 20)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.checkIntersect();
          });
      } else {
        this.checkIntersect$?.unsubscribe();
        this.checkIntersect();
      }
    });
    //尺寸变化时候检查相交
    this.sizeChange$.subscribe(() => {
      setTimeout(() => {
        this.checkIntersect();
      });
    });
  }

  /**
   * 初始化或处理尺寸
   *
   * @param rect 当前容器rect数据
   */
  processSize(rect: DOMRect) {
    this.componentRect.set(rect);
    this.resetBreakpointConfig();
    this.resetItemWidth();
  }

  /**检查相交 */
  checkIntersect() {
    if (this.isLoading() || Number.isInteger(this.slidesPerView)) {
      this.items.forEach(x => x.className.set(''));
      return;
    }
    const containerEl = this.containerElement?.nativeElement as HTMLElement;
    const componentRect = this.componentRect();
    if (containerEl && componentRect) {
      const containerRect = containerEl.getBoundingClientRect();
      const translateX = containerRect.left - componentRect.left;
      let rightIndex = -1;
      let leftIndex = -1;
      if (-translateX + this.componentWidth() < containerEl.scrollWidth - 10) {
        rightIndex = Math.ceil((-translateX + this.componentWidth()) / (this.itemWidth + this.spaceBetween) - 1);
      } else if (translateX < 0) {
        leftIndex = Math.ceil((-translateX - 10) / (this.itemWidth + this.spaceBetween) - 1);
      }
      this.items.forEach((x, itemIndex) => {
        let tempClassName = '';
        if (rightIndex > -1 && itemIndex >= rightIndex) {
          tempClassName = 'img-carousel-item-half-right';
        } else if (leftIndex > -1 && itemIndex <= leftIndex) {
          tempClassName = 'img-carousel-item-half-left';
        }
        x.className.set(tempClassName);
      });
    }
  }

  private play$?: Subscription;

  /** 开始自动播放 */
  startPlay() {
    this.stopPlay();
    if (this.autoplay) {
      this.play$ = timer(this.deplay, this.deplay)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.slideNext();
        });
    }
  }

  /** 暂停播放 */
  stopPlay() {
    this.play$?.unsubscribe();
  }

  /**
   * 向前滚动
   */
  slidePrev() {
    if (this.isLoading()) return;
    this.hasTransition = true;
    this.oldIndex = this.activeIndex;
    this.slideDirection = 'prev';
    if (this.activeIndex > 0) {
      this.activeIndex--;
    } else if (this.loop) {
      this.activeIndex = this.maxIndex;
    }
    if (this.autoplay) this.startPlay();
    this.cdr.detectChanges();
  }

  /**
   * 向后滚动
   */
  slideNext() {
    if (this.isLoading()) return;
    this.hasTransition = true;
    this.oldIndex = this.activeIndex;
    this.slideDirection = 'next';
    if (this.activeIndex < this.maxIndex) {
      this.activeIndex++;
    } else if (this.loop) {
      this.activeIndex = 0;
    }
    if (this.autoplay) this.startPlay();
    this.cdr.detectChanges();
  }

  /**
   * 跳转到指定的页面数
   *
   * @param index 索引
   */
  slideTo(index: number) {
    if (this.isLoading()) return;
    this.hasTransition = true;
    this.oldIndex = index;
    if (this.loop) {
      if (index < 0) {
        index = this.maxIndex + index + 1;
        if (index == this.maxIndex) {
          // this.oldIndex = 0;
          this.hasTransition = false;
        }
      }
      if (index > this.maxIndex) {
        index = index - this.maxIndex - 1;
        if (index == 0) {
          // this.oldIndex = this.maxIndex;
          this.hasTransition = false;
        }
      }
    } else {
      index = Math.min(index, this.maxIndex);
      index = Math.max(0, index);
    }
    this.activeIndex = index;
    this.cdr.detectChanges();
  }

  /**
   * 重新计算每个元素的宽度
   */
  private resetItemWidth() {
    if (this.items) {
      this.items.forEach(x => {
        x.width.set(`${this.itemWidth}px`);
        if (this.spaceBetween) {
          x.marginRight.set(`${this.spaceBetween}px`);
        }
      });
    }
    this.cdr?.detectChanges();
  }

  /**
   * 根据当前宽度获取配置文件
   */
  private resetBreakpointConfig() {
    if (!this.breakpoints) return;
    this.hasTransition = false;
    const target = this.componentWidth();
    const numbers = Object.keys(this.breakpoints)
      .map(x => Number(x))
      .sort((a, b) => a - b);
    let tempBreakpointConfig = null;
    for (let i = 0; i < numbers.length; i++) {
      if (target <= numbers[i]) {
        this.breakpointConfig = tempBreakpointConfig = this.breakpoints[numbers[i]];
        // loop模式下，断点变化，要重新检查轮播数据
        if (this.itemsData?.length) {
          this.checkLoopItems();
        }
        return;
      }
    }
    if (tempBreakpointConfig != this.breakpointConfig) {
      this.breakpointConfig = null;
      this.checkLoopItems();
    }
  }

  /** 非结束上一次滚动距离 */
  private oldDeltaX: number = 0;

  /** 开始滑动时间 */
  private startPanTime: number = 0;

  onPan(containerElement: HTMLDivElement, event: HammerInput) {
    if (this.isLoading() || !this.items.length || !this.allowTouchMove) return;
    //滑动开始初始化
    if (this.oldDeltaX == 0) {
      this.isPanning.set(true);
      this.stopPlay();
      this.startPanTime = new Date().getTime();
    }
    //滑动距离同步到元素
    let translateX = Number(getComputedStyle(containerElement).transform.split(',')[4]);
    if (isNaN(translateX)) translateX = 0;
    translateX = translateX - this.oldDeltaX + event.deltaX;
    this.oldDeltaX = event.deltaX;
    const maxTranslateX =
      -this.items.length * (this.itemWidth + this.spaceBetween) + this.componentWidth() + this.spaceBetween;
    if (this.loop) {
      if (translateX >= 0) {
        translateX += -(this.maxIndex + 1) * this.slidesPerGroup * (this.itemWidth + this.spaceBetween);
      }
      if (translateX <= maxTranslateX) {
        translateX = -1 * this.slidesPerGroup * (this.itemWidth + this.spaceBetween) - maxTranslateX + translateX;
      }
    } else {
      translateX = Math.min(0, translateX);
      translateX = Math.max(translateX, maxTranslateX);
      if (this.items.length < this.slidesPerView) translateX = 0;
    }
    this.panningTransformStyle = `transform:translateX(${translateX}px)`;
    //滑动结束事件处理
    if (event.isFinal) {
      this.isPanning.set(false);
      this.oldDeltaX = 0;
      this.panningTransformStyle = '';
      if (this.autoplay) this.startPlay();
      const endTime = new Date().getTime();
      //手势检测与处理
      if (endTime - this.startPanTime < 300) {
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
          if (event.deltaX < 0) {
            this.slideTo(this.activeIndex + 1);
          } else if (event.deltaX > 0) {
            this.slideTo(this.activeIndex - 1);
          }
        }
      } else {
        //滑动检测与处理
        const moveDistance = -event.deltaX;
        const movePageCount = Math.round(moveDistance / this.componentWidth());
        this.slideTo(this.activeIndex + movePageCount);
      }
    }
  }

  transitionstart(e: TransitionEvent) {
    if ((e.target as HTMLElement).classList.contains('carousel-container')) {
      this.inTransition.set(true);
    }
  }

  transitionend(e: TransitionEvent) {
    if ((e.target as HTMLElement).classList.contains('carousel-container')) {
      this.inTransition.set(false);
    }
  }
}
