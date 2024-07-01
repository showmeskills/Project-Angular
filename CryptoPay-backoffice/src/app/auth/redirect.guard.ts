import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { AppService } from '../app.service';

@Injectable({ providedIn: 'root' })
/**
 * 路由守卫（做重定向使用）
 */
export class RedirectGuard {
  constructor(private router: Router, private lang: LangService, private appService: AppService) {}

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // 如果已有语言
    if (this.lang.supportLang.some((lang) => state.url.slice(1).startsWith(lang + '/'))) return true;

    // 如果只有语言根进行重定向
    if (this.lang.supportLang.some((e) => '/' + e === state.url)) {
      // TODO 去第一个有权限的页面 通过menu去取 后期做权限的时候添加
      this.router.navigate([...state.url.split('/'), 'dashboard']);
      return false;
    }

    // 重定向到正确的带有语言的路径
    this.processUrl(state);

    return false;
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // 如果已有语言
    if (this.lang.supportLang.some((lang) => state.url.slice(1).startsWith(lang + '/'))) return true;

    if (state.url === '/') return this.router.navigate([this.lang.currentLang]);

    // 重定向到正确的带有语言的路径
    this.processUrl(state);

    return false;
  }

  private processUrl(state: RouterStateSnapshot) {
    const publicPath = this.appService.publicPath.find((e) => state.url.startsWith(e + '/'));

    if (publicPath) {
      this.router.navigate([this.lang.currentLang, ...publicPath.split('/').filter((e) => e)]);
    } else {
      this.router.navigateByUrl(this.router.parseUrl('/' + this.lang.currentLang + state.url));
    }
  }
}
