import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { AccountApi } from 'src/app/shared/apis/account.api';
import { PhoneNumberSelecterComponent } from 'src/app/shared/components/phone-number-selecter/phone-number-selecter.component';
import { VerifyAction } from 'src/app/shared/interfaces/auth.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PhoneNumberService } from 'src/app/shared/service/phone-number-validation';
import { ToastService } from 'src/app/shared/service/toast.service';
export const TIMER_MS = 90000;

@UntilDestroy()
@Component({
  selector: 'app-phone-verification',
  templateUrl: './phone-verification.component.html',
  styleUrls: ['./phone-verification.component.scss'],
})
export class PhoneVerificationComponent implements OnInit {
  constructor(
    private toast: ToastService,
    private dialog: MatDialog,
    private appService: AppService,
    private router: Router,
    private accountApi: AccountApi,
    private phoneNumberService: PhoneNumberService,
    private localeService: LocaleService
  ) {}

  @ViewChild('stepper') stepper?: MatStepper; // stepper 控制器
  // @ViewChild("iPwd", { static: false }) private passwordElement!: ElementRef;                      //密码输入框
  // @ViewChild("iGoogleCaptcha", { static: false }) private googleCaptchaElement!: ElementRef;       //谷歌验证码输入框
  // @ViewChild("iPhone", { static: false }) private phoneElement!: ElementRef;                       //手机号输入框
  /** 当前到达第几步 */
  // currentStep: number = 1;
  isRipple = true; //是否需要切换step时的涟漪效果
  password: string = ''; //密码
  googleCaptcha: string = ''; //谷歌验证码        api need
  authcode: string = ''; //手机验证码        api  need
  fogClassName: string = ''; //当前手机区号国家   api  need
  currentPhoneZone: string = ''; //当前手机区号      api   need
  phone: string = ''; //手机号           api   need
  isBindGoogleValid: boolean = false; //是否绑定过谷歌
  accountSub!: Subscription; //订阅用户信息
  userAccountInfor: any;
  // doneHeader: string = "手机号绑定成功";
  // successText: string = "您已成功绑定您的手机号码";
  ///   api 需要
  uniCode: string = '';
  authStatus = 'initial'; // 当前验证状态有 initial（初始），sent（发送），timeout（超时）
  isLoading: boolean = false;
  otpType: VerifyAction = 'BindMobile';
  smsVoice: boolean = false;
  // pagetitle: string = "绑定手机号码";
  isAuthValid: boolean = false;
  phoneError: boolean = false;

  ngOnInit() {
    this.appService.currentCountry$
      .pipe(
        untilDestroyed(this),
        filter(x => x)
      )
      .subscribe(x => {
        //获取当前手机区号
        this.currentPhoneZone = x.areaCode;
        const fogClassNameReplace = x.code
          .replace(/\&/g, '_and_')
          .replace(/ /g, '_')
          .replace(/\,/g, '')
          .replace(/\./g, '');
        this.fogClassName = `country-${fogClassNameReplace}`;
        this.phone = '';
      });
    // 获取用户信息
    this.accountSub = this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe(x => {
      if (!x) return;
      this.userAccountInfor = x;
      this.isBindGoogleValid = x.isBindGoogleValid;
    });
  }

  //stepper 下一步 btn
  async goForward(stepper: MatStepper) {
    this.isLoading = true;
    const step: any = stepper;
    switch (step._selectedIndex) {
      case 0:
        //是否通过手机验证
        if (this.isAuthValid) {
          // 手机号绑定
          const callbackData: any = await this.accountApi.postBindmobile(
            this.currentPhoneZone,
            this.phone,
            this.uniCode,
            this.authcode,
            this.smsVoice
          );
          if (callbackData.success) {
            stepper.next();
            this.toast.show({
              message: this.userAccountInfor.isBindMobile
                ? this.localeService.getValue('modify_phone_success')
                : this.localeService.getValue('bound_phone_success'),
              type: 'success',
            });
          } else {
            let errorMsg: string = callbackData.message;
            if (!errorMsg) {
              errorMsg = this.userAccountInfor.isBindMobile
                ? this.localeService.getValue('modify_phone_failed')
                : this.localeService.getValue('bound_phone_failed');
            }
            // if (callbackData.code == '400' || callbackData.code == '401' || callbackData.code == '403' || callbackData.code == '500') {
            //   errorMsg = `api请求失败，报错：${callbackData.code}`;
            // } else {
            //   errorMsg = callbackData.message;
            // }
            this.toast.show({ message: errorMsg, type: 'fail' });
          }
        }
        break;
      default:
        break;
    }
    this.isLoading = false;
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
   * 手机区号选择弹出框
   */
  handleSelectPhone(): MatDialogRef<PhoneNumberSelecterComponent> {
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
    if (this.phone.length >= 2) {
      //inputValue要大于等于两个字符，用电话验证才不会报错
      this.phoneError = !this.phoneNumberService.checkVaild(this.phone, this.currentPhoneZone.substr(1));
    } else {
      this.phoneError = true;
    }
  }

  // //添加 line color
  // addLineColor(step: any) {
  //   let stepperCss = document.getElementsByClassName('mat-stepper-horizontal-line');
  //   let i = step.selectedIndex;
  //   stepperCss.item(i)?.classList.add('editState');
  // }

  // 接收通过手机验证api的返回数据
  onOtpCode(event: any) {
    this.authcode = event.authcode;
    this.isAuthValid = event.valid;
    if (event.valid && this.stepper) {
      this.goForward(this.stepper);
    }
  }

  smsStatus(event: boolean) {
    this.smsVoice = event;
  }

  /**
   * step 2 page 按钮是否可以点击
   *
   * @param phone
   */
  canSubmit2(): boolean {
    return !this.phoneError && this.isAuthValid && this.authcode.length == 6;
  }

  /**
   * 發送驗證碼
   *
   * @param event
   */
  handleAuthStatus(event: any) {
    if (event) {
      this.authStatus = 'sent';
      setTimeout(() => {
        this.authStatus = 'timeout';
      }, TIMER_MS);
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

  checkToSubmit2(stepper: MatStepper) {
    if (!this.canSubmit2()) return;
    this.goForward(stepper);
  }

  ngOnDestroy(): void {
    this.accountSub?.unsubscribe();
  }
}
