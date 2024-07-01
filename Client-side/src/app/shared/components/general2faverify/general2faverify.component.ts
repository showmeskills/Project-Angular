import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Optional,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppService } from 'src/app/app.service';
import { AccountApi } from 'src/app/shared/apis/account.api';
import {
  Need2Fa,
  TIMER_MS,
  VerifyAction,
  VerifyEmailParam,
  VerifyGoogleParam,
  VerifyPhoneParam,
  VerifyType,
} from 'src/app/shared/interfaces/auth.interface';
import { AccountInforData } from '../../interfaces/account.interface';
import { verifyStatus } from '../../service/general2faverify.service';
import { PopupService } from '../../service/popup.service';
import { ToastService } from '../../service/toast.service';
@Component({
  selector: 'app-general2faverify-dialog',
  templateUrl: './general2faverify.component.html',
  styleUrls: ['./general2faverify.component.scss'],
})
export class General2faverifyComponent implements OnInit {
  constructor(
    @Optional() public dialogRef: MatDialogRef<General2faverifyComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public verifyFor: VerifyAction,
    private accApi: AccountApi,
    private appService: AppService,
    private toast: ToastService,
    private popup: PopupService
  ) {}
  /** ----组件参数----- */
  /** 登录/注册 组件传过来的title值 */
  @Input() title: string = '';

  /** 是否在 登录或者注册组件中使用  默认值 为false*/
  @Input() isUsedComponent: boolean = false;

  /** 来自组件opt信息 */
  @Input() otpTypeFromComponent!: VerifyAction;

  /** 用于 注册或者登录callback */
  @Output() complete: EventEmitter<any> = new EventEmitter();

  /** 当前验证类型 邮件/手机/google */
  @Input() verifyType: VerifyType = 'PHONE';

  /** 注册和登录 时候会使用 */
  @Input() user2fa?: Need2Fa;

  /** 报错信息 */
  showErrorText: string = '';

  /** 加载中 */
  @Input() isLoading: boolean = false;

  /** 用户信息 */
  userAccountInfor?: AccountInforData;

  /** 滑动组件传值 */
  geetestData: any = {};

  /** ----手机参数----- */
  /** 手机验证码 */
  authcode: string = '';

  /** 是否是 手机首次发送 */
  isFirstSendAuthcode: boolean = true;

  /** 当前验证状态有 initial（初始），sent（发送），timeout（超时） */
  authStatus = 'initial';

  /** 手机区号 */
  areaCode: string = '';

  /** 手机号码 */
  mobile: string = '';

  /** 是否使用 手机语言 */
  smsVoice: boolean = false;

  /** ----Google参数----- */
  /** 谷歌验证码 */
  googleCode: string = '';

  /** google 是否验证通过 */
  isGoogleAuthValid: boolean = false;

  /** ----邮箱参数----- */

  /** 手机验证 */
  isAuthValid: boolean = false;

  /** 邮箱验证状态 */
  emailAuthStatus: string = 'initial';

  /** 邮箱 验证号 */
  emailAuthCode: string = '';

  /** 邮箱验证 */
  isEmailAuthValid: boolean = false;

  /** 邮件地址 */
  email: string = '';

  ngOnInit() {
    // 登录后
    if (!this.isUsedComponent) {
      this.appService.userInfo$.subscribe(x => {
        if (!x) return;
        this.userAccountInfor = x;

        if (x.isBindGoogleValid) {
          this.verifyType = 'GOOGLE';
        } else if (x.isBindMobile) {
          this.verifyType = 'PHONE';
        } else if (x.isBindEmail) {
          this.verifyType = 'EMAIL';
        }
      });
    }
  }

  get canSubmit(): boolean {
    // 手机
    if (this.verifyType === 'PHONE') return this.isAuthValid;
    // google
    if (this.verifyType === 'GOOGLE') return this.googleCode.length === 6;
    // 邮箱
    if (this.verifyType === 'EMAIL') return this.isEmailAuthValid;

    return false;
  }

  //切换验证方式
  handleVerityWay(verifyType: VerifyType) {
    this.showErrorText = '';
    this.authStatus = '';
    this.emailAuthCode = '';
    this.googleCode = '';
    this.isEmailAuthValid = false;
    this.isAuthValid = false;
    this.isGoogleAuthValid = false;
    this.emailAuthStatus = 'initial';
    this.authStatus = 'initial';
    this.verifyType = verifyType;
    console.log('====>', this.verifyType, verifyType);
  }

  /**
   * 發送驗證碼
   *
   * @param $event
   */
  onfirstSendAuthcode($event: any) {
    this.authStatus = 'sent';
    this.smsVoice = $event.smsVocie;
    setTimeout(() => {
      this.authStatus = 'timeout';
    }, TIMER_MS);
  }

  /**
   * 发送手机 otp
   *
   * @param event
   */
  onOtpCode(event: any) {
    this.showErrorText = '';
    this.authcode = event.authcode;
    this.mobile = event.phone;
    this.isAuthValid = event.valid;
    if (event.valid) {
      this.submit();
    }
  }

  /** 邮箱发送器 */
  onFirstSendEmailAuthCode() {
    this.emailAuthStatus = 'sent';
    setTimeout(() => {
      this.emailAuthStatus = 'timeout';
    }, TIMER_MS);
  }

  /**
   * 发送邮件otp
   *
   * @param event
   */
  onEmailOtpCode(event: any) {
    this.showErrorText = '';
    this.emailAuthCode = event.emailAuthCode;
    this.isEmailAuthValid = event.valid;
    this.email = event.email;
    if (event.valid) {
      this.submit();
    }
  }

  /**
   * google 验证
   *
   * @param event
   */
  onGoogleOtpCode(event: any) {
    this.showErrorText = '';
    this.isGoogleAuthValid = event.valid;
    this.googleCode = event.googleCode;
    if (event.valid) {
      this.submit();
    }
  }

  // 提交
  async submit() {
    // 登录或者注册callback
    if (this.isUsedComponent) {
      const verifyData = {
        authCode: this.authcode,
        emailAuthCode: this.emailAuthCode,
        googleCaptcha: this.googleCode,
        phone: this.mobile,
        email: this.email,
        verifyType: this.verifyType,
      };

      this.complete.emit(verifyData);
      return;
    }

    // 登录后 2fa 验证
    //选择谷歌验证
    this.isLoading = true;

    let params: VerifyPhoneParam | VerifyGoogleParam | VerifyEmailParam | null = null;

    if (this.verifyType === 'PHONE') {
      params = {
        areaCode: this.userAccountInfor?.areaCode ?? '',
        mobile: this.mobile,
        otpCode: this.authcode,
        smsVoice: this.smsVoice,
      };
    }

    if (this.verifyType === 'EMAIL') {
      params = {
        email: this.userAccountInfor?.email ?? '',
        emailCode: this.emailAuthCode,
      };
    }

    if (this.verifyType === 'GOOGLE') {
      params = {
        googleCode: this.googleCode,
      };
    }

    this.accApi.general2faVerify(this.verifyFor, params).subscribe(res => {
      const result: verifyStatus = {
        status: res ? res.success : false,
        key: res?.success ? res.data : '',
        message: res?.message,
      };
      this.isLoading = false;
      if (res?.success == false && res?.message) {
        this.showErrorText = res?.message || '';
        this.toast.show({ message: res?.message || '', type: 'fail' });
        return;
      }
      this.dialogRef.close(result);
    });
  }

  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
  }

  /** 邮箱提示弹窗 */
  @ViewChild('emailTipPopup') emailTipPopup!: TemplateRef<Element>;
  popupClose!: any;
  popupEmailTip() {
    this.popupClose = this.popup.open(this.emailTipPopup, {
      disableClose: false,
    });
  }
}
