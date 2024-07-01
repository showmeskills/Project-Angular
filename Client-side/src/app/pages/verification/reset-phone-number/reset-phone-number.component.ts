import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { AccountApi } from 'src/app/shared/apis/account.api';
import { AuthApi } from 'src/app/shared/apis/auth.api';
import { AuthPromptComponent } from 'src/app/shared/components/auth-prompt/auth-prompt.component';
import { PhoneNumberSelecterComponent } from 'src/app/shared/components/phone-number-selecter/phone-number-selecter.component';
import { SendMobileVerifyParams, VerifyAction } from 'src/app/shared/interfaces/auth.interface';
import { CacheService } from 'src/app/shared/service/cache.service';
import { EncryptService } from 'src/app/shared/service/encrypt.service';
import { GeetestService } from 'src/app/shared/service/geetest.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PhoneNumberService } from 'src/app/shared/service/phone-number-validation';
import { ToastService } from 'src/app/shared/service/toast.service';
export const TIMER_MS = 90000;

@Component({
  selector: 'app-reset-phone-number',
  templateUrl: './reset-phone-number.component.html',
  styleUrls: ['./reset-phone-number.component.scss'],
})
export class ResetPhoneNumberComponent implements OnInit {
  constructor(
    private router: Router,
    private dialog: MatDialog,
    private appService: AppService,
    private encryptService: EncryptService,
    private accountApi: AccountApi,
    private geetest: GeetestService,
    private authApi: AuthApi,
    private toast: ToastService,
    private phoneNumberService: PhoneNumberService,
    private localeService: LocaleService,
    private cacheService: CacheService,
  ) {}
  @ViewChild('stepper') stepper?: MatStepper; // stepper 控制器
  // @ViewChild("iAuthcode", { static: false }) private authcodeElement!: ElementRef;                 //手机号输入框
  // @ViewChild("iPwd", { static: false }) private passwordElement!: ElementRef;                      //密码输入框
  // @ViewChild("iGoogleCaptcha", { static: false }) private googleCaptchaElement!: ElementRef;       //谷歌验证码输入框
  isFirstSendAuthcode: boolean = true; //是否第一次發送驗證碼
  isSendAuthcode: boolean = false; //是否已發送驗證碼
  isLinear = false;
  isRipple = true; //是否需要切换step时的涟漪效果
  googleCaptcha: string = ''; //谷歌验证码
  password: string = ''; //密码
  authcode: string = ''; //手机验证码
  phone: string = ''; //手机号
  fogClassName: string = ''; //当前手机区号国家
  currentPhoneZone: string = ''; //当前手机区号
  // doneHeader: string = "手机号修改成功";
  // successText: string = "您已成功修改您的手机号码";
  accountSub!: Subscription; //订阅用户信息
  isBindGoogleValid: boolean = false; //是否绑定过谷歌
  uniCode: string = '';
  userAccountInfor: any;
  authStatus = 'initial'; // 当前验证状态有 initial（初始），sent（发送），timeout（超时）
  timer = TIMER_MS / 1000; //手机号输入框
  otpType: VerifyAction = 'BindMobile';
  smsVoice: boolean = false; //otp smsVoice false:短信 true:语音
  // pagetitle: string = "修改手机号"
  isAuthValid: boolean = false;
  isLoading: boolean = false;
  showErrorText: string = '';

  ngOnInit() {
    // 获取用户信息
    this.accountSub = this.appService.userInfo$.subscribe(x => {
      if (!x) return;
      this.userAccountInfor = x;
      this.isBindGoogleValid = x.isBindGoogleValid;
      this.currentPhoneZone = x.areaCode;
      const country = this.cacheService.countries.find(y => y.iso == x.mobileRegionCode);
      if (country) {
        const fogClassNameReplace = country.code
          .replace(/\&/g, '_and_')
          .replace(/ /g, '_')
          .replace(/\,/g, '')
          .replace(/\./g, '');
        this.fogClassName = `country-${fogClassNameReplace}`;
      }
    });

    // this.appService.currentCountry$.pipe(untilDestroyed(this), filter(x => x)).subscribe(x => {    //获取当前手机区号
    //   // this.currentPhoneZone = x.areaCode;

    // });
  }
  back() {
    // 返回安全页面
    this.router.navigate([this.appService.languageCode, 'userCenter', 'security']);
  }

  //下一步 btn
  async goForward(stepper: MatStepper) {
    if (this.isLoading) return;
    this.isLoading = true;
    const step: any = stepper;
    switch (step._selectedIndex) {
      case 0: {
        //加密密码
        const passsword = this.encryptService.encrypt(this.password);
        const callBackResult: any = await this.accountApi.postResetPhone(
          this.userAccountInfor.areaCode,
          this.phone,
          passsword,
          this.googleCaptcha,
          this.authcode,
        );
        if (callBackResult.success) {
          this.uniCode = callBackResult.data;
          this.phone = '';
          this.authcode = '';
          stepper.next();
          this.authStatus = 'initial';
        } else {
          //错误信息提示
          let errorMessgae = '';
          if (callBackResult.status == 400) {
            errorMessgae = this.localeService.getValue('req_excep');
          } else {
            errorMessgae = callBackResult.message;
          }
          if (errorMessgae) this.showErrorText = errorMessgae;
          if (errorMessgae) this.toast.show({ message: errorMessgae, type: 'fail' });
        }
        break;
      }
      case 1: {
        // 手机号绑定
        const callbackData: any = await this.accountApi.postBindmobile(
          this.currentPhoneZone,
          this.phone,
          this.uniCode,
          this.authcode,
          this.smsVoice,
        );
        if (callbackData.success) {
          stepper.next();
        } else {
          //失败
          this.showErrorText = callbackData.message;
          this.toast.show({ message: callbackData.message, type: 'fail' });
        }
        break;
      }
      default:
        break;
    }
    this.isLoading = false;
  }

  /**
   * 密码规则验证
   *
   * @param element 密码输入框
   */
  onPasswordInput(element: any) {
    element.notValid = this.password.length < 1;
  }

  /**
   * 清除输入框的内容
   *
   * @param element
   */
  clearInput(element: any) {
    element.value = '';
    element.focus();
    element.dispatchEvent(new InputEvent('input'));
    if (element.timer) {
      clearTimeout(element.timer);
    }
  }
  /**
   * 控制密码的显示与隐藏
   *
   * @param element 密码输入框
   */
  showPwd(element: any) {
    element.isShowPwd = !element.isShowPwd;
    element.type = element.isShowPwd ? 'text' : 'password';
    if (element.isFocus) {
      element.focus();
      if (element.timer) {
        clearTimeout(element.timer);
      }
    }
  }
  /**
   * 手机区号选择弹出框
   *
   * @returns //
   */
  handleSelectPhone(): MatDialogRef<PhoneNumberSelecterComponent> {
    this.phone = '';
    return this.dialog.open(PhoneNumberSelecterComponent, {
      panelClass: ['phone-number-dialog-container', 'mobile-dialog'],
    });
  }

  /**
   * 手机号规则验证
   *
   * @param element 手机号输入框
   */
  onPhoneInput(element: any) {
    element.value = element.value.replace(/[^\d]/g, '');
    let countryCode = '';
    if (this.currentPhoneZone.includes('+')) {
      countryCode = this.currentPhoneZone.slice(1);
    }
    element.isValid =
      this.phone.length > 4 && this.phone.length <= 13 && this.phoneNumberService.checkVaild(this.phone, countryCode);
  }

  // 接收通过手机验证api的返回数据
  onOtpCode(event: any) {
    if (event.phone) {
      this.phone = event.phone;
    }
    this.authcode = event.authcode;
    this.isAuthValid = event.valid;
    if (event.valid && this.stepper && this.canSubmit1()) {
      this.goForward(this.stepper);
    }
  }

  /**
   * step 1 page 按钮是否可以点击
   */
  canSubmit1(): boolean {
    return this.password.length > 0 && (this.googleCaptcha.length === 6 || this.isAuthValid);
  }

  /**
   * 发送短信验证码
   */
  send(): MatDialogRef<AuthPromptComponent> | void {
    console.log('短信验证码-->');
    this.sendAuthCode(false);
  }

  /**
   * 發送驗證碼
   *
   * @param smsVoice
   */
  async sendAuthCode(smsVoice: boolean): Promise<void> {
    this.smsVoice = smsVoice;
    const result = await firstValueFrom(await this.geetest.verify());
    const param: SendMobileVerifyParams = {
      lotNumber: result?.lot_number,
      captchaOutput: result?.captcha_output,
      passToken: result?.pass_token,
      genTime: result?.gen_time,
      areaCode: `${String(this.currentPhoneZone)}`,
      mobile: this.phone,
      smsVoice: smsVoice,
      otpType: 'BindMobile',
    };
    //滑动验证成功
    if (result) {
      const callbackData = await firstValueFrom(this.authApi.sendMobileVerify(param));
      if (callbackData?.success) {
        // 测试：使用‘123456’；
        const s = {
          isSend: true,
        };
        this.onfirstSendAuthcode(s);
        this.toast.show({
          message: smsVoice
            ? this.localeService.getValue('voice_send_success')
            : this.localeService.getValue('send_sms_success'),
          type: 'success',
        });
        //倒计时 60秒
        this.timer = TIMER_MS / 1000;
        const timer = setInterval((): any => {
          if (this.timer === 1) {
            clearInterval(timer);
          }
          this.timer -= 1;
        }, 1000);
      } else {
        //发送验证码失败
        this.isFirstSendAuthcode = false;
        this.toast.show({ message: callbackData?.message || '', type: 'fail' });
      }
      setTimeout(() => {}, TIMER_MS);
    }
  }

  /**
   * 發送驗證碼后倒计时状态
   *
   * @param event
   */
  onfirstSendAuthcode(event: any) {
    this.authStatus = 'sent';
    setTimeout(() => {
      this.authStatus = 'timeout';
    }, TIMER_MS);
  }

  /**
   * 语音驗證提示
   */
  voiceAuth() {
    this.sendAuthCode(true);
  }

  /**
   * 手机验证码
   *
   * @param element 手机验证码输入框
   */
  onAuthcodeInput(element: any) {
    element.value = element.value.replace(/[^\d]/g, '');
    this.authcode = element.value;
    element.isValid = this.authcode.length === 6;
  }
  canSubmit2(): boolean {
    if (this.phone.length > 7 && this.authcode.length > 5) {
      return true;
    }
    return false;
  }

  //返回 用户安全管理页面
  async handleback() {
    this.router.navigate([this.appService.languageCode, 'userCenter', 'security']);
  }

  /**
   * ENTER 键提交
   *
   * @param stepper
   */
  checkToSubmit(stepper: MatStepper) {
    if (!this.canSubmit2()) return;
    this.goForward(stepper);
  }

  ngOnDestroy(): void {
    this.accountSub?.unsubscribe();
  }
}
