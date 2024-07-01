import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { ResetPassWordApi } from 'src/app/shared/apis/reset-password.api';
import { PhoneNumberSelecterComponent } from 'src/app/shared/components/phone-number-selecter/phone-number-selecter.component';
import { ResetPwdVerifyByEmailParams, VerifyAction } from 'src/app/shared/interfaces/auth.interface';
import { EMAIL_VALID_REGEXP } from 'src/app/shared/service/general.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PhoneNumberService } from 'src/app/shared/service/phone-number-validation';
import { ToastService } from 'src/app/shared/service/toast.service';
import { PasswordService } from '../password.service';

export const TIMER_MS = 90000;

@UntilDestroy()
@Component({
  selector: 'app-phone-auth',
  templateUrl: './phone-auth.component.html',
  styleUrls: ['./phone-auth.component.scss'],
  host: { class: 'flex' },
})
export class PhoneAuthComponent implements OnInit {
  constructor(
    private appService: AppService,
    private dialog: MatDialog,
    private passwordService: PasswordService,
    private resetPassWordApi: ResetPassWordApi,
    private toast: ToastService,
    private phoneNumberService: PhoneNumberService,
    private localeService: LocaleService
  ) {}
  @ViewChild('iPhone', { static: false }) private phoneElement!: ElementRef; //手机号输入框
  @ViewChild('iAuthcode', { static: false }) private authcodeElement!: ElementRef; //手机号输入框

  submitLoading: boolean = false; //是否在注册中
  isPasswordSame: boolean = false; // 重复输入密码是否与新密码一致
  phone: string = ''; //手机号
  authcode: string = ''; //手机验证码
  fogClassName = ''; //当前手机区号国家
  currentPhoneZone = ''; //当前手机区号
  isFirstSendAuthcode: boolean = true; //是否第一次發送驗證碼
  isSendAuthcode: boolean = false; //是否已發送驗證碼
  isAuthValid: boolean = false;
  authStatus = 'initial'; // 当前验证状态有 initial（初始），sent（发送），timeout（超时）
  smsVoice: boolean = false;
  otpType: VerifyAction = 'ResetPwd'; //避免otp验证码错误情况
  phoneEmpty: boolean = false;

  phoneError!: boolean;

  /** 当前激活的验证下表 */
  activeIndex: number = 0;

  /** 邮箱 */
  emailValue: string = '';

  /** 邮箱 status */
  emailAuthStatus = 'initial';

  /** 邮箱是否验证通过 */
  isEmailAuthValid: boolean = false;

  /** 邮箱验证码 */
  emailAuthCode: string = '';

  /** 邮箱提示错误 */
  emailErrorText: string = '';

  /** 检查邮箱格式 */
  emailValid: boolean = false;

  ngOnInit(): void {
    this.appService.currentCountry$
      .pipe(
        untilDestroyed(this),
        filter(x => x)
      )
      .subscribe(x => {
        //获取当前手机区号
        this.currentPhoneZone = x.areaCode;
        this.fogClassName = this.className(x.code);
        this.phone = '';
      });
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

  /**發送驗證碼 */
  handleAuthStatus(event: any) {
    if (event) {
      this.authStatus = 'sent';
      setTimeout(() => {
        this.authStatus = 'timeout';
      }, TIMER_MS);
    }
  }

  /**
   * 注册
   */
  async submit() {
    if (!this.canSubmit) return;
    this.submitLoading = true;
    // 手机 获取后端返回数据，是否通过验证
    if (this.activeIndex === 1) {
      const result = await this.resetPassWordApi.postResetOpt(
        this.currentPhoneZone,
        this.phone,
        this.authcode,
        this.smsVoice
      );
      const callBackData: any = result;
      if (result && callBackData.success) {
        this.passwordService.uniCode = callBackData.data.uniCode;
        this.passwordService.orderStepSubject.next(2);
        this.submitLoading = false;
      } else {
        this.submitLoading = false;
        this.toast.show({
          message: callBackData.message,
          type: 'fail',
        });
      }
    }

    // 邮箱 获取后端返回数据，是否通过验证
    if (this.activeIndex === 0) {
      const param: ResetPwdVerifyByEmailParams = {
        email: this.emailValue,
        emailCode: this.emailAuthCode,
        otpType: this.otpType,
      };
      const result = await firstValueFrom(this.resetPassWordApi.onResetPwdVerifyByEmail(param));
      if (result && result.success) {
        if (result?.data?.isExisted) {
          this.passwordService.uniCode = result.data.uniCode;
          this.passwordService.orderStepSubject.next(2);
        } else {
          this.toast.show({
            message: this.localeService.getValue('email_no_reg'),
            type: 'fail',
          });
        }
      } else {
        this.toast.show({
          message: result.message,
          type: 'fail',
        });
      }
      this.submitLoading = false;
    }
  }

  /** 邮箱输入框事件 */
  onChangeEmailValue() {
    this.emailValid = EMAIL_VALID_REGEXP.test(this.emailValue);

    this.emailErrorText = !!this.emailValue && !this.emailValid ? this.localeService.getValue('email_err') : '';
  }

  /**手机区号选择弹出框 */
  handleSelectPhone() {
    if (this.submitLoading) return;
    this.dialog.open(PhoneNumberSelecterComponent, {
      panelClass: ['phone-number-dialog-container', 'mobile-dialog'],
    });
  }

  /**
   * 手机号规则验证
   */
  onPhoneInput() {
    this.phoneError =
      this.phone.length >= 2 && !this.phoneNumberService.checkVaild(this.phone, this.currentPhoneZone.slice(1));
  }

  /**
   * 按钮是否可以点击
   */
  get canSubmit(): boolean {
    // 邮箱验证
    if (this.activeIndex === 0) {
      return this.emailValid && !!this.emailValue && this.isEmailAuthValid;
    }

    // 手机验证
    if (this.activeIndex === 1) {
      return this.phone.length >= 2 && !this.phoneError && this.isAuthValid && !this.submitLoading;
    }

    return false;
  }

  /**
   * 發送驗證碼
   */
  sendAuthCode() {
    this.isSendAuthcode = true;
    this.isFirstSendAuthcode = false;
    setTimeout(() => {
      this.isSendAuthcode = false;
    }, 60000);
  }

  /**
   *
   * @param event 接收组件传值
   */
  onOtpCode(event: any) {
    this.isAuthValid = event.valid;
    this.authcode = event.authcode;
    if (event.valid) {
      this.submit();
    }
  }

  /** 邮件首次发送 验证吗 */
  onFirstSendEmailAuthCode() {
    this.emailAuthStatus = 'sent';
    setTimeout(() => {
      this.emailAuthStatus = 'timeout';
    }, TIMER_MS);
  }

  /**
   * 邮箱发送otp
   *
   * @param event
   */
  onEmailOtpCode(event: any) {
    this.emailAuthCode = event.emailAuthCode;
    this.emailValue = event.email;
    this.isEmailAuthValid = event.valid;
    if (event.valid) {
      this.submit();
    }
  }

  chatLive() {
    this.appService.toOnLineService$.next(true);
  }
}
