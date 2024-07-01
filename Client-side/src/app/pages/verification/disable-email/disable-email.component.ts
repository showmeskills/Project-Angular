import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { AccountApi } from 'src/app/shared/apis/account.api';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { VerifyAction } from 'src/app/shared/interfaces/auth.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { TIMER_MS } from '../google-unbound/google-unbound.component';

@UntilDestroy()
@Component({
  selector: 'app-disable-email',
  templateUrl: './disable-email.component.html',
  styleUrls: ['./disable-email.component.scss'],
})
export class DisableEmailComponent implements OnInit {
  constructor(
    private appService: AppService,
    private router: Router,
    private accountApi: AccountApi,
    private toast: ToastService,
    private localeService: LocaleService
  ) {}
  otpType: VerifyAction = 'UnBindEmail';

  /** 手机验证码  */
  authcode: string = '';

  /** 用户信息 */
  userAccountInfor?: AccountInforData;

  /** 当前验证状态有 initial（初始），sent（发送），timeout（超时） */
  authStatus = 'initial';

  /** loading 状态 */
  isLoading: boolean = false;

  /** 手机号 */
  mobile!: string;

  /** 手机是否验证通过 */
  isPhoneValid: boolean = false;

  /** 是否是语言 */
  smsVoice: boolean = false;

  /** 邮件 */
  email: string = '';

  /** 邮箱验证状态 */
  emailAuthStatus = 'initial';

  /** 邮箱验证 */
  isEmailAuthValid: boolean = false;

  /** 邮箱验证码 */
  emailAuthCode: string = '';

  /** 解绑成功 */
  disableSuccess: boolean = false;

  ngOnInit() {
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe(x => {
      if (x) {
        this.userAccountInfor = x;
      } else {
        this.router.navigateByUrl(`/${this.appService.languageCode}/userCenter/security`);
      }
    });
  }

  /** 是否可以提交表单 */
  get canSubmit(): boolean {
    return this.isPhoneValid && this.isEmailAuthValid;
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

  /** 邮件发送改变状态 */
  handleEmailAuthStatus() {
    this.emailAuthStatus = 'sent';
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
   * 提交验证表单
   */
  handleSubmit() {
    if (!this.userAccountInfor) return;
    if (!this.canSubmit) return;
    this.isLoading = true;
    const param = {
      areaCode: this.userAccountInfor.areaCode,
      mobile: this.mobile,
      otpCode: this.authcode,
      otpType: this.otpType,
      smsVoice: this.smsVoice,
      emailCode: this.emailAuthCode,
    };

    this.accountApi.disabledEmail(param).subscribe(response => {
      this.isLoading = false;
      if (response.data) {
        this.disableSuccess = true;
        this.toast.show({ message: this.localeService.getValue('unbind_success'), type: 'success' });
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
