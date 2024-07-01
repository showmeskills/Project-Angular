import { AfterViewInit, Component, ElementRef, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { useEventListener } from 'src/app/shared/models/listener.model';
import { LayoutService } from 'src/app/_metronic/core';

@Component({
  selector: '[theadAffix]',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        &.affix-thead {
          position: sticky;

          &::ng-deep {
            tr {
              box-shadow: 0 10px 12px -10px rgb(22 22 22 / 15%);
            }
          }
        }
      }
    `,
  ],
  exportAs: 'theadAffix',
  host: {
    '[class.affix-thead]': 'fixed',
    '[style.top.px]': 'fixedTop',
    '[style.zIndex]': 'propsZIndex',
  },
  providers: [DestroyService],
})
export class AffixTheadDirective implements AfterViewInit {
  constructor(
    private destroy$: DestroyService,
    private host: ElementRef<HTMLTableSectionElement>,
    private layout: LayoutService
  ) {}

  fixed = false;
  scrollTop = 0;
  transform = 0;

  // TODO：后期待办 - 支持自定义滚动的容器 1. 通过set监听改变重新赋值并监听滚动事件
  // @Input('scrollContainer') propContainer: string | HTMLElement = '';
  @Input('theadAffix') propContainer: string | HTMLElement = '';
  @Input('offset') propsOffset = -1;
  @Input('zIndex') propsZIndex: number | string = 90; // 不要超过94

  /** 是否计算相对于主要内容的偏移 */
  @Input('calcContentOffset') propsCalcContentOffset = true;
  // @Output() affixScroll = new EventEmitter<{ scrollTop: number; fixed: boolean }>();

  rootData;
  windowHeight;

  private mounted$ = new Subject<void>();

  ngAfterViewInit(): void {
    this.rootData = this.useElementBounding(this.host.nativeElement, { windowScroll: !this.propContainer });

    // TODO：后期待办 - 支持自定义滚动的容器 1. 通过set监听改变重新赋值并监听滚动事件
    // if (this.propContainer) {
    //   this.scrollContainerData = this.useScroll(this.propContainer);
    // }

    this.windowHeight = this.useWindowSize().height;
    this.mounted$.next();
  }

  get fixedTop() {
    const contentOffset = this.propsCalcContentOffset ? this.layout.contentTop$.value : 0;
    return contentOffset + this.propsOffset;
  }

  useWindowSize(options: any = {}) {
    const {
      initialWidth = Infinity,
      initialHeight = Infinity,
      listenOrientation = true,
      includeScrollbar = true,
    } = options;

    const width = { value: initialWidth };
    const height = { value: initialHeight };

    const update = () => {
      if (window) {
        if (includeScrollbar) {
          width.value = window.innerWidth;
          height.value = window.innerHeight;
        } else {
          width.value = window.document.documentElement.clientWidth;
          height.value = window.document.documentElement.clientHeight;
        }

        this.update();
      }
    };

    update();
    useEventListener('resize', update, { passive: true });

    if (listenOrientation) useEventListener('orientationchange', update, { passive: true });

    return { width, height };
  }

  // useScroll(target: any, options: { initialScrollTop?: number } = {}) {
  //   const { initialScrollTop = 0 } = options;
  //
  //   const scrollTop = { value: initialScrollTop };
  //
  //   const update = (event: Event) => {
  //     if (event.target === window.document) {
  //       scrollTop.value = window.document.documentElement.scrollTop;
  //     } else if (event.target) {
  //       scrollTop.value = event.target?.['scrollTop'];
  //     }
  //
  //     this.update();
  //   };
  //
  //   target?.scroll();
  //   useEventListener(target, 'scroll', update, { passive: true });
  //
  //   return { scrollTop };
  // }

  /**
   * 更新函数
   */
  update() {
    this.fixed = this.rootData.top.value <= this.fixedTop + 2;
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
    const { reset = true, windowResize = true, windowScroll = true, immediate = true } = options;

    const height = { value: 0 };
    const bottom = { value: 0 };
    const left = { value: 0 };
    const right = { value: 0 };
    const top = { value: 0 };
    const width = { value: 0 };
    const x = { value: 0 };
    const y = { value: 0 };

    const update = () => {
      const el = target;

      if (!el) {
        if (reset) {
          height.value = 0;
          bottom.value = 0;
          left.value = 0;
          right.value = 0;
          top.value = 0;
          width.value = 0;
          x.value = 0;
          y.value = 0;
        }
        return;
      }

      const rect = el.getBoundingClientRect();

      height.value = rect.height;
      bottom.value = rect.bottom;
      left.value = rect.left;
      right.value = rect.right;
      top.value = rect.top;
      width.value = rect.width;
      x.value = rect.x;
      y.value = rect.y;

      this.update();
    };

    let observer: ResizeObserver | undefined;
    const cleanup = () => {
      if (observer) {
        observer.disconnect();
        observer = undefined;
      }
    };

    cleanup();
    if (window && 'ResizeObserver' in window) {
      observer = new ResizeObserver(update);
      observer!.observe(target, {});
    }

    if (windowScroll) useEventListener('scroll', update, { capture: true, passive: true });
    if (windowResize) useEventListener('resize', update, { passive: true });

    // immediate
    this.mounted$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (immediate) update();
    });

    return {
      height,
      bottom,
      left,
      right,
      top,
      width,
      x,
      y,
      update,
    };
  }
}
