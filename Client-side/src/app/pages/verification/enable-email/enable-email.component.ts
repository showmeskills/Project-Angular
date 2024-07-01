import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { AccountApi } from 'src/app/shared/apis/account.api';
import { KycApi } from 'src/app/shared/apis/kyc-basic.api';
import { AccountInforData, EnableEmailSubmit } from 'src/app/shared/interfaces/account.interface';
import { VerifyAction } from 'src/app/shared/interfaces/auth.interface';
import { EncryptService } from 'src/app/shared/service/encrypt.service';
import { EMAIL_VALID_REGEXP } from 'src/app/shared/service/general.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { TIMER_MS } from '../google-unbound/google-unbound.component';

@UntilDestroy()
@Component({
  selector: 'app-enable-email',
  templateUrl: './enable-email.component.html',
  styleUrls: ['./enable-email.component.scss'],
})
export class EnableEmailComponent implements OnInit {
  constructor(
    private appService: AppService,
    private router: Router,
    private encryptService: EncryptService,
    private accountApi: AccountApi,
    private toast: ToastService,
    private localeService: LocaleService,
    private kycApi: KycApi
  ) {}

  otpType: VerifyAction = 'BindEmail';

  /** 用户信息 */
  userAccountInfor?: AccountInforData;

  /** ---- 邮箱 --- */
  email: string = '';

  /** 邮箱验证状态 */
  emailAuthStatus = 'initial';

  /** 邮箱验证码 */
  emailAuthCode: string = '';

  /** 邮箱验证 */
  isEmailAuthValid: boolean = false;

  /** 邮箱绑定第一步返回的 unicode */
  emailUnicode: string = '';

  /** ----- 手机验证码 ------  */
  authcode: string = '';

  /** 当前验证状态有 initial（初始），sent（发送），timeout（超时） */
  authStatus = 'initial';

  /** 手机号 */
  mobile!: string;

  /** 手机是否验证通过 */
  isPhoneValid: boolean = false;

  /** 是否是语言 */
  smsVoice: boolean = false;

  /** 用户密码 */
  password: string = '';

  /** 提交 loading 状态 */
  submitLoading: boolean = false;

  /** 绑定是否成功 */
  enableEmailSuccess: boolean = false;

  /** 传值给 verify-code 组件 */
  isFromSafeEmailValid: boolean = false;

  /** 邮箱错误提示 */
  emailErrorText: string = '';

  /** 邮箱格式 */
  emailValid: boolean = false;

  ngOnInit(): void {
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe(x => {
      if (x) {
        this.userAccountInfor = x;
        this.getKycContactInfo();
      } else {
        this.router.navigateByUrl(`/${this.appService.languageCode}/userCenter/security`);
      }
    });
  }

  /** 获取用户KYC 信息 */
  getKycContactInfo() {
    this.submitLoading = true;
    this.kycApi.getKycContactInfo().subscribe(response => {
      this.submitLoading = false;
      if (response?.data) {
        const { email } = response.data;
        if (email) {
          this.email = email;
          this.onChangeEmailValue();
        }
      }
    });
  }

  /** 是否可以提交表单 */
  get canSubmit(): boolean {
    /** 绑定手机用户返回 */
    if (this.userAccountInfor?.isBindMobile) {
      return this.isEmailAuthValid && this.isPhoneValid && this.emailValid;
    }
    /** 未绑定用户手机返回 */
    if (!this.userAccountInfor?.isBindMobile) {
      return this.isEmailAuthValid && this.password.length > 2 && this.emailValid;
    }
    return false;
  }

  /** email input change 事件 */
  onChangeEmailValue() {
    this.emailValid = EMAIL_VALID_REGEXP.test(this.email);

    this.emailErrorText = !!this.email && !this.emailValid ? this.localeService.getValue('email_err') : '';
    this.isFromSafeEmailValid = this.emailValid && !!this.email;
  }

  /**
   *  邮件发送改变状态
   *
   * @param $event 获取到绑定 时候 unicode
   */
  handleEmailAuthStatus($event: any) {
    this.emailAuthStatus = 'sent';
    this.emailUnicode = $event.emailUnicode;
    setTimeout(() => {
      this.emailAuthStatus = 'timeout';
    }, TIMER_MS);
  }

  /**
   * 邮箱验证otp
   *
   * @param event 验证码
   */
  onEmailOtpCode(event: any) {
    this.emailAuthCode = event.emailAuthCode;
    this.isEmailAuthValid = event.valid;
    this.email = event.email;
    if (this.isEmailAuthValid) {
      this.handleSubmit();
    }
  }

  /**
   * 接收通过手机验证api的返回数据
   *
   * @param event 验证码
   */
  onOtpCode(event: any) {
    this.authcode = event.authcode;
    this.isPhoneValid = event.valid;
    this.mobile = event.phone;
    if (this.isPhoneValid) {
      this.handleSubmit();
    }
  }
  /**
   * 發送驗證碼
   *
   * @param event
   */
  handlePhoneAuthStatus(event: any) {
    this.authStatus = 'sent';
    this.smsVoice = event?.smsVoice || false;
    setTimeout(() => {
      this.authStatus = 'timeout';
    }, TIMER_MS);
  }

  /** 提交邮箱绑定申请 第二步 */
  handleSubmit() {
    if (!this.canSubmit) return;

    this.submitLoading = true;
    const params: EnableEmailSubmit = {
      uniCode: this.emailUnicode,
      areaCode: this.userAccountInfor?.areaCode || '',
      mobile: this.mobile,
      otpCode: this.authcode,
      smsVoice: this.smsVoice,
      otpType: this.otpType,
      password: this.password.length > 0 ? this.encryptService.encrypt(this.password) : '',
      email: this.email,
      emailCode: this.emailAuthCode,
    };
    this.accountApi.enableEmailSubmit(params).subscribe(response => {
      this.submitLoading = false;

      if (response.data) {
        this.enableEmailSuccess = true;
        this.toast.show({ message: this.localeService.getValue('bind_succ'), type: 'success' });
      } else {
        this.toast.show({ message: response.message, type: 'fail' });
      }
    });
  }

  /**  返回安全页面 */
  handleback() {
    this.router.navigate([this.appService.languageCode, 'userCenter', 'security']);
  }
}
