import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';
import { matchPathList } from './match-list';

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  storedRouteHandles = new Map<string, DetachedRouteHandle>();
  future = '';
  curr = '';
  keepPathList = matchPathList;

  /**
   * 进入路由触发，判断是否为同一路由
   * @param future 前往的路由
   * @param curr 离开的路由
   * @returns true：路由没有变化，不会执行‘其他缓存’方法； flase：路由发生变化，执行‘其他缓存’方法
   */
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    if (future.routeConfig) {
      this.future = this.getPath(future);
      // console.log('前往的路由-path:', this.getPath(future));
    }
    if (curr.routeConfig) {
      this.curr = this.getPath(curr);
      // console.log('离开的路由-path:', this.getPath(curr));
    }
    return future.routeConfig === curr.routeConfig && JSON.stringify(future.params) === JSON.stringify(curr.params);
  }

  /**
   * 路由离开时，判断是否要缓存该路由
   * @param route 当前该路由信息
   * @returns true：会调用store方法，进行缓存；
   */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    /**
     * 考虑后台页面数据交叉繁多，改为单独指定页面做缓存策略
     * 1. 路由配置项增加 keep: true
     * 2. 未来路由地址必须含 编辑,详情 页等
     * 3. 通过 字段keep = true 和 未来路由含有 编辑,详情 页等，才能缓存页面
     */
    const futurePathList = this.keepPathList.map((v) => v.future);
    // console.log('shouldDetach:是否缓存离开的路由', futurePathList.includes(this.future) && route.data['keep']);
    if (futurePathList.includes(this.future) && route.data['keep']) {
      return true;
    }
    return false;
  }

  /**
   * 缓存路由
   * @param route 当前该路由信息
   * @param detachedTree 已分离的路由树（组件当前的实例对象）
   * @returns 当前路由path作为key存储 路由快照 = 组件当前的实例对象
   */
  store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void {
    // console.log('store:缓存离开的路由', detachedTree);
    this.storedRouteHandles.set(this.getPath(route), detachedTree);
  }

  /**
   * 进入路由时被调用，判断当前路由是否有缓存 及 是否允许释放缓存
   * @param route 当前该路由信息
   * @returns true：调用retrieve方法； flase: 组件会被重新创建
   */
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const path = this.getPath(route);
    /**
     * 当列表路由被储存，从匹配的 详情，编辑 路由返回【被储存的列表路由】才能允许 释放储存路由
     * 1. 根据 详情/编辑 路由匹配 列表 路由
     * 2. 根据 匹配到的列表路由 是否等于 未来路由
     */
    const matchPath = this.keepPathList.find((v) => v.future === this.curr);
    // console.log(
    //   'shouldAttach：判断当前路由是否有缓存的内容：',
    //   !!this.storedRouteHandles.get(path),
    //   '是否允许释放缓存:',
    //   !!matchPath && matchPath['curr'] === path
    // );
    if (this.storedRouteHandles.get(path)) {
      return !!matchPath && matchPath['curr'] === path;
    }
    return false;
  }

  /**
   * 取出缓存
   * @param route 当前该路由信息
   * @returns 取出当前路由缓存，实现页面缓存策略
   */
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    // console.log('retrieve： 取出缓存', this.storedRouteHandles.get(this.getPath(route)) as DetachedRouteHandle);
    return this.storedRouteHandles.get(this.getPath(route)) as DetachedRouteHandle;
  }

  private getPath(route: ActivatedRouteSnapshot): any {
    if (route.routeConfig !== null && route.routeConfig.path !== null) {
      return route.routeConfig.path;
    }
    return '';
  }
}
