import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { AppService } from '../app.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';

@Injectable({ providedIn: 'root' })
/**
 * 路由守卫（做重定向使用）
 */
export class RedirectGuard {
  constructor(
    private router: Router,
    private lang: LangService,
    private appService: AppService,
    private ls: LocalStorageService
  ) {}

  /**
   * 是否激活子路由，路由守卫（做重定向使用）
   * @param route
   * @param state
   */
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // 如果已有语言
    if (this.lang.supportLang.some((lang) => state.url.slice(1).startsWith(lang + '/'))) return true;

    // 如果只有语言根进行重定向
    if (this.lang.supportLang.some((e) => '/' + e === state.url)) {
      // TODO 去第一个有权限的页面 通过menu去取 后期做权限的时候添加
      this.router.navigate([...state.url.split('/'), 'dashboard']);
      return false;
    }

    return this.processUrl(state);
  }

  /**
   * 是否激活路由，路由守卫（做重定向使用）
   * @param route
   * @param state
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.processUrl(state);
  }

  private processUrl(state: RouterStateSnapshot) {
    const pathArr = state.url.slice(1).split('/');
    const firstPath = pathArr?.[0];
    let path = state.url;

    // 如果是比对缓存的语言成功
    if (this.ls.lang === firstPath) return true;

    // 如果是根或空路径 调到默认语言再根据上面的判断跳转到有权限的首页
    if (['/', '', null, undefined].includes(state.url)) return this.router.navigate([this.ls.lang]);

    // 如果是合法的语言根但不是缓存的语言，去除语言根，再跳转到正确的语言根+路径
    if (this.lang.supportLang.some((e) => e === firstPath)) {
      path = '/' + pathArr.slice(1).join('/'); // 去除不符合的语言根，拿到干净的路径
    }

    // 如果是白名单的路径，直接跳转到正确的语言根+路径
    const whitePath = this.appService.publicPath.find((e) => state.url.startsWith(e + '/'));
    if (whitePath) {
      this.router.navigate([this.ls.lang, ...whitePath.split('/').filter((e) => e)]);
    } else {
      this.router.navigateByUrl(this.router.parseUrl('/' + this.ls.lang + path));
    }

    return false;
  }
}
