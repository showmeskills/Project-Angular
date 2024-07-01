import { Injectable } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { LocaleService } from './locale.service';

type Method =
  | 'changeTitle'
  | 'webToNativeLogin'
  | 'openNativeCustomerService'
  | 'openNativeKYC'
  | 'backToNative'
  | 'appLockTitleMoney'
  | 'appUnLockTitleMoney'
  | 'appCurrentMoney';
@Injectable({
  providedIn: 'root',
})
export class NativeAppService {
  constructor(private appService: AppService, private localeService: LocaleService) {}
  private customizedWindow = window as any;

  /**
   * 修改H5 页面的title 传给原生APP
   *
   * @param method changeTitle | webToNativeLogin | openNativeCustomerService | openNativeKYC | appLockTitleMoney | appUnLockTitleMoney | appCurrentMoney
   * @param args 传入参数
   */
  appAction(method: Method, args: null | object = null) {
    if (!this.customizedWindow?.WebViewSDK?.actionApp || !this.appService.isNativeApp) return;
    this.customizedWindow['WebViewSDK']['actionApp']({
      method,
      args,
    });
  }

  /** js 自定义事件 app 调用; 原生那边 强力要求额需要这个方法 */
  webAction() {
    this.customizedWindow['setWebToken'] = (token: string) => {
      this.appService.logged(token);
    };
  }

  /**
   * 原生app 设置H5 联盟页头
   *
   * @param title
   */
  setNativeTitle(title: string) {
    this.appAction('changeTitle', {
      title: this.localeService.getValue(title),
    });
  }

  /** 竞猜 未登录 */
  setNoLogin() {
    this.appAction('webToNativeLogin');
  }

  /** 原生客服响应 */
  setNativeOlService() {
    this.appAction('openNativeCustomerService');
  }

  /** 原生访问 KYC */
  setNativeKyc() {
    this.appAction('openNativeKYC');
  }

  /** 原生返回游戏大厅/或者其他返回 */
  onNativeBack() {
    this.appAction('backToNative');
  }

  /**
   * 原生app进入原创 开始游戏后，顶部余额加锁或者解锁，前端自己计算余额变化
   *
   * @param type
   */
  onLockTitleMoney(type: boolean) {
    this.appAction('appLockTitleMoney', { lockState: type });
  }
  /**
   * 原生app进入原创  前端自己计算余额变化
   *
   * @param currency
   * @param balance
   */
  onCurrentMoney(currency: string, balance: number) {
    this.appAction('appCurrentMoney', { currency: currency, balance: balance });
  }
}
