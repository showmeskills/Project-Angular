import { Component, DestroyRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { AuthApi } from 'src/app/shared/apis/auth.api';
import { PhoneNumberSelecterComponent } from 'src/app/shared/components/phone-number-selecter/phone-number-selecter.component';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { ThirdAuthService } from 'src/app/shared/components/third-auth/third-auth.service';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  GeetestData,
  LoginByEmailParams,
  LoginByMobileParams,
  LoginByNameParams,
  LoginUser,
  Need2Fa,
  VerifyEmailParam,
  VerifyGoogleParam,
  VerifyPhoneParam,
  VerifyType,
} from 'src/app/shared/interfaces/auth.interface';
import { ResponseData } from 'src/app/shared/interfaces/response.interface';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { EncryptService } from 'src/app/shared/service/encrypt.service';
import { GeetestService } from 'src/app/shared/service/geetest.service';
import { EMAIL_VALID_REGEXP } from 'src/app/shared/service/general.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { PhoneNumberService } from 'src/app/shared/service/phone-number-validation';
import { PopupService } from 'src/app/shared/service/popup.service';
import { SentryService } from 'src/app/shared/service/sentry.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { PasswordService } from '../password/password.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  host: { class: 'flex' },
})
export class LoginComponent implements OnInit {
  constructor(
    private router: Router,
    private dialog: MatDialog,
    private popup: PopupService,
    private appService: AppService,
    private authApi: AuthApi,
    private geetestService: GeetestService,
    private encryptService: EncryptService,
    private localStorageService: LocalStorageService,
    public phoneNumberService: PhoneNumberService,
    private toast: ToastService,
    private passwordService: PasswordService,
    private localeService: LocaleService,
    private dataCollectionService: DataCollectionService,
    private thirdAuthService: ThirdAuthService,
    private destroyRef: DestroyRef,
    private sentryService: SentryService,
  ) {
    // 订阅第三方验证之后 的操作
    this.thirdAuthService.afterVerify$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(response => {
      if (this.thirdAuthService.errorProcess(response)) return;
      const data = response?.data;

      // 当前用户已经有gogaming账号并且已经绑定第三方 - 登录成功
      if (data?.isRegister && data?.isVerified && data?.socialUserId) {
        if (data?.loginResult) {
          // 直接登录 做登录操作
          const loginResult = data.loginResult;
          this.uniCode = loginResult?.uniCode || '';
          this.areaCode = loginResult?.areaCode || '';
          if (loginResult?.need2Fa) {
            this.user2fa = {
              tFaGoogle: loginResult?.tFaGoogle,
              tFaMobile: loginResult?.tFaMobile,
              tFaEmail: loginResult?.tFaEmail,
              mobile: loginResult?.mobile,
              areaCode: loginResult?.areaCode,
              hidePhoneNum: loginResult?.mobile,
              email: loginResult?.email,
            };
            // 进入安全验证页面
            this.isNeed2fa = true;
          } else {
            this.dataCollectionService.gtmPush('login', { login_type: 'login' });
            this.appService.logged(loginResult?.token || '');
          }
        }
        return;
      }
      // 老用户 验证通过 未绑定
      if (!data?.isRegister && data?.isVerified) {
        // 显示绑定
        this.useThirdAuth = true;
        this.socialUserId = data?.socialUserId;
        this.socialUserType = response?.socialUserType;
        if (!this.thirdAuthService.isPopuped) {
          // 提示用户 是选择绑定账号还是注册
          const callback = () => {
            this.thirdAuthService.userRegister = true;
            this.thirdAuthService.verifyData = response;
            this.router.navigateByUrl(`${this.appService.languageCode}/register`);
            this.popup.closeAll();
          };
          this.thirdAuthService.onThirdPupop(this.footerTemplate, callback);
        }
      }
    });
  }

  /** 弹窗 自定义footer */
  @ViewChild('footerTemplate') footerTemplate!: TemplateRef<Element>;

  /** 当前选择的注册方式 0:用户名 1:手机号 */
  selectedTabIndex = 0;
  /** 用户名 */
  userName: string = '';
  /** 邮箱 */
  emailValue: string = '';
  /** 密码 */
  userPassWord: string = '';
  /** 手机号 */
  phone: string = '';
  phoneError: boolean = false;
  /** 国家区号样式 */
  fogClassName = '';
  /** 当前选中的手机区号 */
  areaCode = '';
  /** 是否登录中 */
  submitLoading: boolean = false;
  /** 下次是否自动登录 */
  isAutoLogin: boolean = true;

  /** 是否需要2FA验证 */
  isNeed2fa: boolean = false;

  /** 首次进入的type */
  verifyType: VerifyType = 'PHONE';

  uniCode: string = '';
  /** 用户2FA数据 */
  user2fa!: Need2Fa;

  /** 展示错误 */
  showErrorText: string = '';

  /** 密码验证 */
  passwordValida = {
    length: false,
    rule: false,
    ruleTwo: false,
    success: false,
  };

  /** 第三方 绑定或者注册 */
  useThirdAuth!: boolean;

  /** 用户绑定的ID */
  socialUserId!: string;

  /** 用户用户绑定 */
  socialUserType!: 'Google' | 'Telegram' | 'Line' | 'MetaMask';

  /** 手机提交 需要验证 */
  mobileSubmit!: boolean;

  /** 邮箱错误提示 */
  emailErrorText: string = '';

  /** 邮箱格式是否合格 */
  emailValid: boolean = false;

  checkSize(el1: HTMLDivElement, el2: HTMLDivElement) {
    setTimeout(() => {
      const el1w = el1.offsetWidth;
      const el2w = el2.offsetWidth;
      if (el2w > el1w) {
        try {
          // @ts-ignore
          el2.style.zoom = el1w / el2w - 0.01;
        } catch (error) {
          /* empty */
        }
      }
    });
  }

  ngOnInit() {
    this.dataCollectionService.addPoint({ eventId: 30009 });
    this.appService.currentCountry$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(x => x),
      )
      .subscribe(x => {
        console.log(x);
        //获取当前手机区号
        this.areaCode = x.areaCode;
        // 对后台国家code字段进行规则矫正
        const fogClassNameReplace = x.code
          .replace(/\&/g, '_and_')
          .replace(/ /g, '_')
          .replace(/\,/g, '')
          .replace(/\./g, '');
        this.fogClassName = `country-${fogClassNameReplace}`;
        this.phone = '';
      });

    // 用户从注册页面过来， 因为已经注册过且绑定
    if (this.thirdAuthService.userLogin) {
      this.thirdAuthService.afterVerify$.next(this.thirdAuthService.verifyData);
      this.thirdAuthService.userLogin = false;
    }
  }
  /**
   * 切换登录方式
   *
   * @param index TabIndex
   */
  onChangeTab(index: number) {
    this.selectedTabIndex = index;
    this.resetForm();
  }

  /** 邮箱输入框事件 */
  onChangeEmailValue() {
    this.emailValid = EMAIL_VALID_REGEXP.test(this.emailValue);

    this.emailErrorText = !!this.emailValue && !this.emailValid ? this.localeService.getValue('email_err') : '';
  }

  /**
   * 登录操作
   */
  async handleSubmit(): Promise<void> {
    this.submitLoading = true;
    const result = await firstValueFrom(await this.geetestService.verify());
    //滑动验证成功
    if (result) {
      //加密密码
      const encryptedPassWord = this.encryptService.encrypt(this.userPassWord);
      if (this.selectedTabIndex == 0) {
        //用户名密码登录
        await this.handleUserNameLogin(result, encryptedPassWord);
      } else if (this.selectedTabIndex == 1) {
        //手机登录
        await this.handlePhoneNumberLogin(result, encryptedPassWord);
      } else {
        //邮箱登录
        await this.handleEmailLogin(result, encryptedPassWord);
      }
    }
    this.submitLoading = false;
  }

  /**
   * 绑定安全页面提交按钮  验证2fa
   *
   * @param geetestData
   */
  async loginBy2Fa(geetestData: GeetestData) {
    this.showErrorText = '';
    this.submitLoading = true;

    let params: VerifyPhoneParam | VerifyGoogleParam | VerifyEmailParam | null = null;

    if (geetestData?.verifyType === 'PHONE') {
      params = {
        areaCode: this.areaCode,
        mobile: geetestData?.phone || '',
        otpCode: geetestData?.authCode || '',
        smsVoice: false,
      };
    }
    if (geetestData?.verifyType === 'EMAIL') {
      params = {
        email: geetestData?.email || '',
        emailCode: geetestData?.emailAuthCode || '',
      };
    }

    if (geetestData?.verifyType === 'GOOGLE') {
      params = {
        googleCode: geetestData?.googleCaptcha || '',
      };
    }

    const result = await firstValueFrom(this.authApi.post2faVerify(this.uniCode, params));
    // 2fa 验证后 获取token并替换
    if (result?.success) {
      this.submitLoading = false;
      this.dataCollectionService.gtmPush('login', { login_type: 'login' });
      this.appService.logged(result?.data);
    } else {
      this.submitLoading = false;
      this.handleErrorMessage(result);
    }
  }

  /**
   * 用户名密码登录
   *
   * @param result
   * @param encryptedPassWord
   * @returns
   */
  async handleUserNameLogin(result: any, encryptedPassWord: string) {
    const param: LoginByNameParams = {
      lotNumber: result?.lot_number || '',
      captchaOutput: result?.captcha_output || '',
      passToken: result?.pass_token || '',
      genTime: result?.gen_time || '',
      userName: this.userName,
      password: encryptedPassWord,
      autoLogin: this.isAutoLogin,
    };
    const responseData: ResponseData<LoginUser> = await firstValueFrom(this.authApi.loginByName(param));
    if (responseData?.success) {
      const data = responseData?.data;
      this.uniCode = data?.uniCode;
      this.areaCode = data?.areaCode;
      // 进行2fa验证：
      if (data?.need2Fa) {
        // 进入安全验证页面
        this.user2fa = {
          tFaGoogle: data?.tFaGoogle,
          tFaMobile: data?.tFaMobile,
          tFaEmail: data?.tFaEmail,
          email: data?.email,
          mobile: data?.mobile,
          areaCode: data?.areaCode,
          hidePhoneNum: data?.mobile,
          hideEmailNum: data?.email,
        };
        // 进入安全验证页面
        this.isNeed2fa = true;
      } else {
        this.dataCollectionService.gtmPush('login', { login_type: 'login' });
        //替换token  responseData.data.token
        this.appService.logged(data?.token);
      }
    } else {
      this.handleErrorMessage(responseData);
    }
  }
  /**
   * 邮箱登录
   *
   * @param result  验证结果
   * @param encryptedPassWord 加密密码
   */
  async handleEmailLogin(result: any, encryptedPassWord: string) {
    const param: LoginByEmailParams = {
      lotNumber: result.lot_number,
      captchaOutput: result.captcha_output,
      passToken: result.pass_token,
      genTime: result.gen_time,
      email: this.emailValue,
      password: encryptedPassWord,
      autoLogin: this.isAutoLogin,
    };
    const responseData = await firstValueFrom(this.authApi.loginByEmail(param));
    if (responseData?.success) {
      const data = responseData?.data;
      this.uniCode = data?.uniCode;
      if (data?.need2Fa) {
        this.user2fa = {
          tFaGoogle: data?.tFaGoogle,
          tFaMobile: data?.tFaMobile,
          tFaEmail: data?.tFaEmail,
          mobile: data?.mobile,
          areaCode: data?.areaCode,
          email: this.emailValue,
          hidePhoneNum: data?.mobile,
          hideEmailNum: data?.email,
        };
        // 进入安全验证页面
        this.isNeed2fa = true;
        this.verifyType = 'EMAIL';
      } else {
        this.dataCollectionService.gtmPush('login', { login_type: 'login' });
        this.appService.logged(data?.token);
      }
    } else {
      this.handleErrorMessage(responseData);
    }
  }
  /**
   * 其他登录方式
   *
   * @param params 登录方式
   */
  async otherLogin(params: string) {
    this.toast.show({ message: this.localeService.getValue('fun_dev'), type: 'fail', duration: 3000 });
  }
  /**
   * 手机登录
   *
   * @param result
   * @param encryptedPassWord
   */
  async handlePhoneNumberLogin(result: any, encryptedPassWord: string) {
    const param: LoginByMobileParams = {
      lotNumber: result?.lot_number || '',
      captchaOutput: result?.captcha_output || '',
      passToken: result?.pass_token || '',
      genTime: result?.gen_time || '',
      areaCode: this.areaCode,
      mobile: this.phone,
      password: encryptedPassWord,
      autoLogin: this.isAutoLogin,
    };
    const responseData = await firstValueFrom(this.authApi.loginByMobile(param));
    if (responseData?.success) {
      const data = responseData?.data;
      this.uniCode = data?.uniCode;
      this.areaCode = data?.areaCode;
      if (data?.need2Fa) {
        this.user2fa = {
          tFaGoogle: data?.tFaGoogle,
          tFaMobile: data?.tFaMobile,
          tFaEmail: data?.tFaEmail,
          mobile: this.phone,
          areaCode: data?.areaCode,
          email: responseData.data.email,
          hidePhoneNum: responseData.data.mobile,
        };
        // 进入安全验证页面
        this.isNeed2fa = true;
      } else {
        this.dataCollectionService.gtmPush('login', { login_type: 'login' });
        this.appService.logged(data?.token);
      }
    } else {
      this.handleErrorMessage(responseData);
    }
  }

  /**
   * 处理登录Api返回的错误信息
   *
   * @param responseData
   */
  private handleErrorMessage(responseData: ResponseData<any> | null) {
    //帐户密码错误 x 次
    if (responseData?.code == '2010' || responseData?.code == '2011' || responseData?.code == '2113') {
      this.toast.show({
        message: responseData?.message || '',
        type: 'fail',
      });
      this.showErrorText = responseData?.message || '';
      return;
    }
    //2012 锁定
    if (responseData?.code === '2012') {
      this.popup.open(StandardPopupComponent, {
        speed: 'faster',
        data: {
          type: 'warn',
          content: this.localeService.getValue('acc_lock00'),
          buttons: [
            { text: this.localeService.getValue('cancels') },
            { text: this.localeService.getValue('chage_paswd00'), primary: true },
          ],
          description: responseData?.message || '',
          callback: () => {
            this.handleForgetPassWord();
          },
        },
      });
      return;
    }
    //2013 禁用用户
    if (responseData?.code === '2013') {
      this.appService.showForbidTip('login');
      return;
    }
    //已登录，使用当前token
    if (responseData?.code === '1004') {
      this.dataCollectionService.gtmPush('login', { login_type: 'login' });
      this.appService.logged(this.localStorageService.token!);
      return;
    }
    //匹配不到，返回默认消息
    this.toast.show({
      message: responseData?.message ?? this.localeService.getValue('user_passerr'),
      type: 'fail',
    });
    this.showErrorText = responseData?.message ?? this.localeService.getValue('user_passerr');
  }

  /**
   * 注册按钮是否可以点击
   */
  get canSubmit(): boolean {
    if (this.userPassWord) {
      if (this.selectedTabIndex == 0) {
        return !!this.userName;
      } else if (this.selectedTabIndex == 2) {
        return this.emailValid && !!this.emailValue;
      } else {
        return !!this.phone && String(this.phone).length > 2 && !this.phoneError;
      }
    } else {
      return false;
    }
  }

  /**
   * 手机区号选择弹出框
   */
  openAreaCodeDialog(): MatDialogRef<PhoneNumberSelecterComponent> {
    return this.dialog.open(PhoneNumberSelecterComponent, {
      panelClass: ['phone-number-dialog-container', 'mobile-dialog'],
    });
  }

  /**
   * 重置表单数据
   */
  private resetForm() {
    this.userName = '';
    this.phone = '';
    this.phoneError = false;
    this.userPassWord = '';
    this.emailValue = '';
    this.userPassWord = '';
    this.showErrorText = '';
  }

  /**
   * 跳转注册页面
   */
  jumpToRegister() {
    if (this.submitLoading) return;
    this.router.navigate([this.appService.languageCode, 'register']);
  }

  /**
   * 忘记密码
   */
  handleForgetPassWord() {
    //进入忘记密码页面
    this.router.navigate([this.appService.languageCode, 'forget-password']);
    this.passwordService.orderStepSubject.next(1);
  }

  /**
   * ENTER 键提交
   */
  checkToSubmit() {
    if (this.submitLoading) return;
    // 普通登录提交
    if (!this.useThirdAuth) {
      if (!this.canSubmit) return;
      this.handleSubmit();
    }
    // 第三方验证后绑定
    if (this.useThirdAuth) {
      if (!this.ableBind) return;
      this.onBindPhone();
    }
  }

  /** ----以为下是新增 第三方--- */
  /**
   * 绑定验证
   *
   * @returns boolean
   */
  get ableBind(): boolean {
    if (!this.userPassWord) return false;
    if (!this.phone) return false;
    if (!this.phoneError && this.passwordValida.success) return false;
    return true;
  }

  /**
   * 手机绑定
   *
   * @returns undefined
   */
  async onBindPhone() {
    this.submitLoading = true;
    const result = await firstValueFrom(await this.geetestService.verify());
    if (result) {
      const encryptedPassWord = this.encryptService.encrypt(this.userPassWord);
      const params: LoginByMobileParams = {
        lotNumber: result?.lot_number,
        captchaOutput: result?.captcha_output,
        passToken: result?.pass_token,
        genTime: result?.gen_time,
        areaCode: this.areaCode,
        mobile: this.phone,
        password: encryptedPassWord,
        autoLogin: this.isAutoLogin,
        socialUserId: this.socialUserId,
        socialUserType: this.socialUserType,
      };
      this.authApi.socialUserLoginByMobile(params).subscribe(responseData => {
        if (responseData?.success) {
          const data = responseData?.data;
          this.uniCode = data?.uniCode;
          this.areaCode = data?.areaCode;
          if (data?.need2Fa) {
            this.user2fa = {
              tFaGoogle: data?.tFaGoogle,
              tFaMobile: data?.tFaMobile,
              mobile: this.phone,
              areaCode: data?.areaCode,
              hidePhoneNum: data?.mobile,
            };
            // 进入安全验证页面
            this.mobileSubmit = true;
          } else {
            this.dataCollectionService.gtmPush('login', { login_type: 'login' });
            this.appService.logged(data?.token);
          }
        } else {
          this.handleErrorMessage(responseData);
        }
      });
    }
    this.submitLoading = false;
  }

  /** 第三方跳过 */
  onThirdPass() {
    this.popup.closeAll();
    this.submitLoading = true;
    this.authApi
      .onSoicalByPass({
        socialUserId: this.socialUserId,
        socialUserType: this.socialUserType,
      })
      .subscribe(token => {
        this.submitLoading = false;
        if (token) {
          this.dataCollectionService.gtmPush('login', { login_type: 'register' });
          this.appService.logged(token, true);
          this.popup.closeAll();
        }
      });
  }
}
