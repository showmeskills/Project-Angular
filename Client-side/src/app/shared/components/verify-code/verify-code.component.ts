import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription, firstValueFrom, interval } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { AccountApi } from '../../apis/account.api';
import { AuthApi } from '../../apis/auth.api';
import { EnableEmailFirstParams } from '../../interfaces/account.interface';
import {
  SendEmailVerfiyParams,
  SendMobileVerifyParams,
  TIMER_MS,
  VerifyAction,
  VerifyType,
} from '../../interfaces/auth.interface';
import { ResponseData } from '../../interfaces/response.interface';
import { GeetestService } from '../../service/geetest.service';
import { LocaleService } from '../../service/locale.service';
import { PopupService } from '../../service/popup.service';
import { ToastService } from '../../service/toast.service';
import { AuthPromptComponent } from '../auth-prompt/auth-prompt.component';
import { StandardPopupComponent } from '../standard-popup/standard-popup.component';

@UntilDestroy()
@Component({
  selector: 'app-verify-code',
  templateUrl: './verify-code.component.html',
  styleUrls: ['./verify-code.component.scss'],
})
export class VerifyCodeComponent implements OnInit {
  constructor(
    private geetest: GeetestService,
    private authApi: AuthApi,
    private dialog: MatDialog,
    private appService: AppService,
    private toast: ToastService,
    private popupService: PopupService,
    private localeService: LocaleService,
    private accountApi: AccountApi,
    private popup: PopupService
  ) {}
  /** --------公共参数--------- */
  /** verifyType 提交类型 */
  @Input() verifyType: VerifyType = 'PHONE';

  /** 返回验证数据 */
  @Output() verfityInputSuccess = new EventEmitter();

  /** 发送验证码状态 */
  @Output() onChangeAuthStatus = new EventEmitter();

  /** 验证类型 */
  @Input() otpType!: VerifyAction;

  @Input() inputLabel!: string;

  /** 请输入您在手机 +886 0910111213 收到的6位验证码, 验证码30分钟有效 */
  @Input() showTextP: boolean = false;

  /** 滑动组件传值 */
  geetestData: any = {};

  /** 加载中 */
  isLoading: boolean = false;

  /** ---------邮箱参数-------- */
  /** 是在安全中绑定 邮箱使用的组件吗 */
  @Input() enableEmailFromSafe: boolean = false;

  /** 是在安全中绑定 邮箱使用的组件吗 */
  @Input() isFromSafeEmailValid: boolean = true;

  /** 邮箱验证状态 */
  @Input() emailAuthStatus: string = 'initial';

  /** 邮件地址 */
  @Input() email!: string;

  /** 邮箱authCode */
  emailAuthCode: string = '';

  /** 计时器 */
  emailTimer = TIMER_MS / 1000;

  /** 邮件时间订阅 */
  emailTimerSubject!: Subscription;

  /** ---------手机参数-------- */
  @ViewChild('iAuthcode', { static: false }) private authcodeElement!: any;

  /** 发送验证码状态 */
  @Input() authStatus: string = 'initial';

  /** 输入框下的提示语 */
  @Input() tips: string = '';

  /** 验证码提交加载状态 */
  @Input() submitLoading: boolean = false;

  /** 用户手机地区 只有安全验证传入 其余订阅用户信息 */
  @Input() currentPhoneZone: string = '';

  /** 用户手机号 只有安全验证传入 其余订阅用户信息  */
  @Input() phone!: string;

  /** 手机验证码 */
  authcode: string = '';

  /** 是否第一次發送驗證碼 */
  isFirstSendAuthcode: boolean = true;

  /** 是否已發送驗證碼 */
  isSendAuthcode: boolean = false;

  /** 计时器 */
  timer = TIMER_MS / 1000;

  /** 不完整的手机号 需要传入弹窗补全 */
  phoneNum: string = '';

  /** 补全的完整手机号 */
  completedPhoneNum!: string;

  timeSubject!: Subscription;

  /** ---------Google参数参数-------- */
  /** 谷歌验证码 */
  googleCode: string = '';

  ngOnInit(): void {
    //登录使用特定的区号，不能更改
    if (this.otpType != 'Login') {
      //如果用户登录 则订阅获取用户手机号
      this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe(x => {
        if (x?.mobile) {
          this.phone = x.mobile;
        }
      });
      this.appService.currentCountry$
        .pipe(
          untilDestroyed(this),
          filter(x => x)
        )
        .subscribe(x => {
          this.currentPhoneZone = x.areaCode;
        });
    }
  }

  /**
   * 手机验证码
   *
   * @param element 手机验证码输入框
   */
  onAuthcodeInput(element: any) {
    this.authcode = element.input.nativeElement.value.replace(/[^\d]/g, '');
    element.isValid = this.authcode.length === 6 && this.authStatus !== 'initial';
    if (this.phone.indexOf('*') == -1 && this.completedPhoneNum?.length < 1) this.completedPhoneNum = this.phone;
    const completeData = {
      valid: element.isValid,
      geetestData: this.geetestData,
      authcode: this.authcode,
      phone: this.completedPhoneNum || '',
    };
    this.verfityInputSuccess.emit(completeData);
  }

  /**
   * 邮箱验证码
   *
   * @param element
   */
  onEmailAuthcodeInput(element: any) {
    this.emailAuthCode = element.input.nativeElement.value.replace(/[^\d]/g, '');
    element.isValid = this.emailAuthCode.length === 6 && this.emailAuthCode !== 'initial';
    const completeData = {
      valid: element.isValid,
      geetestData: this.geetestData,
      emailAuthCode: this.emailAuthCode,
      email: this.email,
    };
    this.verfityInputSuccess.emit(completeData);
  }

  /**
   * 谷歌验证码
   *
   * @param element 谷歌验证码输入框
   */
  onGoogleInput(element: any) {
    element.input.nativeElement.value = element.input.nativeElement.value.replace(/[^\d]/g, '');
    this.googleCode = element.input.nativeElement.value;
    element.isValid = this.googleCode.length === 6;
    const completeData = {
      googleCode: this.googleCode,
      valid: element.isValid,
    };

    this.verfityInputSuccess.emit(completeData);
  }

  /**
   * 发送邮箱验证
   */
  async sendEmailAuthCode() {
    this.isLoading = true;
    const result = await firstValueFrom(await this.geetest.verify());
    this.geetestData.lotNumber = result?.lot_number;
    this.geetestData.captchaOutput = result?.captcha_output;
    this.geetestData.passToken = result?.pass_token;
    this.geetestData.genTime = result?.gen_time;
    // 在安全中心绑定 邮箱 需要调用另一个接口
    if (this.enableEmailFromSafe) {
      if (result) {
        const param: EnableEmailFirstParams = {
          lotNumber: result.lot_number,
          captchaOutput: result.captcha_output,
          passToken: result.pass_token,
          genTime: result.gen_time,
          email: this.email,
        };
        this.accountApi.enableEmailFirst(param).subscribe(callbackData => {
          this.isLoading = false;
          this.onProcessEmailResponse(callbackData);
        });
      } else {
        this.isLoading = false;
      }
    }

    if (!this.enableEmailFromSafe) {
      if (result) {
        const param: SendEmailVerfiyParams = {
          lotNumber: result.lot_number,
          captchaOutput: result.captcha_output,
          passToken: result.pass_token,
          genTime: result.gen_time,
          email: this.email,
          otpType: this.otpType,
        };
        const callbackData = await firstValueFrom(this.authApi.sendEmailVerify(param));
        this.onProcessEmailResponse(callbackData);
      }
      this.isLoading = false;
    }
  }

  /**
   * 统一处理邮件返回值
   *
   * @param callbackData
   */
  onProcessEmailResponse(callbackData: ResponseData<boolean | string>) {
    // 在安全中心绑定 邮箱的时候 在滑动验证之后 发送验证短信时 返回 2120 邮箱被占用
    if (callbackData.code === '2120' && this.enableEmailFromSafe) {
      this.popup.open(StandardPopupComponent, {
        speed: 'faster',
        data: {
          type: 'warn',
          content: this.localeService.getValue('email_occupied'),
          description: `${this.email}${this.localeService.getValue('email_occupied_tips')}`,
          buttons: [{ text: this.localeService.getValue('off_button'), primary: true }],
        },
      });
      return;
    }

    if (callbackData.success) {
      const s = {
        isSend: true,
        emailUnicode: callbackData?.data, // 这个uniCode 只有在绑定邮箱时候才会用到
      };
      this.onChangeAuthStatus.emit(s);

      this.toast.show({ message: this.localeService.getValue('send_email_success'), type: 'success' });

      this.emailTimer = TIMER_MS / 1000;
      if (this.emailTimerSubject) this.emailTimerSubject.unsubscribe();
      this.emailTimerSubject = interval(1000).subscribe(() => {
        if (this.emailTimer === 1) {
          this.emailTimerSubject.unsubscribe();
        }
        this.emailTimer -= 1;
      });
    } else {
      //发送验证码失败
      this.toast.show({ message: callbackData.message, type: 'fail' });
    }
  }

  /**
   * 發送驗證碼
   *
   * @param smsVoice
   */
  async sendAuthCode(smsVoice: boolean): Promise<void> {
    this.isLoading = true;
    const result = await firstValueFrom(await this.geetest.verify());
    //滑动验证成功
    if (result) {
      this.geetestData.lotNumber = result.lot_number;
      this.geetestData.captchaOutput = result.captcha_output;
      this.geetestData.passToken = result.pass_token;
      this.geetestData.genTime = result.gen_time;

      const param: SendMobileVerifyParams = {
        lotNumber: result.lot_number,
        captchaOutput: result.captcha_output,
        passToken: result.pass_token,
        genTime: result.gen_time,
        areaCode: this.currentPhoneZone,
        mobile: this.completedPhoneNum || this.phone,
        smsVoice: smsVoice,
        otpType: this.otpType,
      };
      const callbackData = await firstValueFrom(this.authApi.sendMobileVerify(param));
      if (callbackData?.success) {
        const s = {
          isSend: true,
          smsVoice,
        };
        this.onChangeAuthStatus.emit(s);
        this.toast.show({
          message: smsVoice
            ? this.localeService.getValue('voice_send_success')
            : this.localeService.getValue('send_sms_success'),
          type: 'success',
        });
        //倒计时 60秒
        this.timer = TIMER_MS / 1000;
        if (this.timeSubject) this.timeSubject.unsubscribe();
        this.timeSubject = interval(1000).subscribe(() => {
          if (this.timer === 1) {
            this.timeSubject.unsubscribe();
          }
          this.timer -= 1;
        });
      } else {
        //发送验证码失败
        this.toast.show({ message: callbackData?.message || '', type: 'fail' });
      }
    }
    this.isLoading = false;
  }

  /**
   * 打开补全后六位手机号弹窗
   *
   * @param smsVoice
   */
  completePhoneNum(smsVoice: boolean): any {
    if (this.isLoading) return;
    if (this.phone.indexOf('*') == -1) {
      this.completedPhoneNum = this.phone;
      this.sendAuthCode(smsVoice);
      return;
    }

    const dialogRef = this.dialog.open(AuthPromptComponent, {
      panelClass: 'phone-number-dialog-container',
      data: {
        currentPhoneZone: this.currentPhoneZone,
        phoneNum: this.phone,
      },
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res == 'CLOSE' || !res) return;
      this.completedPhoneNum = res;
      this.onAuthcodeInput(this.authcodeElement);
      this.sendAuthCode(smsVoice);
    });
  }

  ngOnDestroy(): void {
    if (this.timeSubject) this.timeSubject.unsubscribe();
    if (this.emailTimerSubject) this.emailTimerSubject.unsubscribe();
  }

  notReceiveCode() {
    this.popupService.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        icon: 'assets/svg/not-received.svg',
        content: this.localeService.getValue(`sms_ver_code00`),
        alignLeft: true,
        description:
          this.localeService.getValue(`sms_ver_code01`) +
          '：\n \n 1.' +
          this.localeService.getValue(`sms_ver_code02`) +
          ' \n 2.' +
          this.localeService.getValue(`sms_ver_code03`) +
          ' \n 3.' +
          this.localeService.getValue(`sms_ver_code04`) +
          ' \n 4.' +
          this.localeService.getValue(`sms_ver_code05`) +
          ' \n 5.' +
          this.localeService.getValue(`sms_ver_code06`),
        buttons: [
          { text: this.localeService.getValue(`sms_ver_code07`), primary: false },
          { text: this.localeService.getValue(`sms_ver_code08`), primary: true },
        ],
        callback: () => {
          this.completePhoneNum(true);
        },
      },
    });
  }
}
