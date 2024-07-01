import { Injectable, Type } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AppService } from '../app.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(private authService: AuthService, private appService: AppService, private router: Router) {}
  ///Component 对应的权限字符串
  private localPermissions: any[] = [
    // { component: ListComponent, permission: "example.list" },
    // { component: AuthorityManagementComponent, permission: "settings.authority-management" },
  ];

  canActivateChild(route: ActivatedRouteSnapshot /*, state: RouterStateSnapshot*/) {
    // if (route.firstChild?.component) {
    //   const permission = this.getPermission(route.firstChild?.component);
    //   if (permission) {
    //     if (this.authService.checkPermission(permission)) {
    //       return true;
    //     }
    //   }
    //   this.appService.jumpToLogin();
    //   return false;
    // }
    const code = route.data['code'];

    if (code) {
      // 仪表盘必须要有权限，这里会拿不到权限还没拿到权限数据，所以默认跳转到仪表盘
      if (code === '1') {
        // path = this.menu.getFirstMenuPath();
        // if (!path) {
        //   this.appService.showToastSubject.next({ msg: '没有可用导航' });
        //   return false;
        // }
        return true;
      }

      const res = this.authService.checkPermission(code);

      if (!res) {
        this.appService.showToastSubject.next({ msgLang: 'common.permissionFail' });

        if (this.router.url === '/') {
          let path = '/';

          this.router.navigate([path]);
          return true;
        }

        return false;
      }
    }

    return true;
  }

  /**
   * 根据Component获取对应的权限字符串
   * @param component 要访问的Component
   * @returns string 权限字符串
   */
  private getPermission(component: string | Type<any> | null) {
    const permission = this.localPermissions.find((x) => x.component === component);
    return permission?.permission;
  }
}
