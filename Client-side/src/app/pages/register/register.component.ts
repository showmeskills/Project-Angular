import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, firstValueFrom, of } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { AuthApi } from 'src/app/shared/apis/auth.api';
import { PhoneNumberSelecterComponent } from 'src/app/shared/components/phone-number-selecter/phone-number-selecter.component';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { ThirdAuthService } from 'src/app/shared/components/third-auth/third-auth.service';
import {
  RegisterByEmailParams,
  RegisterByMobileParams,
  RegisterByNameParams,
  VerifyAction,
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

@UntilDestroy()
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  host: { class: 'flex' },
})
export class RegisterComponent implements OnInit {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private appService: AppService,
    private authApi: AuthApi,
    private dialog: MatDialog,
    private geetest: GeetestService,
    private encryptService: EncryptService,
    private localStorageService: LocalStorageService,
    private phoneNumberService: PhoneNumberService,
    private toast: ToastService,
    private popup: PopupService,
    private localeService: LocaleService,
    private dataCollectionService: DataCollectionService,
    private thirdAuthService: ThirdAuthService,
    private sentryService: SentryService,
  ) {
    // 订阅第三方验证之后 的操作
    this.thirdAuthService.afterVerify$.pipe(untilDestroyed(this)).subscribe(response => {
      if (this.thirdAuthService.errorProcess(response)) return;
      const { data, socialUserType } = response;

      // 如果已 绑 切有账号 用户在注册页中点击第三方注册 需要跳回 登录页面
      if (data.isRegister && data.isVerified && data.loginResult && data.socialUserId) {
        this.thirdAuthService.userLogin = true;
        this.thirdAuthService.verifyData = response;
        this.router.navigateByUrl(`${this.appService.languageCode}/login`);
      }

      if (!data.isRegister && data.isVerified) {
        // 老用户 验证通过 注册
        // 显示注册
        this.useThirdAuth = true;
        this.socialUserId = data.socialUserId;
        this.socialUserType = socialUserType;
        this.selectedTabIndex = 1;
        if (!this.thirdAuthService.isPopuped) {
          const callback = [
            () => {
              this.thirdAuthService.userLogin = true;
              this.thirdAuthService.verifyData = response;
              this.router.navigateByUrl(`${this.appService.languageCode}/login`);
              this.popup.closeAll();
            },
            () => {
              this.thirdAuthService.userLogin = true;
              this.popup.closeAll();
            },
          ];
          this.thirdAuthService.onThirdPupop(this.footerTemplate, callback);
        }
      }
    });
  }
  /** 弹窗 自定义footer */
  @ViewChild('footerTemplate') footerTemplate!: TemplateRef<Element>;
  // @ViewChild("overlay", { static: false }) private overlayElement!: ElementRef;       //密码输入框

  selectedTabIndex = 0; //当前选择的注册方式 0:用户名 1:手机号 2:邮箱

  userName: string | any = ''; //用户名

  phoneError: boolean | string = false; //手机号错误信息

  emailError: boolean | string = false; //邮箱错误信息

  get usernameError(): boolean | string {
    //用户名错误信息
    //用户名错误信息赋值
    if (!!this.userName && !this.userValida.success) {
      // 输入用户名无效
      if (!this.userValida.length) {
        return this.localeService.getValue('length_error');
      } else if (this.userValida.rule) {
        return this.localeService.getValue('pass_error_info');
      } else {
        return this.localeService.getValue('letter_error');
      }
    } else if (!!this.showErrorText && this.errorPosition === 'username') {
      // 接口返回用户名相关错误信息
      return this.showErrorText;
    } else {
      return false;
    }
  }

  get passwordError(): boolean | string {
    //密码错误信息
    if (!!this.password && !this.passwordValida.success) {
      // 输入密码无效
      return this.localeService.getValue('pwd_error_msg');
    } else if (!!this.showErrorText && this.errorPosition === 'password') {
      // 接口返回用户名相关错误信息
      return this.showErrorText;
    } else {
      return false;
    }
  }

  phone: string = ''; //手机号

  email: string = ''; //邮箱

  password: string = ''; //密码

  referee: string = ''; //推荐人

  /** aff 参数 用户通过别的链接来到注册页面 带过来的参数 */
  myAff: string = '';

  isAgree: boolean = true; //是否同意服务条款
  isShowRef: boolean = false; //是否显示推荐人
  submitLoading: boolean = false; //是否在注册中
  fogClassName = ''; //当前手机区号国家
  currentPhoneZone = ''; //当前手机区号
  isLoading: boolean = false;
  isShowInvite: boolean = true;

  /** 提交注册的类型 */
  submitType!: 'PHONE' | 'EMAIL';

  user2fa: any; // 用户手机号与区号

  otpType: VerifyAction = 'Register';

  showErrorText: string = '';

  userValida = {
    //用户名规则
    length: false,
    rule: false,
    ruleTwo: false,
    success: false,
  };

  phoneValida = {
    //手机验证
    length: false,
  };

  /** 邮箱验证 */
  emailValida: boolean = false;

  passwordValida = {
    //密码验证
    length: false,
    rule: false,
    ruleTwo: false,
    success: false,
  };
  refValida = {
    //推荐人验证
    rule: false,
    length: false,
    success: false,
  };

  /** 接口返回错误的位置 */
  errorPosition = 'username';

  /** 显示第三方后 注册 */
  useThirdAuth!: boolean;

  /** 绑定用户账号的social id */
  socialUserId!: string;

  /** 绑定用户账号的 social 类型 */
  socialUserType!: 'Google' | 'Telegram' | 'Line' | 'MetaMask';

  /** 自动移动按钮 */
  autoScroll: boolean = false;

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
    this.dataCollectionService.addPoint({ eventId: 30007 });
    this.appService.currentCountry$
      .pipe(
        untilDestroyed(this),
        filter(x => x),
      )
      .subscribe(x => {
        //获取当前手机区号
        // 安全验证需要
        this.currentPhoneZone = x.areaCode;
        this.fogClassName = this.className(x.code);
        this.phone = '';
        if (!x.hasSms) {
          this.openDialog(x.name);
        }
      });

    combineLatest([
      of(this.localStorageService.inviteCode),
      of(this.localStorageService.myAffiliate),
      this.activatedRoute.queryParams,
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([localeInviteCode, localeAffiliate, params]) => {
        const inviteCode = params?.inviteCode || localeInviteCode || '';
        const aff = params?.aff || localeAffiliate || '';
        if (inviteCode && inviteCode.length > 0) {
          this.referee = inviteCode as string;
          this.onRefInput();
          this.showRef();
          this.isShowInvite = false;
          this.localStorageService.inviteCode = inviteCode;
        }
        if (aff && aff.length > 0) {
          this.isShowInvite = false;
          this.localStorageService.myAffiliate = aff;
          this.myAff = this.localStorageService.myAffiliate ?? '';
        }
      });

    //用户从登录 页面 过来过来后再次出发订阅
    if (this.thirdAuthService.userRegister) {
      this.thirdAuthService.afterVerify$.next(this.thirdAuthService.verifyData);
      this.thirdAuthService.userRegister = false;
    }
  }

  /**
   * 国旗class
   *
   * @param key
   */
  className(key: any) {
    const iconClassName_old = 'country-' + key.replace(/\(/g, '').replace(/\)/g, '');
    // 后台返回的国家code，含有不符合CSS样式规则， 有空格，&，逗号，小数点等。
    return iconClassName_old.replace(/\&/g, '_and_').replace(/ /g, '_').replace(/\,/g, '').replace(/\./g, '');
  }

  /**
   * 切换注册方式
   *
   * @param index TabIndex
   */
  onChangeTab(index: number) {
    if (this.submitLoading) return;
    this.selectedTabIndex = index;
    this.resetForm();
    this.showErrorText = '';
  }

  /**
   * 用户规则验证
   *
   * @param element 用户名输入框
   */
  onUserNameInput(element: any) {
    //规则1：用户名长度为6-18个字符
    this.userValida.length = this.userName.length >= 6 && this.userName.length <= 18;
    //规则2：用户名需要以字母开头
    this.userValida.rule = /^[a-zA-Z]/.test(this.userName);
    //规则3：只能包含字母、数字、下划线
    this.userValida.ruleTwo = /^\w+$/.test(this.userName);

    //是否全部验证通过
    this.userValida.success = this.userValida.length && this.userValida.rule && this.userValida.ruleTwo;
    this.showErrorText = '';
  }

  /**
   * 邮箱格式验证
   */
  onEmailInput() {
    this.emailValida = EMAIL_VALID_REGEXP.test(this.email);

    //邮箱错误信息赋值
    this.emailError = !!this.email && !this.emailValida ? this.localeService.getValue('email_err') : '';
  }

  /**
   * 手机号规则验证
   *
   * @param element 手机号输入框
   */
  onPhoneInput(element: any) {
    const lengthValid = element.input.nativeElement.value.length >= 2;
    this.phoneError =
      lengthValid &&
      !this.phoneNumberService.checkVaild(element.input.nativeElement.value, this.currentPhoneZone.substr(1));
    this.showErrorText = '';
  }

  /**
   * 推荐人规则验证
   *
   * @param element 手机号输入框
   */
  onRefInput() {
    this.refValida.rule = /^([a-zA-Z0-9]+)$/g.test(this.referee);
    this.refValida.length = this.referee.length == 8;
    this.refValida.success = this.refValida.rule && this.refValida.length;
    this.showErrorText = '';
  }

  /**
   * 密码规则验证
   *
   * @param element 密码输入框
   */
  onPasswordInput(element: any) {
    this.showErrorText = '';
    //是否为空字符
    const unEmptyStr = this.password.indexOf(' ') == -1;
    //规则1：密码长度为8-20个字符
    this.passwordValida.length = unEmptyStr && this.password.length >= 8 && this.password.length <= 20;
    //规则2：必须包含1位数字
    this.passwordValida.rule = /\d/.test(this.password);
    //规则3：必须包含1位大写字母
    this.passwordValida.ruleTwo = /[A-Z]/.test(this.password);

    //是否全部验证通过
    this.passwordValida.success = this.passwordValida.length && this.passwordValida.rule && this.passwordValida.ruleTwo;

    //密码强度判断
    if (this.password.length < 8) {
      element.strength = 1;
      return;
    }
    let strength = 0;
    if (this.passwordValida.rule) strength += 1;
    if (this.passwordValida.ruleTwo) strength += 1;
    //小写字母
    if (/[a-z]/.test(this.password)) strength += 1;
    //特殊符号
    if (/[^\w\s]+/.test(this.password)) strength += 1;
    element.strength = strength;
  }

  /**
   * 控制推荐人的显示与隐藏
   */
  showRef() {
    if (this.referee && !this.refValida.success) return;
    this.isShowRef = !this.isShowRef;
  }

  /**
   * 注册按钮是否可以点击
   */
  get canSubmit(): boolean {
    if (!this.password) return false;
    if (!this.isAgree) return false;
    if (this.emailError) return false;
    if (this.isShowInvite) {
      if (!!this.referee && !this.refValida.success) return false;
    }
    //用户名注册
    if (this.selectedTabIndex == 0) {
      if (!this.userName) return false;
      return this.userValida.success && this.passwordValida.success;
    }
    //手机注册
    if (this.selectedTabIndex == 1) {
      if (!this.phone) return false;
      return !this.phoneError && this.passwordValida.success;
    }
    // 邮箱注册
    if (this.selectedTabIndex === 2) {
      if (!this.email) return false;
      return !this.emailError && this.passwordValida.success;
    }
    return false;
  }

  /**
   * 用户点击注册
   */
  async submit(): Promise<void> {
    this.submitLoading = true;
    const result = await firstValueFrom(await this.geetest.verify());
    //滑动验证成功
    if (result) {
      //加密密码
      const password = this.encryptService.encrypt(this.password);

      //返回用户注册数据
      let responseData: ResponseData<string>;

      // 用户名密码注册
      if (this.selectedTabIndex == 0) {
        const param: RegisterByNameParams = {
          userName: this.userName,
          password: password,
          lotNumber: result.lot_number,
          captchaOutput: result.captcha_output,
          passToken: result.pass_token,
          genTime: result.gen_time,
          referrer: this.referee,
          aff: this.myAff,
          email: this.email,
        };

        responseData = await firstValueFrom(this.authApi.userNameRegister(param));
        //登录成功跳转并保存token
        if (responseData?.success) {
          // 保存token
          this.submitLoading = false;
          this.dataCollectionService.gtmPush('login', { login_type: 'register' });
          this.appService.logged(responseData.data, true);
        } else {
          this.submitLoading = false;
          this.showErrorText = responseData.message;
          this.toast.show({
            message: responseData.message,
            type: 'fail',
          });
        }
        // 手机号码注册
      } else if (this.selectedTabIndex === 1) {
        const hidePhoneNum = this.phone.slice(0, -6) + '******';
        this.user2fa = {
          mobile: this.phone,
          hidePhoneNum: hidePhoneNum,
          areaCode: this.currentPhoneZone,
        };
        this.submitType = 'PHONE';
        this.submitLoading = false;
        // 邮箱注册
      } else if (this.selectedTabIndex === 2) {
        this.user2fa = {
          email: this.email,
        };
        this.submitType = 'EMAIL';
        this.submitLoading = false;
      }
    } else {
      this.submitLoading = false;
    }
  }

  /**
   * 提交手机验证码
   *
   * @param verifyData
   */
  async registerByMobile(verifyData: any) {
    this.submitLoading = true;
    const userPassWord = this.encryptService.encrypt(this.password);
    const param: RegisterByMobileParams = {
      areaCode: `${this.currentPhoneZone}`,
      mobile: this.phone,
      password: userPassWord,
      otpCode: verifyData.authCode,
      smsVoice: false,
      referrer: this.referee,
      aff: this.myAff,
      email: this.email,
      socialUserId: this.socialUserId,
      socialUserType: this.socialUserType,
    };
    //手机注册
    const responseData = await firstValueFrom(this.authApi.mobileRegister(param));
    //登录成功
    if (responseData?.success) {
      // 保存token
      this.submitLoading = false;
      this.dataCollectionService.gtmPush('login', { login_type: 'register' });
      this.appService.logged(responseData.data, true);
    } else {
      this.submitLoading = false;
      this.onProcessError(responseData);
    }
  }

  /**
   * 提交邮箱验证吗
   *
   * @param verifyData
   */
  registerByEmail(verifyData: any) {
    const userPassword = this.encryptService.encrypt(this.password);
    const param: RegisterByEmailParams = {
      email: this.email,
      password: userPassword,
      otpCode: verifyData.emailAuthCode,
      referrer: this.referee,
      aff: this.myAff,
    };
    this.submitLoading = true;
    this.authApi.emailRegister(param).subscribe(response => {
      this.submitLoading = false;
      if (response?.success) {
        this.dataCollectionService.gtmPush('login', { login_type: 'register' });
        this.appService.logged(response.data, true);
      } else {
        this.submitLoading = false;
        this.onProcessError(response, 'sign_up_email');
      }
    });
  }

  /**
   * 手机和邮箱 接口返回 错误统一处理
   *
   * @param responseData
   * @param description reg_tip01 (该帐户已经被注册) sign_up_email (该邮箱已被注册，请重试)
   */
  onProcessError(responseData: ResponseData<string>, description: string = 'reg_tip01') {
    if (responseData.code == '2007') {
      //手机号已存在：改手机号被注册过
      this.accountExists(description);
    } else {
      //弹出错误信息
      if (responseData.code == '2003') {
        //该用户名已存在，请重试
        this.errorPosition = 'username';
      } else {
        this.errorPosition = 'password';
      }
      this.showErrorText = responseData?.message ? responseData.message : this.localeService.getValue('reg_f');
      this.toast.show({
        message: responseData?.message ? responseData.message : this.localeService.getValue('reg_f'),
        type: 'fail',
      });
    }
  }

  /**
   * 跳转服务条款
   */
  jumpToAgree() {
    if (this.submitLoading) return;
    const url = this.localeService.getValue('terms_url');
    url && window.open(`${window.location.origin}/${this.appService.languageCode}/${url}`, '_blank');
  }

  /**
   * 跳转登录页面
   */
  jumpToLogin() {
    if (this.submitLoading) return;
    this.router.navigate([this.appService.languageCode, 'login']);
  }

  /**
   * 重置表单数据
   */
  private resetForm() {
    this.userName = '';
    this.phone = '';
    this.password = '';
    this.email = '';
    this.passwordValida.success = false;
  }

  /**
   * 手机区号选择弹出框
   */
  handleSelectPhone() {
    this.dialog.open(PhoneNumberSelecterComponent, {
      panelClass: ['phone-number-dialog-container', 'mobile-dialog'],
    });
  }

  /**
   * 手机区号不支持提示框
   *
   * @param name
   */
  openDialog(name: string) {
    this.popup.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        type: 'warn',
        content: this.localeService.getValue('reg_tip00'),
        buttons: [{ text: this.localeService.getValue('sure'), primary: true }],
        description: `${name}` + this.localeService.getValue('reg_tip02'),
      },
    });
  }

  accountExists(description: string) {
    this.popup.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        type: 'warn',
        icon: 'assets/svg/user-exists.svg',
        content: this.localeService.getValue('reg_tip00'),
        buttons: [{ text: this.localeService.getValue('sure'), primary: true }],
        description: this.localeService.getValue(description),
      },
    });
  }

  checkToSubmit() {
    if (this.submitLoading) return;
    if (!this.canSubmit) return;
    this.submit();
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

  /** 是否已经账号 DOM */
  @ViewChild('scrollTo') scrollToElement!: ElementRef;
  /**
   * 触发 滚动
   *
   * @param element
   * @param isStop
   */
  onAutoScroll(element: any, isStop: boolean = false) {
    if (isStop) return;

    const curTop = element?.offsetTop || 0;
    const scrollToTop = this.scrollToElement.nativeElement?.offsetTop || 0;
    window.scrollTo({
      top: window.scrollY !== 0 ? scrollToTop - curTop : 80,
      behavior: 'smooth',
    });
  }
}
