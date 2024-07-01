import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { BehaviorSubject, Observable, Subject, from, fromEvent, merge } from 'rxjs';
import { distinctUntilChanged, filter, map, pairwise, share, startWith, tap } from 'rxjs/operators';
import { routeReuseSubject, routeStoreSubject } from 'src/app/custom-reuse-strategy';
import { HomeComponent } from 'src/app/pages/home/home.component';

export interface GlobalSizeChange {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private route: ActivatedRoute,
    private deviceService: DeviceDetectorService,
  ) {
    // 监控宽度变化，订阅时请注意可能需要增加 debounceTime()
    this.resize$ = fromEvent(window, 'resize').pipe(
      tap(() => {
        const isMobile = this.deviceService.isMobile(navigator.userAgent);
        if (isMobile != this.isMobile$.value) {
          this.isMobile$.next(isMobile);
        }
      }),
      map(() => [document.body.offsetWidth, document.body.offsetHeight]),
      share(),
    );

    // 监测是否是h5
    this.breakpointObserver
      .observe(['(max-width: 767px)'])
      .pipe(
        map((state: BreakpointState) => state.matches),
        distinctUntilChanged(),
      )
      .subscribe(this.isH5$);

    // 监测当前页面是哪个
    from(this.router.events)
      .pipe(
        filter(e => e instanceof NavigationEnd),
        map(() => this.matchComponent()),
      )
      .subscribe(this.page$);

    // 监听页面是否可见
    fromEvent(document, 'visibilitychange')
      .pipe(
        map(() => document.visibilityState),
        startWith(document.visibilityState),
        map(v => v === 'visible'),
        distinctUntilChanged(),
        pairwise(),
      )
      .subscribe(([preVisibility, visibility]) => {
        if (preVisibility && !visibility) {
          // 失去焦点
          this.pageVisible$.next('blur');
        } else if (!preVisibility && visibility) {
          // 获得焦点
          this.pageVisible$.next('focus');
        }
      });
  }

  isH5$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isMobile$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.deviceService.isMobile());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  resize$!: Observable<number[]>;
  h5Keyboard$: Subject<boolean> = new Subject(); // 移动设备软键盘弹出，由底部栏提供支持

  /**统计面板 */
  statisticsPanelState$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  leftMenuState$: Subject<boolean> = new Subject<boolean>();
  leftMenuTransition$: Subject<'start' | 'end'> = new Subject<'start' | 'end'>();
  leftMenuInvisible$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  leftMenuBackdrop$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**layout滚动条滑动时，距离顶部的数值 */
  scrollTop$: BehaviorSubject<number> = new BehaviorSubject(0);
  /**layout禁止滚动 */
  lockLayoutScroll$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**h5底部菜单隐藏 */
  h5BottomMenuHide$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**页面可见改变（只有变化了才会触发） */
  pageVisible$: Subject<'blur' | 'focus'> = new Subject<'blur' | 'focus'>();

  public matchComponent() {
    const currentComponent = this.getComponent(this.route);
    switch (currentComponent) {
      case HomeComponent:
        return 'home';
      default: {
        const pathArray = window.location.pathname.split('/');
        if (
          pathArray.length == 3 &&
          pathArray[0] == '' &&
          ['login', 'register', 'forget-password'].includes(pathArray[2].toLowerCase())
        ) {
          return pathArray[2].toLowerCase().replace('forget-password', 'password');
        }
        return currentComponent;
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getComponent(data: any): any {
    if (data.firstChild) {
      return this.getComponent(data.firstChild);
    } else {
      return data.component;
    }
  }

  // 获取当前路由的组件树,以数组返回
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getComponentTree(data?: any, tree: any[] = []): any[] {
    if (data) {
      data.component && tree.push(data.component);
      if (data.firstChild) {
        return this.getComponentTree(data.firstChild, tree);
      } else {
        return tree;
      }
    } else {
      return this.getComponentTree(this.route);
    }
  }

  //获取元素尺寸观察订阅
  resizeObservable(elem: HTMLElement) {
    return new Observable<ResizeObserverEntry>(subscriber => {
      const ro = new ResizeObserver(entries => {
        window.requestAnimationFrame(() => {
          subscriber.next(entries[0]);
        });
      });
      ro.observe(elem);
      return () => ro.disconnect();
    });
  }

  //获取元素相交观察订阅
  intersectionObservable(
    elem: HTMLElement,
    root: HTMLElement | null = null,
    threshold: number = 1,
    rootMargin: string = '0px 0px 0px 0px',
  ) {
    return new Observable<IntersectionObserverEntry>(subscriber => {
      const ro = new IntersectionObserver(
        (entries: IntersectionObserverEntry[]) => {
          subscriber.next(entries[0]);
        },
        {
          root: root,
          rootMargin: rootMargin,
          threshold: threshold,
        },
      );
      ro.observe(elem);
      return () => ro.disconnect();
    });
  }

  //获取元素观察订阅
  mutationObserver(elem: HTMLElement, config?: MutationObserverInit) {
    return new Observable<MutationRecord[]>(subscriber => {
      const mo = new MutationObserver((mutations: MutationRecord[]) => {
        subscriber.next(mutations);
      });
      mo.observe(elem, config);
      return () => mo.disconnect();
    });
  }

  /**页面复用状态 */
  private pageReuseState: Map<string, string> = new Map();

  /**
   * 获取路由复用监听
   *
   * @param url 要监听的路由地址
   * @param match 匹配模式
   * @returns //
   */
  watchPageReuse(url: string | string[], match: 'all' | 'full' | 'include' = 'full') {
    return merge(
      routeReuseSubject.pipe(
        filter(x => x !== null),
        distinctUntilChanged((a, b) => a === b && this.pageReuseState.get(b as string) === 'enter'),
        tap(x => {
          this.pageReuseState.set(x as string, 'enter');
        }),
        map(x => ({
          type: 'enter',
          value: x,
        })),
      ),
      routeStoreSubject.pipe(
        filter(x => x !== null),
        distinctUntilChanged((a, b) => a === b && this.pageReuseState.get(b as string) === 'leave'),
        tap(x => {
          this.pageReuseState.set(x as string, 'leave');
        }),
        map(x => ({
          type: 'leave',
          value: x,
        })),
      ),
    ).pipe(
      filter(x => {
        switch (match) {
          case 'all':
            return true;
          case 'full':
            return x.value === url;
          case 'include':
            if (url instanceof Array) {
              return url.some(y => Boolean(x.value?.includes(y)));
            } else {
              return Boolean(x.value?.includes(url));
            }
          default:
            return false;
        }
      }),
    );
  }
}
