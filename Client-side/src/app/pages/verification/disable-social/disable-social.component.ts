import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { firstValueFrom } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { AccountApi } from 'src/app/shared/apis/account.api';
import { AuthApi } from 'src/app/shared/apis/auth.api';
import { AuthPromptComponent } from 'src/app/shared/components/auth-prompt/auth-prompt.component';
import { ThirdAuthService } from 'src/app/shared/components/third-auth/third-auth.service';
import { SendMobileVerifyParams, VerifyAction } from 'src/app/shared/interfaces/auth.interface';
import { EncryptService } from 'src/app/shared/service/encrypt.service';
import { GeetestService } from 'src/app/shared/service/geetest.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { TIMER_MS } from '../google-unbound/google-unbound.component';
@UntilDestroy()
@Component({
  selector: 'app-disable-social',
  templateUrl: './disable-social.component.html',
  styleUrls: ['./disable-social.component.scss'],
})
export class DisableSocialComponent implements OnInit {
  constructor(
    private geetest: GeetestService,
    private authApi: AuthApi,
    private toast: ToastService,
    private localeService: LocaleService,
    private thirdAuthService: ThirdAuthService,
    private accountApi: AccountApi,
    private router: Router,
    private appService: AppService,
    private encryptService: EncryptService
  ) {}

  /** 是否第一次發送驗證碼 */
  isFirstSendAuthcode: boolean = true;

  /** 是否已發送驗證碼 */
  isSendAuthcode: boolean = false;

  isLinear = false;

  /** 密码 */
  password: string = '';

  /** 手机验证码 */
  authcode: string = '';

  /** 手机号 */
  phone: string = '';

  /** 当前手机区号 */
  currentPhoneZone: string = '';

  /** 当前验证状态有 initial（初始），sent（发送），timeout（超时） */
  authStatus = 'initial';

  /** 手机号输入框 */
  timer = TIMER_MS / 1000;

  otpType: VerifyAction = 'UnBindSocial';

  /** otp smsVoice false:短信 true:语音 */
  smsVoice: boolean = false;

  isAuthValid: boolean = false;

  isLoading: boolean = false;

  showErrorText: string = '';

  /** 社交媒体信息 */
  userSocicalInfo?: any;

  uniCode: string = '';

  ngOnInit() {
    this.thirdAuthService.unBindSocialData$.pipe(untilDestroyed(this)).subscribe(data => {
      if (!data) {
        this.router.navigateByUrl(`/${this.appService.languageCode}/userCenter/security`);
        return;
      }
      this.userSocicalInfo = data;
    });
  }

  /**
   * 解绑操作
   */
  unBindSocial() {
    const params = {
      socialUserId: this.userSocicalInfo?.socialUserId,
      userType: this.userSocicalInfo?.socialUserType,
      password: this.encryptService.encrypt(this.password),
      areaCode: this.userSocicalInfo?.areaCode,
      otpCode: this.authcode,
      smsVoice: this.smsVoice,
      otpType: this.otpType,
      mobile: this.phone,
    };
    this.accountApi.socialUserUnbind(params).subscribe(data => {
      if (data.code === '2002') {
        this.toast.show({
          message: data.message,
          type: 'fail',
        });
        return;
      }
      if (data?.data) {
        this.toast.show({
          message: this.localeService.getValue('unbind_success'),
          type: 'success',
        });
      } else {
        this.toast.show({
          message: this.localeService.getValue('unbind_failed'),
          type: 'fail',
        });
      }
      this.router.navigateByUrl(`/${this.appService.languageCode}/userCenter/security`);
    });
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
   * 密码规则验证
   *
   * @param element 密码输入框
   */
  onPasswordInput(element: any) {
    this.showErrorText = '';
    //规则1：密码长度为8-16个字符
    element.isValid1 = this.password.length >= 8 && this.password.length <= 16;
    //规则2：必须包含1位数字
    element.isValid2 = /\d/.test(this.password);
    //规则3：必须包含1位大写字母
    element.isValid3 = /[A-Z]/.test(this.password);
    //是否全部验证通过
    element.isValid = element.isValid1 && element.isValid2 && element.isValid3;
    //密码强度判断
    if (this.password.length < 8) {
      element.strength = 1;
      return;
    }
    let strength = 0;
    if (element.isValid2) strength += 1;
    if (element.isValid3) strength += 1;
    //小写字母
    if (/[a-z]/.test(this.password)) strength += 1;
    //特殊符号
    if (/[^\w\s]+/.test(this.password)) strength += 1;
    element.strength = strength;
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
   * 手机号规则验证
   *
   * @param element 手机号输入框
   */
  onPhoneInput(element: any) {
    element.value = element.value.replace(/[^\d]/g, '');
    this.phone = element.value;
    element.isValid = this.phone.length > 4 && this.phone.length <= 13;
  }

  // 接收通过手机验证api的返回数据
  onOtpCode(event: any) {
    if (event.phone) {
      this.phone = event.phone;
    }
    this.authcode = event.authcode;
    this.isAuthValid = event.valid;
    if (event.valid && this.canSubmit()) {
      this.unBindSocial();
    }
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
      otpType: 'UnBindSocial',
    };
    // 滑动验证成功
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
   * 手机验证码
   *
   * @param element 手机验证码输入框
   */
  onAuthcodeInput(element: any) {
    element.value = element.value.replace(/[^\d]/g, '');
    this.authcode = element.value;
    element.isValid = this.authcode.length === 6;
  }
  /**
   * 按钮是否可以点击
   */
  canSubmit(): boolean {
    return this.password.length > 2 && this.isAuthValid;
  }
}
