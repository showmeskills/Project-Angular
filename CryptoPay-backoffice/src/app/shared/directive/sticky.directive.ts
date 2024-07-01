import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { LayoutService } from 'src/app/_metronic/core';
import { debounce } from 'lodash';

@Component({
  selector: '[theadAffix]',
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
        }
      }
    `,
  ],
  exportAs: 'theadAffix',
  host: {
    '[class.affix-thead]': 'fixed',
    '[style.top.px]': 'fixed ? fixedTop : undefined',
    '[style.zIndex]': 'fixed ? (pZIndex === undefined ? zIndex : pZIndex) : undefined',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
})
export class StickyDirective implements AfterViewInit, OnDestroy {
  constructor(
    private destroy$: DestroyService,
    public host: ElementRef<HTMLTableSectionElement>,
    private layout: LayoutService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
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
    this.computedTop();
  }

  @Input('zIndex') set _index(v: number) {
    this.pZIndex = v;
  }

  @Input() order?: number | string = undefined; // 处于第几个位置固定
  @Input() debounceTime = 16;

  /** 是否计算相对于主要内容的偏移 */
  @Input('calcContentOffset') propsCalcContentOffset = true;
  // @Output() affixScroll = new EventEmitter<{ scrollTop: number; fixed: boolean }>();

  private mounted$ = new Subject<void>();

  ngOnDestroy() {
    this.cleanup();

    window.removeEventListener('scroll', this.update, { capture: true });
    window.removeEventListener('resize', this.update, {});
  }

  ngAfterViewInit(): void {
    this.computedTop();
    this.useElementBounding(this.host.nativeElement, { windowScroll: !this.propContainer });

    // TODO：后期待办 - 支持自定义滚动的容器 1. 通过set监听改变重新赋值并监听滚动事件
    // if (this.propContainer) {
    //   this.scrollContainerData = this.useScroll(this.propContainer);
    // }

    this.mounted$.next();
    this.mounted$.complete();
  }

  fixedTop = -1;
  computedTop() {
    setTimeout(() => {
      const contentOffset = this.propsCalcContentOffset ? this.layout.contentTop$.value : -1;
      this.fixedTop = contentOffset + this.propsOffset;
      this.cdr.detectChanges();
    });
  }

  /**
   * 更新函数
   * @usageNotes
   * * 这里更新函数不要做异步操作，会导致底层切换页面时，页面卡顿
   */
  update = debounce(() => {
    const res = !(this.host.nativeElement.getBoundingClientRect().top - this.fixedTop > 0);
    if (this.fixed === res) return;

    this.zone.run(() => {
      this.fixed = res;
    });
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
      this.observer = new ResizeObserver(this.update);
      this.observer!.observe(target, {});
    }

    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.update, { passive: true, capture: true });
      window.addEventListener('resize', this.update, { passive: true });
    });

    // immediate
    this.mounted$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (immediate) this.update();
    });
  }
}
