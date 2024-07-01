import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { KycApi } from 'src/app/shared/apis/kyc-basic.api';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { TIMER_MS } from 'src/app/shared/interfaces/auth.interface';
import { ResponseData } from 'src/app/shared/interfaces/response.interface';
import { KycValidationService } from 'src/app/shared/service/kyc-validation';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { KycService } from '../../kyc.service';

@UntilDestroy()
@Component({
  selector: 'app-mid-kyc-validation',
  templateUrl: './mid-kyc-validation.component.html',
  styleUrls: ['./mid-kyc-validation.component.scss'],
})
export class MidKycValidationComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<MidKycValidationComponent>,
    private kycService: KycService,
    private kycApi: KycApi,
    private popupService: PopupService,
    private toast: ToastService,
    private localeService: LocaleService,
  ) {}

  isShow: boolean = true;
  /**打开下拉选单 */
  isOpen: boolean = false;
  dropDowntype: string = 'dialog';
  /**姓名 */
  userName: string = '';
  /**身份证件号码 */
  userId: string = '';
  /**银行卡 */
  userBankCard: string = '';
  /**卡类型 */
  cardType: string = '';
  /**手机号码 */
  phoneNum: string = '';
  /**手机验证码  api need */
  authcode: string = '';
  /**倒计时 */
  timer: number = TIMER_MS / 1000;
  /**是否在提交中 */
  submitLoading: boolean = false;
  /**是否已發送驗證碼 */
  isSendAuthcode: boolean = false;
  /**手机区号 */
  areaCode: string = '';
  /**是否第一次發送驗證碼 */
  isFirstSendAuthcode: boolean = true;
  /**是否通过手机验证 */
  isVerifyCode: boolean = false;

  // /** 初始验证通过的国家区号 */
  // countryISO: string = '';                         //区号
  authStatus = 'initial'; // 当前验证状态有 initial（初始），sent（发送），timeout（超时）
  userNameValid: boolean = false;
  userIdValid: boolean = false;
  bankCardVaild: boolean = false;
  authCodeValid: boolean = false;

  /** 提示信息 */
  verifyCodeMsg: string = '';

  /** 全名 loading */
  fullNameLoading: boolean = false;

  /** 短信 */
  otpLoading: boolean = false;

  ngOnInit() {
    this.kycService.showMidChinaPage.pipe(untilDestroyed(this)).subscribe((x: boolean) => {
      if (x) this.isShow = x;
    });
    this.onGetFullName();
  }

  async onGetFullName() {
    this.fullNameLoading = true;
    const userInfor = await this.kycService.getMemberBasicInfor();
    if (userInfor && userInfor.fullName) {
      this.userName = userInfor.fullName;
      this.userNameValid = true;
    }
    this.fullNameLoading = false;
  }

  /**
   * 用户名字输入框验证
   */
  onUserNameInput() {
    this.userNameValid = KycValidationService.validateNameWithNationalityItem('CHN', this.userName);
  }

  /**
   * 用户身份证输入框验证
   */
  onUserIdInput() {
    this.userIdValid = KycValidationService.validateChinaID(this.userId);
  }

  /**
   * 用户银行卡输入框验证
   */
  onBankCardInput() {
    const userBankCard = String(this.userBankCard).replace(/ /g, '');
    //规则：银行卡 8-30位
    if (userBankCard.length > 7 && userBankCard.length < 31) {
      this.bankCardVaild = true;
    } else {
      this.bankCardVaild = false;
    }
  }

  /**
   * 手机验证码
   *
   * @param element 手机验证码输入框
   */
  onAuthcodeInput() {
    if (!this.isSendAuthcode) return;
    this.authCodeValid = this.authcode.replace(/[^\d]/g, '').length === 6;
    if (this.authCodeValid) {
      this.verifyCodeMsg = '';
    } else {
      this.verifyCodeMsg = this.localeService.getValue('vercode_err');
    }
  }

  //手机提示弹出框
  openNotcie() {
    this.popupService.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        content: this.localeService.getValue('phone_desc'),
        description: this.localeService.getValue('bank_service'),
        buttons: [{ text: this.localeService.getValue('sure'), primary: true }],
        callback: () => {},
      },
    });
  }

  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
  }

  /**
   * 发送验证码
   */
  async sendOtp() {
    this.otpLoading = true;
    const result = await this.kycApi.sendSms(this.phoneNum);
    const { success, message }: any = result;
    if (success) {
      this.toast.show({
        message: this.localeService.getValue('send_sms_success'),
        type: 'success',
      });
      this.handleOTPClicked();
    } else {
      // code 2123/2124 验证码发送太过频繁
      this.toast.show({
        message: message || this.localeService.getValue('send_sms_f'),
        type: 'fail',
      });
    }
    this.otpLoading = false;
  }
  /**
   * 倒计时
   */
  handleOTPClicked() {
    this.isSendAuthcode = true;
    this.isFirstSendAuthcode = false;
    this.timer = TIMER_MS / 1000;
    const timer = setInterval((): any => {
      if (this.timer === 1) {
        this.isSendAuthcode = false;
        this.isFirstSendAuthcode = true;
        clearInterval(timer);
      }
      this.timer -= 1;
    }, 1000);
    this.onfirstSendAuthcode();
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

  /**
   * 继续按钮是否可以点击
   */
  get canSubmit(): boolean {
    return (
      this.userNameValid &&
      this.userIdValid &&
      this.bankCardVaild &&
      this.phoneNum.length >= 6 &&
      this.phoneNum.length <= 18 &&
      this.authCodeValid
    );
  }

  // enter键操作
  @HostListener('document:keydown.enter', ['$event'])
  async handleContiuneClicked() {
    //验证流程：
    //1:四要素验证和发送验证码同时进行
    //2:四要素验证通过后进行otp验证
    if (!this.canSubmit) {
      return;
    }
    this.handleSubmitOtp();
  }

  //otp验证
  async handleSubmitOtp() {
    this.submitLoading = true;
    const otpresult: ResponseData<boolean> = await this.kycApi.verifySms(this.phoneNum, this.authcode);
    if (otpresult?.data) {
      //最终验证
      const result: ResponseData<boolean> = await this.kycApi.postIntermediate(
        this.userName,
        this.userId,
        this.userBankCard,
        this.phoneNum,
      );

      if (result?.data) {
        //账户已验证
        this.popupService.open(StandardPopupComponent, {
          speed: 'faster',
          data: {
            type: 'success',
            content: this.localeService.getValue('acc_veri_kyc'),
            buttons: [{ text: this.localeService.getValue('good'), primary: true }],
            description: this.localeService.getValue('up_veri'),
            callback: () => {
              //显示用户的风控表单
              // if (this.localStorageService.riskBanner) {
              //   this.riskService.checkIfRiskMember();
              // }
              this.close();
            },
          },
        });
        this.kycService._refreshKycStatus.set('aisa-mid-kyc-submit');
      } else {
        //验证信息错误 TODO:待完善 证件信息不符
        // this.openValidationDialog();
        // this.kycService.dialogStepSubject.next(2);
        //四要素未通过
        this.errorDialog(
          this.localeService.getValue('hint'),
          String(result?.code),
          result?.message || '',
          this.localeService.getValue('i_ha_kn00'),
          false,
        );
      }
      this.submitLoading = false;
    } else {
      //证件信息不符
      this.verifyCodeMsg = this.localeService.getValue('vercode_err');
      // this.popupService.open(StandardPopupComponent, {
      //   speed: 'faster',
      //   data: {
      //     type: 'warn',
      //     content: this.localeService.getValue('info_not_match'),
      //     buttons: [{ text: this.localeService.getValue('i_konw'), primary: true }],
      //     description: this.localeService.getValue('contact_service'),
      //     callback: () => {
      //       this.close();
      //     },
      //   },
      // });
      this.submitLoading = false;
    }
  }

  /**
   *
   * 错误弹出框
   *
   * @param title
   * @param code
   * @param errorMsg
   * @param btnTxt
   * @param primary
   */
  errorDialog(title?: string, code?: string, errorMsg?: string, btnTxt?: string, primary?: boolean) {
    //title:
    this.popupService.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        type: 'warn',
        content: title,
        buttons: [{ text: btnTxt, primary: primary }],
        description: errorMsg,
        callback: () => {},
      },
    });
  }
}
