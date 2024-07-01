import { Component, OnInit, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
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
  selector: 'app-google-verification',
  templateUrl: './google-verification.component.html',
  styleUrls: ['./google-verification.component.scss'],
})
export class GoogleVerificationComponent implements OnInit {
  constructor(
    private router: Router,
    private appService: AppService,
    private accountApi: AccountApi,
    private toast: ToastService,
    private encryptService: EncryptService,
    private localeService: LocaleService
  ) {}

  @ViewChild('stepper') stepper?: MatStepper; // stepper 控制器
  // @ViewChild("iGoogleCaptcha", { static: false }) private googleCaptchaElement!: ElementRef;       //谷歌验证码输入框
  // @ViewChild("iPwd", { static: false }) private passwordElement!: ElementRef;                      //密码输入框
  isRipple = true; //是否需要切换step时的涟漪效果
  isBindMobile: boolean = false; //当前用户注册方式（手机号）or（密码）
  password: string = ''; //密码
  authcode: string = ''; //手机验证码
  isVerifyCode: boolean = false; //是否通过手机验证
  phone: string = ''; //手机号   -----！！测试
  googleCaptcha: string = ''; //谷歌验证码
  googleValideCode: string = ''; //谷歌验证二维码
  googleValidekey: string = ''; //谷歌验证密钥
  userAccountInfor: any;
  currentPhoneZone: string = ''; //当前手机区号
  isCodeComplet: boolean = true;
  secretPassword: string = '';
  accountSub!: Subscription; //订阅用户信息
  stepRoot: any;
  // doneHeader: string = "身份验证器已绑定";
  // successText: string = "您已成功绑定身份验证器来保护您的帐户。";
  authStatus = 'initial'; // 当前验证状态有 initial（初始），sent（发送），timeout（超时）
  otpType: VerifyAction = 'BindGoogleVerify';
  // pagetitle: string = "绑定谷歌验证";
  isAuthValid: boolean = false;
  isLoading: boolean = false;

  async ngOnInit() {
    // 获取用户信息  (区号/电话)
    this.accountSub = this.appService.userInfo$.subscribe(x => {
      if (!x) return;
      this.userAccountInfor = x;
      this.isBindMobile = x.isBindMobile;
      this.currentPhoneZone = x.areaCode ? x.areaCode : '';
    });

    const googleInfor = await this.accountApi.postGoogleValiedCode();
    const { data, success }: any = googleInfor;
    if (success) {
      this.googleValideCode = data.qrCodeUrl;
      this.googleValidekey = data.manualEntryKey;
    }
  }

  back() {
    // 返回安全页面
    this.router.navigate([this.appService.languageCode, 'userCenter', 'security']);
  }

  //stepper 上一步 btn
  goBack(stepper: MatStepper) {
    const step: any = stepper;
    this.stepRoot = step;
    // this.removerLineColor(step);
    stepper.previous();
  }

  //stepper 下一步 btn
  async goForward(stepper: MatStepper) {
    if (stepper.selectedIndex == 3) {
      this.isLoading = true;
      // const isValid: boolean = this.checkForm();
      if (this.next()) {
        // 绑定账户
        if (this.isBindMobile) {
          this.password = '';
        } else {
          this.secretPassword = this.encryptService.encrypt(this.password);
        }
        const callBackResult: any = await this.accountApi.postBindGoogle(
          this.currentPhoneZone,
          this.phone,
          this.authcode,
          this.secretPassword,
          this.googleCaptcha,
          false
        );
        if (callBackResult.success) {
          // this.addLineColor(stepper);
          stepper.next();
          this.toast.show({ message: this.localeService.getValue('google_veri_success'), type: 'success' });
        } else {
          this.googleCaptcha = ' ';
          this.toast.show({ message: callBackResult.message, type: 'fail' });
        }
      }
      this.isLoading = false;
    } else {
      stepper.next();
    }
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
    if (this.next() && this.stepper) {
      this.goForward(this.stepper);
    }
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

  // //添加 line color
  // addLineColor(step: any) {
  //   let stepperCss = document.getElementsByClassName('mat-stepper-horizontal-line');
  //   let i = step.selectedIndex
  //   stepperCss.item(i)?.classList.add('editState');
  // }
  // //移除 line color
  // removerLineColor(step: any) {
  //   let stepperCss = document.getElementsByClassName('mat-stepper-horizontal-line');
  //   let i = step.selectedIndex - 1;
  //   stepperCss.item(i)?.classList.remove('editState');
  // }
  /**
   * step 4 page 按钮是否可以点击
   */
  next(): boolean {
    return this.googleCaptcha.length == 6 && (this.password.length >= 8 || this.isAuthValid);
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

  // 接收通过手机验证api的返回数据
  onOtpCode(event: any) {
    this.authcode = event.authcode;
    this.phone = event.phone;
    this.isAuthValid = event.valid;
    if (event.valid && this.stepper) {
      this.goForward(this.stepper);
    }
  }

  //返回 用户安全管理页面
  async handleback() {
    // 返回安全页面
    this.router.navigate([this.appService.languageCode, 'userCenter', 'security']);
  }
  /**
   * ENTER 键提交
   *
   * @param stepper
   */
  checkToSubmit(stepper: MatStepper) {
    if (!this.next()) return;
    this.goForward(stepper);
  }

  ngOnDestroy(): void {
    this.accountSub?.unsubscribe();
  }
}
