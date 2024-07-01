import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject, Subject, Subscription, fromEvent } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { AuthApi } from '../../apis/auth.api';
import { SocialUserLoginData } from '../../interfaces/auth.interface';
import { ResponseData } from '../../interfaces/response.interface';
import { LocaleService } from '../../service/locale.service';
import { PopupService } from '../../service/popup.service';
import { SentryService } from '../../service/sentry.service';
import { StandardPopupComponent } from '../standard-popup/standard-popup.component';

type Data = {
  content: string;
  description: string;
};

@Injectable({
  providedIn: 'root',
})
export class ThirdAuthService {
  constructor(
    private appService: AppService,
    private authApi: AuthApi,
    private popup: PopupService,
    private localeService: LocaleService,
    private sentryService: SentryService,
  ) {}

  /**统一弹窗名字 */
  thirdAuthPopup: string = 'THIRD_AUTH_POPUP';

  /**统一弹窗尺寸 */
  popupWidth = 600;
  popupHeight = 600;

  /**获取统一弹窗尺寸描述字符串 */
  getPopupConfig() {
    const top = window.screen.height / 2 - this.popupHeight / 2;
    const left = window.screen.width / 2 - this.popupWidth / 2;
    return `width=${this.popupWidth},height=${this.popupHeight},top=${top},left=${left},resizable=yes`;
  }

  get thirdAuthLink(): any {
    return JSON.parse(this.appService.tenantConfig.config?.thirdAuth || '{}');
  }

  /** 解绑所需要的 数据 */
  unBindSocialData$ = new BehaviorSubject<{} | null>(null);

  /** 第三方验证完后调用我们的接口 */
  afterVerify$: Subject<ResponseData<SocialUserLoginData>> = new Subject();

  /** 在安全中心绑定账号 */
  afterVerifyInSafeHome$: Subject<{ status: boolean; socialUserType: string; message: string }> = new Subject();

  /** 用户第三方登录后 选择注册 */
  userRegister: boolean = false;

  /** 从登录跳转到注册 页面把参数传过去 */
  verifyData!: ResponseData<SocialUserLoginData>;

  /** 已绑定且注册的用户 在注册页面中点击第三方注册 需要回到登录进行自动登录  */
  userLogin: boolean = false;

  /** isPopuped 弹窗是否已经出现过 */
  isPopuped: boolean = false;

  /**
   * google验证
   *
   * @param isRegLogPage 是不是在注册或者登录页面
   */
  googleAuth(isRegLogPage: boolean = true) {
    if (!this.thirdAuthLink.googleLink) return;
    window.open(
      this.thirdAuthLink.googleLink.replace('{{DOMAIN}}', window.location.origin),
      this.thirdAuthPopup,
      this.getPopupConfig(),
    );
    const googleMessage = (event: any) => {
      if (event?.source?.location?.href?.includes('thirdauth')) {
        if (event?.data) {
          const { code, state } = event.data;
          window.removeEventListener('message', googleMessage);
          if (code && state) {
            // 在注册/登录界面调用
            if (isRegLogPage) {
              this.authApi
                .verifyLogin({
                  callBackUrl: `${window.location.origin}/thirdauth/index.html`,
                  code,
                  state,
                  userType: 'Google',
                })
                .subscribe(data => this.afterVerify$.next({ ...data, socialUserType: 'Google' }));
            }

            // 在安全中心绑定
            if (!isRegLogPage) {
              this.authApi
                .socialUserBind({
                  callBackUrl: `${window.location.origin}/thirdauth/index.html`,
                  code,
                  state,
                  userType: 'Google',
                })
                .subscribe(response =>
                  this.afterVerifyInSafeHome$.next({
                    status: response.data,
                    socialUserType: 'Google',
                    message: response.message,
                  }),
                );
            }
          }
        }
      }
    };
    window.addEventListener('message', googleMessage, false);
  }

  /**
   * 狐狸验证
   *
   * @param isRegLogPage  是不是在注册或者登录页面
   */
  metaAuth(isRegLogPage: boolean = true) {
    /** 动态引用web3的js */
    this.appService.loadExternalScript(`assets/scripts/web3.min.js`, `Web3`, () => {
      // @ts-ignore
      if (window.MetaMaskSDK.MetaMaskSDK) {
        // @ts-ignore
        const MMSDK = new window.MetaMaskSDK.MetaMaskSDK();
        const ethereum = MMSDK.getProvider();
        ethereum
          .request({ method: 'eth_requestAccounts' })
          .then((result: any) => {
            const address = result[0];
            console.log('address:', address);
            // alert('錢包連接成功');
            this.authApi.getNonce(address).subscribe(nonceRes => {
              const nonce = nonceRes.data;
              if (nonce) {
                // @ts-ignore
                ethereum
                  .request({
                    method: 'personal_sign',
                    params: [nonce, address],
                  })
                  .then((signature: any) => {
                    if (signature) {
                      //在登录或者注册页面调用
                      if (isRegLogPage) {
                        this.authApi
                          .verifyLogin({
                            userType: 'MetaMask',
                            signature: signature, //签字
                            address: address, //地址
                          })
                          .subscribe(data => this.afterVerify$.next({ ...data, socialUserType: 'MetaMask' }));
                      }
                      // 在安全中心绑定
                      if (!isRegLogPage) {
                        this.authApi
                          .socialUserBind({
                            userType: 'MetaMask',
                            signature: signature, //签字
                            address: address, //地址
                          })
                          .subscribe(response =>
                            this.afterVerifyInSafeHome$.next({
                              status: response.data,
                              socialUserType: 'MetaMask',
                              message: response.message,
                            }),
                          );
                      }
                    }
                  });
              }
            });
          })
          .catch((error: any) => {
            if (error?.code === -32002) {
              this.commonPopup({
                content: this.localeService.getValue('hint'),
                description: this.localeService.getValue('metamask_lock'),
              });
            }
            if (error?.code === 4100) {
              this.commonPopup({
                content: this.localeService.getValue('hint'),
                description: this.localeService.getValue('no_permission'),
              });
            }
            const web3 = document.getElementById('Web3');
            web3?.remove();
          });
      } else {
        if (!this.thirdAuthLink.metaLink) return;
        window.open(this.thirdAuthLink.metaLink, '__blank');
      }
    });
  }

  /**
   * Line 验证
   *
   * @param isRegLogPage  是不是在注册或者登录页面
   */
  lineAuth(isRegLogPage: boolean = true) {
    if (!this.thirdAuthLink.lineLink) return;
    window.open(
      this.thirdAuthLink.lineLink.replace('{{DOMAIN}}', window.location.origin),
      this.thirdAuthPopup,
      this.getPopupConfig(),
    );
    const lineMessage = (event: any) => {
      if (event?.source?.location?.href?.includes('thirdauth')) {
        if (event?.data) {
          window.removeEventListener('message', lineMessage);
          const { code, state } = event.data;
          if (code && state) {
            // 在登录/注册页面调用
            if (isRegLogPage) {
              this.authApi
                .verifyLogin({
                  callBackUrl: `${window.location.origin}/thirdauth/index.html`,
                  code,
                  state,
                  userType: 'Line',
                })
                .subscribe(data => {
                  this.afterVerify$.next({ ...data, socialUserType: 'Line' });
                });
            }
            // 在安全中心绑定
            if (!isRegLogPage) {
              this.authApi
                .socialUserBind({
                  callBackUrl: `${window.location.origin}/thirdauth/index.html`,
                  code,
                  state,
                  userType: 'Line',
                })
                .subscribe(response =>
                  this.afterVerifyInSafeHome$.next({
                    status: response.data,
                    socialUserType: 'Line',
                    message: response.message,
                  }),
                );
            }
          }
        }
      }
    };
    window.addEventListener('message', lineMessage, false);
  }

  telegramReceive$!: Subscription;

  /**
   * telegram 验证
   *
   * @param isRegLogPage 是不是在注册或者登录页面
   * @param callback
   */
  telegramAuth(isRegLogPage: boolean = true, callback?: () => void) {
    if (!this.thirdAuthLink.telegramLink) return;
    this.telegramReceive$?.unsubscribe();
    this.telegramReceive$ = fromEvent<MessageEvent>(window, 'message')
      .pipe()
      .subscribe((event: MessageEvent) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (e) {
          //
        }
        if (data) {
          // 对比验证中心的地址
          const origin = this.thirdAuthLink.telegramLink.split('origin=')[1].split('&')[0];
          if (data.origin === origin) {
            this.telegramReceive$?.unsubscribe();
            if (data.result) {
              if (callback) callback();
              // 在登录/注册页面调用
              if (isRegLogPage) {
                this.authApi
                  .verifyLogin({
                    additionalProp: data.result,
                    userType: 'Telegram',
                  })
                  .subscribe(data => {
                    this.afterVerify$.next({ ...data, socialUserType: 'Telegram' });
                  });
              }
              // 在安全中心绑定
              if (!isRegLogPage) {
                this.authApi
                  .socialUserBind({
                    additionalProp: data.result,
                    userType: 'Telegram',
                  })
                  .subscribe(response => {
                    this.afterVerifyInSafeHome$.next({
                      status: response.data,
                      socialUserType: 'Telegram',
                      message: response.message,
                    });
                  });
              }
            }
          }
        }
      });
  }

  /**
   * 公共错误弹窗
   *
   * @param data
   */
  commonPopup(data: Data) {
    const { content, description } = data;
    this.popup.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        type: 'warn',
        content,
        buttons: [{ text: this.localeService.getValue('sure'), primary: true }],
        description,
      },
    });
  }

  /**
   * 错误处理
   *
   * @param response 社交验证后返回的 数据
   * @returns boolean
   */
  errorProcess(response: ResponseData<SocialUserLoginData>): boolean {
    if (!response) {
      this.sentryService.error('LoginError', 'Third-party Login Verify Error', {
        extra: { response },
        level: 'warning',
      });
    }

    // 第三方登录频繁 统一处理
    if (response?.code === '2130') {
      this.commonPopup({
        content: this.localeService.getValue('hint'),
        description: response?.message || '',
      });
      return true;
    }

    //code 2108 - 暂不支持此社交账号登录;
    if (response?.code === '2108') {
      this.commonPopup({
        content: this.localeService.getValue('hint'),
        description: response?.message || '',
      });
      return true;
    }

    // code 2012 账户被锁
    if (response?.code === '2012') {
      this.commonPopup({
        content: this.localeService.getValue('hint'),
        description: response?.message || '',
      });
      return true;
    }

    // 第三方验证 未通过 - 提示更换第三方账号
    if (!response?.data?.isVerified) {
      // 提示 更换账号 弹窗提示
      this.commonPopup({
        content: this.localeService.getValue('third_auth_tips'),
        description: this.localeService.getValue('third_auth_text'),
      });
      return true;
    }

    return false;
  }

  /**
   *
   * 第三方 弹窗
   *
   * @param footerTemplate
   * @param callback
   */
  onThirdPupop(footerTemplate: TemplateRef<any>, callback: Function[] | Function) {
    this.isPopuped = true;
    this.popup.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        type: 'warn',
        content: this.localeService.getValue('hint'),
        buttons: [
          { text: this.localeService.getValue('con_bind') },
          { text: this.localeService.getValue('go_reg'), primary: true },
        ],
        description: this.localeService.getValue('auth_hind'),
        footerTemplate,
        callback,
      },
    });
  }

  /**重置一些状态 */
  reset() {
    this.telegramReceive$?.unsubscribe();
  }
}
