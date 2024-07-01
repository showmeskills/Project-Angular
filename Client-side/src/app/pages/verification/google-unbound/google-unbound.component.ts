import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { AccountApi } from 'src/app/shared/apis/account.api';
import { VerifyAction } from 'src/app/shared/interfaces/auth.interface';
import { EncryptService } from 'src/app/shared/service/encrypt.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';

export const TIMER_MS = 90000;

@Component({
  selector: 'app-google-unbound',
  templateUrl: './google-unbound.component.html',
  styleUrls: ['./google-unbound.component.scss'],
})
export class GoogleUnboundComponent implements OnInit {
  constructor(
    private router: Router,
    private appService: AppService,
    private accountApi: AccountApi,
    private encryptService: EncryptService,
    private toast: ToastService,
    private localeService: LocaleService
  ) {}
  @ViewChild('iPwd', { static: false }) private passwordElement!: ElementRef; //密码输入框
  orderStep: number = 1; //1:表单  2:成功
  password: string = ''; //密码
  authcode: string = ''; //手机验证码
  isVerifyCode: boolean = false; //是否通过手机验证

  phone: string = ''; //手机号
  doneHeader: string = this.localeService.getValue('un_auth');
  successText: string = this.localeService.getValue('success_unbind');
  userAccountInfor: any;
  isCodeComplet: boolean = true;
  isBindMobile: boolean = false; //当前用户注册方式（手机号）or（密码）
  accountSub!: Subscription; //订阅用户信息
  authStatus = 'initial'; // 当前验证状态有 initial（初始），sent（发送），timeout（超时）
  otpType: VerifyAction = 'BindGoogleVerify';
  pagetitle: string = this.localeService.getValue('un_google_auth');
  isAuthValid: boolean = false;
  showErrorText: string = '';
  ngOnInit() {
    // 获取用户信息
    this.accountSub = this.appService.userInfo$.subscribe(x => {
      if (!x) return;
      this.userAccountInfor = x;
      this.isBindMobile = x.isBindMobile;
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
    this.showErrorText = '';
    this.authcode = event.authcode;
    this.phone = event.phone;
    this.isAuthValid = event.valid;
    if (event.valid) {
      this.handleSubmit(false);
    }
  }

  //接收验证是否通过
  onReceiveVerfityInputSuccess(x: any) {
    this.phone = x.phone;
    this.isVerifyCode = x;
  }

  canSubmit(): boolean {
    const phoneValid = this.isBindMobile && this.isAuthValid;
    const passValid = this.password.length > 4;
    if (this.isBindMobile) {
      return passValid && phoneValid;
    } else {
      return passValid;
    }
  }
  /**
   * 發送驗證碼
   */
  onfirstSendAuthcode() {
    this.authStatus = 'sent';
    setTimeout(() => {
      this.authStatus = 'timeout';
    }, TIMER_MS);
  }

  //解除绑定 按钮
  async handleSubmit(smsVoice: boolean) {
    //加密密码
    const passsword = this.encryptService.encrypt(this.password);
    const callBackResult: any = await this.accountApi.postUnboundGoogle(
      this.userAccountInfor.areaCode,
      this.phone,
      passsword,
      this.authcode,
      smsVoice
    );
    if (callBackResult.success) {
      this.orderStep = 2;
      this.toast.show({ message: this.localeService.getValue('auth_unbound'), type: 'success' });
      // 刷新数据
    } else {
      this.showErrorText = callBackResult.message;
      this.toast.show({ message: callBackResult.message, type: 'fail' });
    }
  }

  //返回 用户安全管理页面
  async handleback() {
    // 返回安全页面
    this.router.navigate([this.appService.languageCode, 'userCenter', 'security']);
  }

  /**
   * ENTER 键提交
   */
  checkToSubmit() {
    if (!this.canSubmit()) return;
    this.handleSubmit(false);
  }

  ngOnDestroy(): void {
    this.accountSub?.unsubscribe();
  }
}
