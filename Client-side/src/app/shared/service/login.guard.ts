import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { LocalStorageService } from './localstorage.service';

@Injectable({ providedIn: 'root' })
export class LoginGuard {
  constructor(
    private appService: AppService,
    private router: Router,
    private localStorageService: LocalStorageService,
  ) {}

  async canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.localStorageService.loginToken) {
      if (this.localStorageService.nowUrl) {
        const nowCode = this.localStorageService.nowUrl.split('/')[2];
        if (nowCode === 'login' || nowCode === 'register' || nowCode === 'forget-password') {
          //转到首页
          this.router.navigateByUrl(`/${this.appService.languageCode}`);
        } else {
          const replaceUrl = ['login', 'register', 'forget-password'].some(x => state.url.includes(x));
          //转到登录之前界面
          this.router.navigateByUrl(
            `/${
              ['inviteCode', 'aff'].some(x => this.localStorageService.nowUrl.includes(x))
                ? this.localStorageService.nowUrl.split('?')[0]
                : this.localStorageService.nowUrl
            }`,
            { replaceUrl: replaceUrl },
          );
        }
      } else {
        //转到首页
        this.router.navigateByUrl(`/${this.appService.languageCode}`);
      }
      return false;
    }
    return true;
  }
}
