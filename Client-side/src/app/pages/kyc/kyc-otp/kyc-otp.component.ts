import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription, firstValueFrom, interval } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { AuthApi } from 'src/app/shared/apis/auth.api';
import { AuthPromptComponent } from 'src/app/shared/components/auth-prompt/auth-prompt.component';
import { PhoneNumberSelecterComponent } from 'src/app/shared/components/phone-number-selecter/phone-number-selecter.component';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { SendMobileVerifyParams, TIMER_MS, VerifyAction } from 'src/app/shared/interfaces/auth.interface';
import { CacheService } from 'src/app/shared/service/cache.service';
import { GeetestService } from 'src/app/shared/service/geetest.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PhoneNumberService } from 'src/app/shared/service/phone-number-validation';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';

@UntilDestroy()
@Component({
  selector: 'app-kyc-otp',
  templateUrl: './kyc-otp.component.html',
  styleUrls: ['./kyc-otp.component.scss'],
})
export class KycOtpComponent implements OnInit, OnDestroy, OnChanges {
  constructor(
    private phoneNumberService: PhoneNumberService,
    private toast: ToastService,
    private geetest: GeetestService,
    private appService: AppService,
    private authApi: AuthApi,
    private dialog: MatDialog,
    private localeService: LocaleService,
    private cacheService: CacheService,
    private popupService: PopupService,
  ) {}

  otpType: VerifyAction = 'BindMobile'; //otp数据类型 ！！
  geetestData: any = {}; //滑动组件传值

  @Output() inputValue = new EventEmitter();
  @Input() phoneInfor?: string = ''; //用户手机信息
  @Input() boundPhone!: boolean; //用户手机信息
  @Input() required?: boolean = false;
  phone: any = ''; //手机号
  phoneError: boolean = false;
  fogClassName: string = ''; //当前手机区号国家
  authcode: string = ''; //手机验证码        api need
  timer: number = 60; //倒计时
  submitLoading: boolean = false; //是否在提交中
  isSendAuthcode: boolean = false; //是否已發送驗證碼
  isFirstSendAuthcode: boolean = true; //是否第一次發送驗證碼
  isVerifyCode: boolean = false; //是否通过手机验证
  authStatus: string = 'initial'; //当前验证状态

  currentPhoneZone: string = '';
  /** 加载中 */
  isLoading: boolean = false;

  /** 时间订阅 */
  timeSubject!: Subscription;

  ngOnInit() {
    // 获取当前国家代码（泰国/越南；
    this.appService.currentCountry$
      .pipe(
        untilDestroyed(this),
        filter(x => x),
      )
      .subscribe(x => {
        //获取当前手机区号
        if (!this.boundPhone) {
          this.currentPhoneZone = x.areaCode;
          // 对后台国家code字段进行规则矫正
          this.getFogClass(x.code);
        }
      });

    this.phone = this.phoneInfor;

    if (this.boundPhone) {
      this.currentPhoneZone = this.appService.userInfo$.value?.areaCode ?? '+86';
      const country = this.cacheService.countries.find(
        x => x.iso == (this.appService.userInfo$.value?.mobileRegionCode ?? 'CN'),
      );
      if (country) {
        this.getFogClass(country.code);
      }
    } else {
      this.onPhoneInput();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.phone = changes.phoneInfor.currentValue;
  }

  ngOnDestroy(): void {
    if (this.timeSubject) this.timeSubject.unsubscribe();
  }

  getFogClass(code: string) {
    const fogClassNameReplace = code.replace(/\&/g, '_and_').replace(/ /g, '_').replace(/\,/g, '').replace(/\./g, '');
    this.fogClassName = `country-${fogClassNameReplace}`;
  }

  handleSelectPhone(event: any): MatDialogRef<PhoneNumberSelecterComponent> | void {
    const key = event['pointerId'] || 1;
    if (key !== -1) {
      return this.dialog.open(PhoneNumberSelecterComponent, {
        panelClass: ['phone-number-dialog-container', 'mobile-dialog'],
      });
    }
    return;
  }

  /**
   * Input Focus事件
   *
   * @param element
   */
  onFocus(element: any) {
    element.isFocus = true;
  }

  /**
   * Input Blur事件
   *
   * @param element
   */
  onBlur(element: any) {
    //延迟200MS，防止clear无法点击
    element.timer = setTimeout(() => {
      element.isFocus = false;
    }, 200);
  }
  /**
   * 手机号规则验证
   *
   */
  onPhoneInput() {
    this.inputValue.emit({ type: 'phone', value: this.phone });
    const lengthValid = this.phone.length >= 2;
    this.phoneError = lengthValid && !this.phoneNumberService.checkVaild(this.phone, this.currentPhoneZone.substr(1));
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
   * Input 手机号输入框Blur事件 对手机号进行验证
   *
   * @param element
   */
  onPhoneBlur(element: any) {
    //解决报错
    if (String(this.phone).length < 1) return;

    let countryCode = '';
    if (this.currentPhoneZone.includes('+')) {
      countryCode = this.currentPhoneZone.substr(1);
    }
    const isVaild = this.phoneNumberService.checkVaild(this.phone, countryCode);
    element.isValid = isVaild;

    element.timer = setTimeout(() => {
      element.isFocus = false;
    }, 200);
  }

  /**
   * 手机验证码
   *
   * @param element 手机验证码输入框
   */
  onAuthcodeInput() {
    this.inputValue.emit({ type: 'authcode', value: this.authcode });
    // const completeData = {
    //   valid: this.authcodeElement.nativeElement.isValid,
    //   geetestData: this.geetestData,
    //   authCode: this.authcode
    // }
    //this.verfityInputSuccess.emit(completeData);
  }

  /**
   * 发送短信验证码
   *
   * @param smsVoice
   */
  send(smsVoice: boolean): MatDialogRef<AuthPromptComponent> | void {
    if (this.isLoading) return;
    this.inputValue.emit({ type: 'smsVoice', value: smsVoice });
    if (!this.phone) {
      this.toast.show({
        title: this.localeService.getValue('hint'),
        message: this.localeService.getValue('phone_error_msg'),
        type: 'fail',
      });
      this.handleAuthStatus(false);
      // return;
    } else {
      this.sendAuthCode(smsVoice);
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
        areaCode: `${String(this.currentPhoneZone)}`,
        mobile: this.phone,
        smsVoice: smsVoice,
        otpType: this.otpType,
      };
      const callbackData = await firstValueFrom(this.authApi.sendMobileVerify(param));
      if (callbackData?.success) {
        // 测试：使用‘123456’；
        const s = {
          isSend: true,
        };
        this.handleAuthStatus(true);
        this.toast.show({
          message: smsVoice
            ? this.localeService.getValue('voice_send_success')
            : this.localeService.getValue('send_sms_success'),
          type: 'success',
        });

        //倒计时 60秒
        if (this.timeSubject) this.timeSubject.unsubscribe();
        this.timer = TIMER_MS / 1000;

        this.timeSubject = interval(1000).subscribe(() => {
          if (this.timer === 1) {
            this.timeSubject.unsubscribe();
          }
          this.timer -= 1;
        });
      } else {
        //发送验证码失败
        this.toast.show({
          message: callbackData?.message || '',
          type: 'fail',
        });
      }
      setTimeout(() => {}, TIMER_MS);
    }
    this.isLoading = false;
  }

  /**
   * 發送驗證碼
   *
   * @param event
   */
  handleAuthStatus(event: any) {
    if (!event) {
      //没有手机号
      return;
    }

    this.authStatus = 'sent';
    this.inputValue.emit({ type: 'authStatus', value: true });
    setTimeout(() => {
      this.authStatus = 'timeout';
    }, TIMER_MS);
  }

  /** 语音提示弹窗 */
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
          this.send(true);
        },
      },
    });
  }
}
