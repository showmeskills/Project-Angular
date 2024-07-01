import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { KycService } from 'src/app/pages/kyc/kyc.service';
import { AccountApi } from 'src/app/shared/apis/account.api';
import { KycApi } from 'src/app/shared/apis/kyc-basic.api';
import { TokenAddressApi } from 'src/app/shared/apis/tokenaddress.api';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { ThirdAuthService } from 'src/app/shared/components/third-auth/third-auth.service';
import { SocialData, SocialListData } from 'src/app/shared/interfaces/account.interface';
import { General2faverifyService } from 'src/app/shared/service/general2faverify.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { LocaleService } from '../../../../shared/service/locale.service';

@UntilDestroy()
@Component({
  selector: 'app-safety-home',
  templateUrl: './safety-home.component.html',
  styleUrls: ['./safety-home.component.scss'],
})
export class SafetyHomeComponent implements OnInit {
  constructor(
    private router: Router,
    private appService: AppService,
    private kycService: KycService,
    private toast: ToastService,
    private popup: PopupService,
    private tokenAddressApi: TokenAddressApi,
    private general2faverifyService: General2faverifyService,
    private localeService: LocaleService,
    private accountApi: AccountApi,
    public thirdAuthService: ThirdAuthService,

    private kycApi: KycApi
  ) {}

  /** UI 当前用户kyc状态 */
  currenKycStatus: string = '';
  /** 当前KYC 等级 默认0 为 没有验证初级 */
  currentKycLevel: number = 0;

  userInfor: any; //用户信息
  modifiedUserName: string = ''; //修改用户名
  accountSub!: Subscription; //订阅用户信息
  refreshSubject!: Subscription;

  /** 社交媒体信息 */
  socialInfo!: SocialListData;

  loading!: boolean;

  /** kyc状态loading */
  kycStatusLoading: boolean = false;

  ngOnInit() {
    // 订阅安全中心 第三放绑定
    this.thirdAuthService.afterVerifyInSafeHome$.pipe(untilDestroyed(this)).subscribe(data => {
      if (data.status) {
        this.toast.show({
          message: `${data.socialUserType}${this.localeService.getValue('bind_success')}`,
          type: 'success',
        });
      } else {
        this.toast.show({
          message: data.message ? data.message : `${data.socialUserType}${this.localeService.getValue('bind_fail')}`,
          type: 'fail',
        });
      }
      this.initSocialInfo();
    });
    this.accountSub = this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe(x => {
      this.userInfor = x;
    });
    this.initUserInfo();
    this.initSocialInfo();
    this.onGetKycStatus();
  }

  initUserInfo() {
    this.loading = true;
    this.accountApi.getUserAccountInfor().subscribe(res => {
      if (res?.data) {
        this.loading = false;
        this.appService.userInfo$.next(res.data);
      }
    });
  }

  /** 获取用户当前KYC状态 */
  onGetKycStatus() {
    this.kycStatusLoading = true;
    this.kycApi.getUserKycStatus().subscribe(data => {
      if (data.length > 0) {
        const currenKycStatus = this.kycService.checkUserKycStatus(data);
        this.currenKycStatus = currenKycStatus.kycStatusName;
        this.currentKycLevel = currenKycStatus.level;
      }
      this.kycStatusLoading = false;
    });
  }

  /**
   * 邮箱展示保留前三位
   *
   * @param email
   * @returns masked 邮箱
   */
  getMaskedEmail(email: string): string {
    if (!email.length) return '';
    const atIndex = email.indexOf('@');
    return `${email.substring(0, 3)}${email.slice(3, atIndex).replace(/./g, '*')}${email.substring(atIndex)}`;
  }

  /** 初始化社交媒体的值 */
  initSocialInfo() {
    this.accountApi.getSocialList().subscribe(data => {
      if (data) {
        this.socialInfo = data;
      }
    });
  }

  //手机更改
  handleReset() {
    this.router.navigate([this.appService.languageCode, 'verification', 'reset-phone']);
  }

  // 手机绑定器
  handleMobile(type: any) {
    if (type) {
      // // 确认弹窗
      // this.popup.open(StandardPopupComponent, {
      //   speed: 'faster', data: {
      //     type: 'warn',
      //     content: this.localeService.getValue('unbind_phone'),
      //     description: this.localeService.getValue('open_act'),
      //     callback: () => {
      //       //再次判断是否已绑谷歌，未绑定显示提示，已绑才允许解绑手机
      //       if (this.userInfor.isBindGoogleValid) {
      //         //进入手机解绑
      //         this.router.navigate([this.appService.languageCode, "verification", "disable-phone"])
      //       } else {
      //         this.popup.open(StandardPopupComponent, {
      //           speed: 'faster', data: {
      //             type: 'warn',
      //             content: this.localeService.getValue('safe_hints'),
      //             description: this.localeService.getValue('un_bind_google'),
      //             buttons: [{ text: this.localeService.getValue('off_button'), primary: true }]
      //           }
      //         });
      //       }
      //     }
      //   }
      // });
    } else {
      //进入手机验证器
      this.router.navigate([this.appService.languageCode, 'verification', 'enable-phone']);
    }
  }

  // 谷歌绑定器
  handleGoogle(type: any) {
    if (type) {
      // 确认弹窗
      this.popup.open(StandardPopupComponent, {
        speed: 'faster',
        data: {
          type: 'warn',
          content: this.localeService.getValue('un_google'),
          description: this.localeService.getValue('open_act'),
          callback: () => {
            //进入google解绑
            this.router.navigate([this.appService.languageCode, 'verification', 'disable-google']);
          },
        },
      });
    } else {
      //进入google验证器
      this.router.navigate([this.appService.languageCode, 'verification', 'enable-google']);
    }
  }

  /**
   * 绑定或者解绑 邮箱
   *
   * @param type
   */
  handleEmail(type: boolean) {
    if (type) {
      // 解绑 邮箱
      // 如果用户未绑定手机 弹出 提示
      if (!this.userInfor.isBindMobile) {
        this.popup.open(StandardPopupComponent, {
          speed: 'faster',
          data: {
            type: 'warn',
            content: this.localeService.getValue('safe_hints'),
            description: this.localeService.getValue('email_popup_dec'),
            buttons: [{ text: this.localeService.getValue('binding'), primary: true }],
            callback: () => {
              this.router.navigate([this.appService.languageCode, 'verification', 'enable-phone']);
            },
          },
        });
        return;
      }
      // 如果用户绑定手机， 前往解绑页面
      this.router.navigate([this.appService.languageCode, 'verification', 'disable-email']);
    } else {
      // 绑定 邮箱
      this.router.navigate([this.appService.languageCode, 'verification', 'enable-email']);
    }
  }

  // 开关提现白名单
  updateWhiteliststatus(on: boolean) {
    //确认弹窗
    this.popup.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        type: 'warn',
        content: on ? this.localeService.getValue('sure_turn') : this.localeService.getValue('sure_close'),
        description: on ? this.localeService.getValue('only_ws') : this.localeService.getValue('close_func_info'),
        callback: () => {
          //2fa验证
          this.general2faverifyService.launch('WhiteListSwitch').subscribe(verifyStatus => {
            if (verifyStatus.status) {
              //正式请求
              this.tokenAddressApi.updateWhiteliststatus(verifyStatus.key).subscribe(res => {
                if (res?.success && res?.data) {
                  this.toast.show({
                    type: 'success',
                    message: on ? this.localeService.getValue('w_open') : this.localeService.getValue('w_close'),
                  });
                  //更新信息
                  this.userInfor.hasWhiteList = on;
                } else {
                  this.toast.show({
                    message: on
                      ? this.localeService.getValue('w_open_failed')
                      : this.localeService.getValue('w_close_failed'),
                    type: 'fail',
                  });
                }
              });
            }
          });
        },
      },
    });
  }

  /**
   * 第三方 安全绑定和解绑
   *
   * @param item
   */
  onThirdAuth(item: SocialData) {
    if (item.isBinded) {
      // 解绑
      this.unBindSocial(item.socialUserType);
    } else {
      // 绑定
      this.onBindSocial(item.socialUserType);
    }
  }

  /** tg绑定弹窗底部 */
  @ViewChild('tgfooter') tgfooter!: TemplateRef<unknown>;
  /** tg绑定弹窗 */
  tgPop?: MatDialogRef<unknown>;
  /** tg绑定弹窗-loading */
  tgLoading!: boolean;

  /** tg绑定弹窗-取消 */
  closeTgPop() {
    this.tgPop?.close();
  }

  /** tg绑定弹窗-确认 */
  tgConfirm() {
    if (!this.tgPop) return;
    this.tgLoading = true;
    this.tgPop.disableClose = true;
    this.thirdAuthService.telegramAuth(false, () => {
      // 进入接口发送阶段,关闭确认弹窗
      this.tgLoading = false;
      this.closeTgPop();
    });
  }

  /**
   * 绑定第三方
   *
   * @param socialUserType  解绑对象
   */
  onBindSocial(socialUserType: 'Google' | 'Telegram' | 'Line' | 'MetaMask') {
    // 用户绑已经绑定手机号 跳转解绑页面
    let content!: string; /** 弹窗内容  */
    let description!: string; /** 弹窗描述 */
    switch (socialUserType) {
      case 'Google':
        content = 'need_bing_google';
        description = 'after_bind_google';
        break;
      case 'Telegram':
        content = 'need_bind_tg';
        description = 'after_bind_tg';
        break;
      case 'MetaMask':
        content = 'need_bind_meta';
        description = 'after_bind_meta';
        break;
      case 'Line':
        content = 'need_bind_line';
        description = 'after_bind_line';
        break;
      default:
        break;
    }
    if (socialUserType === 'Telegram') {
      this.tgLoading = false;
      this.tgPop = this.popup.open(StandardPopupComponent, {
        speed: 'faster',
        data: {
          type: 'warn',
          content: this.localeService.getValue(content),
          description: this.localeService.getValue(description),
          inputFooter: this.tgfooter,
        },
      });
    } else {
      this.popup.open(StandardPopupComponent, {
        speed: 'faster',
        data: {
          type: 'warn',
          content: this.localeService.getValue(content),
          description: this.localeService.getValue(description),
          callback: () => {
            switch (socialUserType) {
              case 'Google':
                this.thirdAuthService.googleAuth(false);
                break;
              case 'MetaMask':
                this.thirdAuthService.metaAuth(false);
                break;
              case 'Line':
                this.thirdAuthService.lineAuth(false);
                break;
              default:
                break;
            }
          },
        },
      });
    }
  }

  /**
   * 解绑 第三方
   *
   * @param socialUserType  解绑对象
   */
  unBindSocial(socialUserType: 'Google' | 'Telegram' | 'Line' | 'MetaMask') {
    // 用户 未绑定手机
    if (!this.userInfor.isBindMobile) {
      this.popup.open(StandardPopupComponent, {
        speed: 'faster',
        data: {
          type: 'warn',
          description: this.localeService.getValue('acc_not_bind_phone'),
          buttons: [
            { text: this.localeService.getValue('cancels'), primary: false },
            { text: this.localeService.getValue('binding'), primary: true },
          ],
          callback: () => this.router.navigate([this.appService.languageCode, 'verification', 'enable-phone']),
        },
      });
      return;
    }

    // 用户 是否设置密码
    if (!this.userInfor.hasPassword) {
      this.popup.open(StandardPopupComponent, {
        speed: 'faster',
        data: {
          type: 'warn',
          description: this.localeService.getValue('not_password'),
          buttons: [
            { text: this.localeService.getValue('cancels'), primary: false },
            { text: this.localeService.getValue('confirm_button'), primary: true },
          ],
          callback: () => this.router.navigateByUrl(`${this.appService.languageCode}/security/reset-password`),
        },
      });
      return;
    }

    // 用户绑已经绑定手机号 跳转解绑页面
    let content!: string; /** 弹窗内容  */
    let description!: string; /** 弹窗描述 */
    switch (socialUserType) {
      case 'Google':
        content = 'dis_google';
        description = 'not_ava_google';
        break;
      case 'Telegram':
        content = 'dis_telegram';
        description = 'not_ava_telegram';
        break;
      case 'MetaMask':
        content = 'dis_matemask';
        description = 'not_ava_matemask';
        break;
      case 'Line':
        content = 'dis_line';
        description = 'not_ava_line';
        break;
      default:
        break;
    }
    this.popup.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        type: 'warn',
        content: this.localeService.getValue(content),
        description: this.localeService.getValue(description),
        callback: () => {
          const data = this.socialInfo.socialInfoList.find(item => item.socialUserType === socialUserType);
          this.thirdAuthService.unBindSocialData$.next({
            ...data,
            mobile: this.socialInfo.mobile,
            areaCode: this.socialInfo.areaCode,
          });
          this.router.navigate([this.appService.languageCode, 'verification', 'disable-social']);
        },
      },
    });
  }
}
