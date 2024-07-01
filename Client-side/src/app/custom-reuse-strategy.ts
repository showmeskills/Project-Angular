/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActivatedRouteSnapshot, DetachedRouteHandle, Route, RouteReuseStrategy } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

/** 如果有路由复用了就会触发(路由进入) */
export const routeReuseSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

/** 如果有路由缓存了就会触发(路由离开) */
export const routeStoreSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export class CustomReuseStrategy implements RouteReuseStrategy {
  /**每个页面缓存有效的时间 */
  private duration = 5 * 60 * 1000;

  /**缓存的路由数据池 */
  private routeHandles: Map<
    Route,
    {
      handle: DetachedRouteHandle;
      expirationTime: number;
    }
  > = new Map();

  /**
   * 路由变化时会调用，判断是否同一个路由，决定后续复用策略是否执行
   *
   * @param future
   * @param curr
   * @returns -
   */
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  /**
   * 路由离开时候，判断是否要保持活着（以便复用）
   *
   * @param route
   * @returns -
   */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return Boolean(route.data?.keep);
  }

  /**
   * 路由离开时候，如果需要复用，就会触发，把页面存起来
   *
   * @param route
   * @param handle
   * @returns -
   */
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    if (!route.routeConfig) return;
    if (handle) routeStoreSubject.next(this.getUrl(handle));
    // 检查缓存里是否已存在，不存在时才会存进去
    if (!this.routeHandles.has(route.routeConfig)) {
      this.routeHandles.set(route.routeConfig, {
        handle: handle,
        expirationTime: Date.now() + this.duration,
      });
    } else {
      if ((<any>this.routeHandles.get(route.routeConfig)?.handle)?.componentRef?.hostView?.destroyed) {
        this.routeHandles.delete(route.routeConfig);
      }
    }
  }

  /**
   * 判断是否存在匹配的页面缓存，或是否已失效等
   *
   * @param route
   * @returns -
   */
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    if (!route.routeConfig) return false;
    const handle = this.routeHandles.get(route.routeConfig);
    if (handle) {
      // 判断缓存是否过期，如果已过期就删掉,并返回状态
      const expired = handle.expirationTime < Date.now();
      if (expired) {
        this.routeHandles.delete(route.routeConfig);
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  /**
   * 前面确认可以复用，执行从缓存里拿出来复用
   *
   * @param route
   * @returns -
   */
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (!route.routeConfig) return null;
    const handle = this.routeHandles.get(route.routeConfig);
    if (handle) {
      routeReuseSubject.next(this.getUrl(handle.handle));
      return handle.handle;
    } else {
      return null;
    }
  }

  /**
   * 获取缓存的url路径
   *
   * @param handle
   * @returns /
   */
  private getUrl(handle: DetachedRouteHandle) {
    try {
      return (handle as any).route.value.snapshot.pathFromRoot
        .map((x: any) => x.url.map((y: any) => y.path))
        .flat()
        .slice(1)
        .join('/');
    } catch (error) {
      return null;
    }
  }
}
