import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Directive,
  ElementRef,
  Injectable,
  Input,
  NgZone,
  OnDestroy,
} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { LayoutService } from 'src/app/_metronic/core';
import { debounce } from 'lodash';

@Component({
  selector: '[sticky]',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        --tool-sticky: 0 10px 10px -8px rgb(22 22 22 / 8%);
        transition: box-shadow 0.3s ease-in-out;

        &.affix-thead {
          position: sticky !important;
          box-shadow: var(--tool-sticky);
          border-bottom: 1px solid rgba(#222, 0.08);
          // padding-top: 0 !important;
          // padding-bottom: 0 !important;
          // transition: padding 0.3s ease-in-out;
        }
      }
    `,
  ],
  exportAs: 'sticky',
  host: {
    '[class.affix-thead]': 'fixed',
    '[style.top.px]': 'fixed ? fixedTop : undefined',
    '[style.zIndex]': 'fixed ? (pZIndex === undefined ? zIndex : pZIndex) : undefined',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
})
export class StickyAutoDirective implements AfterViewInit, OnDestroy {
  constructor(
    private destroy$: DestroyService,
    public host: ElementRef<HTMLTableSectionElement>,
    private layout: LayoutService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private stickyService: StickyService
  ) {}

  fixed = false;
  scrollTop = 0;
  transform = 0;
  propsOffset = -1;
  zIndex?: number = 90;
  pZIndex?: number = undefined;

  // TODO：后期待办 - 支持自定义滚动的容器 1. 通过set监听改变重新赋值并监听滚动事件
  // @Input('scrollContainer') propContainer: string | HTMLElement = '';
  @Input('theadAffix') propContainer: string | HTMLElement = '';
  @Input('offset') set _propOffset(v) {
    this.propsOffset = v;
    // this.stickyService.getOffsetTop(this);
  }

  @Input('zIndex') set _index(v: number) {
    this.pZIndex = v;
  }

  @Input() order?: number | string = undefined; // 处于第几个位置固定
  @Input() debounceTime = 16;

  /** 是否计算相对于主要内容的偏移 */
  @Input('calcContentOffset') propsCalcContentOffset = true;
  // @Output() affixScroll = new EventEmitter<{ scrollTop: number; fixed: boolean }>();

  fixedTop = -1;
  offsetTop$ = new Subject<number>();
  private mounted$ = new Subject<void>();

  ngOnDestroy() {
    this.cleanup();
    this.stickyService.removeSticky(this);
  }

  ngAfterViewInit(): void {
    this.stickyService.addSticky(this);
    // this.computedTop();
    this.useElementBounding(this.host.nativeElement, { windowScroll: !this.propContainer });

    // TODO：后期待办 - 支持自定义滚动的容器 1. 通过set监听改变重新赋值并监听滚动事件
    // if (this.propContainer) {
    //   this.scrollContainerData = this.useScroll(this.propContainer);
    // }

    this.offsetTop$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
      this.zone.run(() => {
        this.fixedTop = res;
        this.computedIsFixed();
      });
    });
    this.mounted$.next();
    this.mounted$.complete();
  }

  /**
   * 滚动更新函数isFixed，这里 *千万不要做更新Top操作*，会导致切换页面时，页面卡顿
   * @usageNotes
   */
  updateScroll = debounce(() => {
    this.computedIsFixed();
  }, this.debounceTime);

  /**
   * 计算是否固定
   */
  computedIsFixed() {
    const v = this.host.nativeElement.getBoundingClientRect().top <= this.fixedTop + 2; // 2px误差修正，缩放会出现小数会快速闪动，持续true和false触发
    if (this.fixed === v) return;

    this.zone.run(() => {
      this.fixed = v;
    });
  }

  /**
   * 更新函数
   * @usageNotes
   * * 这里更新函数不要做异步操作，会导致底层切换页面时，页面卡顿
   */
  update = debounce(() => {
    this.stickyService.getOffsetTop(this, true);
  }, this.debounceTime).bind(this);

  observer: ResizeObserver | undefined;
  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }

  useElementBounding(
    target: any,
    options: {
      reset?: boolean;
      windowResize?: boolean;
      windowScroll?: boolean;
      immediate?: boolean;
    } = {}
  ) {
    const { immediate = true } = options;

    this.cleanup();
    if (window && 'ResizeObserver' in window) {
      this.zone.runOutsideAngular(() => {
        this.observer = new ResizeObserver(this.update);
        this.observer!.observe(target, {});
      });
    }

    // this.zone.runOutsideAngular(() => {
    // window.addEventListener('scroll', this.updateScroll, { passive: true, capture: true });
    // window.addEventListener('resize', this.update, { passive: true });
    // });

    // immediate
    this.mounted$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (immediate) this.update();
    });
  }
}

/**
 * 用于计算吸附顶部偏移量
 */
@Directive({
  selector: '[stickyContainer]',
  standalone: true,
})
export class StickyContainerDirective implements AfterViewInit, OnDestroy {
  constructor(private host: ElementRef<HTMLElement>, private sticky: StickyService) {}

  offset$ = new BehaviorSubject(0);

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.offset$.next(this.host.nativeElement.offsetTop);
      this.sticky.addContainer(this);
    });
  }

  ngOnDestroy(): void {
    this.sticky.removeContainer(this);
  }
}

@Injectable({
  providedIn: 'root',
})
export class StickyService {
  constructor(private zone: NgZone) {
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onEventScroll, { passive: true, capture: false });
      window.addEventListener('resize', this.onEventUpdate, { passive: true });
    });
  }

  private firstZIndex = 93;
  private _stickyContainer: StickyContainerDirective[] = []; // 公共的固定容器 用于计算真实所需top偏移量
  private _sticky: StickyAutoDirective[] = [];

  readonly onEventScroll = debounce(() => {
    this._sticky?.forEach((e) => e.updateScroll());
  }, 16);

  readonly onEventUpdate = debounce(() => {
    this._sticky?.forEach((e) => this.getOffsetTop(e, true));
  }, 16);

  /**
   * 添加吸附元素
   */
  addSticky(sticky: StickyAutoDirective) {
    setTimeout(() => {
      sticky.zIndex = this.firstZIndex--;
    });
    this._sticky.push(sticky);
  }

  /**
   * 移除吸附元素
   */
  removeSticky(sticky: StickyAutoDirective) {
    const i = this._sticky.findIndex((e) => e === sticky);
    i !== -1 && this._sticky.splice(i, 1);
  }

  /**
   * 添加公共的固定 如：个人信息栏、面包屑栏
   * @param stickyContainer
   */
  addContainer(stickyContainer) {
    this._stickyContainer.push(stickyContainer);
  }

  /**
   * 移除公共的外部固定 如：个人信息栏、面包屑栏
   * @param stickyContainer
   */
  removeContainer(stickyContainer: StickyContainerDirective) {
    const i = this._stickyContainer.findIndex((e) => e === stickyContainer);
    i !== -1 && this._stickyContainer.splice(i, 1);
  }

  /**
   * 获取当前真实的偏移量
   */
  getOffsetTop(sticky?: StickyAutoDirective, isContinue = false) {
    if (!sticky) return;

    const container = this._stickyContainer.reduce((prev, curr) => prev + curr.offset$.value, 0);
    const stickyIndex = +(sticky.order === undefined ? this._sticky.findIndex((e) => e === sticky) : sticky.order);
    const stickyTop = this.getOffsetTopBySticky(this._sticky.slice(0, stickyIndex || 0));
    sticky.offsetTop$.next(container + stickyTop + (stickyIndex ? -1 : 0));

    setTimeout(() => {
      // 下一个吸附元素计算
      isContinue &&
        this.getOffsetTop(
          this._sticky.find((e, i) => i === stickyIndex + 1),
          isContinue
        );
    });
  }

  /**
   * 计算当前吸附元素的偏移量
   * @param stickyList
   */
  getOffsetTopBySticky(stickyList: StickyAutoDirective[]): number {
    if (!Array.isArray(stickyList)) return 0;

    return stickyList.reduce((prev, curr) => {
      return prev + curr.host.nativeElement.offsetHeight;
    }, 0);
  }
}
