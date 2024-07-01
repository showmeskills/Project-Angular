import { Injectable } from '@angular/core';
import { AppService } from '../app.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private appService: AppService,
    private ls: LocalStorageService
  ) {}

  public permissions: any[] = []; //当前登录的用户权限
  public userName!: string;
  public platformId!: number;
  public isSuperAdmin!: boolean;

  checkPermission(code: string): boolean {
    // if (!this.userName) return true;

    const res = this.ls.getMenuByCode(code);

    if (res) {
      return res.hidden === false && res.state === 'Enabled';
    }

    return false;
  }

  // private async getUserInfo(){
  //   var testPermissions = [
  //     "dashboard.analysis",
  //     "currency.parameter",
  //     "currency.allocation",
  //     "example.list",
  //     "example.delete",
  //     "example.edit",
  //     "example.create",
  //     "order.withdraw",
  //     "order.deposit",
  //     "order.exchange",
  //     "user.userlist",
  //     "settings.operation-log",
  //     "settings.platform-account",
  //     "settings.authority-management",
  //     "settings.currency-parameter",
  //     "settings.role",
  //     "platform.list",
  //     "user.asset",
  //     "parameter.delete",
  //     "parameter.edit",
  //     "allocation.delete",
  //     "allocation.edit",
  //     "allocation.create",
  //     "allocation-detail.edit"
  //   ];
  //   // this.appService.token = queryParams.token;
  //   var userInfo = await this.accountApi.getUserInfo().toPromise();
  //     if (userInfo) {
  //       this.userName = userInfo.userName;
  //       this.isAdmin = userInfo.userType == 0;
  //       this.permissions = userInfo.permissions;
  //       this.permissions.push(...testPermissions);
  //       return;
  //     }
  //   this.appService.jumpToLogin();
  // }
}
