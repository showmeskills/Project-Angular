import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { AccountApi } from 'src/app/shared/apis/account.api';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { VerifyAction } from 'src/app/shared/interfaces/auth.interface';
import { EncryptService } from 'src/app/shared/service/encrypt.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';

export const TIMER_MS = 90000;

@Component({
  selector: 'app-unbound-phone',
  templateUrl: './unbound-phone.component.html',
  styleUrls: ['./unbound-phone.component.scss'],
})
export class UnboundPhoneComponent implements OnInit {
  constructor(
    private router: Router,
    private appService: AppService,
    // private resetPassWordApi: ResetPassWordApi,
    private accountApi: AccountApi,
    private toast: ToastService,
    private encryptService: EncryptService,
    private localeSer: LocaleService
  ) {}
  // @ViewChild("iGoogleCaptcha", { static: false }) private googleCaptchaElement!: ElementRef;       //谷歌验证码输入框
  // @ViewChild("iPwd", { static: false }) private passwordElement!: ElementRef;                     //密码输入框
  authStatus = 'initial'; // 当前验证状态有 initial（初始），sent（发送），timeout（超时）
  orderStep: number = 1; //1:表单  2:成功
  password: string = ''; //密码
  authcode: string = ''; //手机验证码
  isVerifyCode: boolean = false; //是否通过手机验证

  phone: string = ''; //手机号
  googleCaptcha: string = ''; //谷歌验证码
  doneHeader: string = this.localeSer.getValue('phone_unbundle');
  successText: string = this.localeSer.getValue('success_unbind');
  userAccountInfor!: AccountInforData;
  isCodeComplet: boolean = true;
  submitLoading: boolean = false; //是否在注册中
  accountSub!: Subscription; //订阅用户信息
  otpType: VerifyAction = 'BindMobile';
  pagetitle: string = this.localeSer.getValue('unbind_phones');
  isAuthValid: boolean = false;

  ngOnInit() {
    // 获取用户信息
    this.accountSub = this.appService.userInfo$.subscribe(x => {
      if (!x) return;
      this.userAccountInfor = x;
    });
  }

  back() {
    // 返回安全页面
    this.router.navigate([this.appService.languageCode, 'userCenter', 'security']);
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
  // 接收通过手机验证api的返回数据
  onOtpCode(event: any) {
    this.authcode = event.authcode;
    this.phone = event.phone;
    this.isAuthValid = event.valid;
  }

  //接收验证是否通过
  onReceiveVerfityInputSuccess(x: any) {
    this.phone = x.phone;
    this.isVerifyCode = x;
  }

  canSubmit(): boolean {
    const isPasswordValid = this.password.length > 2;
    const isGoogleValid = this.googleCaptcha.length === 6;
    const authCondition = isGoogleValid || this.isAuthValid;
    return isPasswordValid && authCondition;
  }

  /**
   * 發送驗證碼
   *
   * @param event
   */
  onfirstSendAuthcode(event: any) {
    this.authStatus = 'sent';
    setTimeout(() => {
      this.authStatus = 'timeout';
    }, TIMER_MS);
  }

  //解除绑定 按钮
  async handleSubmit() {
    this.submitLoading = true;
    // 密码加密
    const password = this.encryptService.encrypt(this.password);
    const callback: any = await this.accountApi.postUnboundPhone(
      this.userAccountInfor.areaCode,
      this.phone,
      password,
      this.googleCaptcha,
      this.authcode
    );
    this.submitLoading = false;
    if (callback.success) {
      this.orderStep = 2;
      this.toast.show({ message: this.localeSer.getValue('phone_unbound'), type: 'success' });
    } else {
      //未通过
      this.toast.show({ message: callback.message, type: 'fail' });
    }
  }

  //返回 用户安全管理页面
  async handleback() {
    // 返回安全页面
    this.router.navigate([this.appService.languageCode, 'userCenter', 'security']);
  }

  ngOnDestroy(): void {
    this.accountSub?.unsubscribe();
  }
}
