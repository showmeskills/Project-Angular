import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, firstValueFrom } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { AccountApi } from '../../apis/account.api';
import { VerifyAction } from '../../interfaces/auth.interface';
import { PhoneNumberService } from '../../service/phone-number-validation';
import { ToastService } from '../../service/toast.service';
import { PhoneNumberSelecterComponent } from '../phone-number-selecter/phone-number-selecter.component';
export const TIMER_MS = 90000;
@UntilDestroy()
@Component({
  selector: 'app-bind-mobile-popup',
  templateUrl: './bind-mobile-popup.component.html',
  styleUrls: ['./bind-mobile-popup.component.scss'],
})
export class BindMobilePopupComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<BindMobilePopupComponent>,
    private dialog: MatDialog,
    private appService: AppService,
    private phoneNumberService: PhoneNumberService,
    private accountApi: AccountApi,
    private localeService: LocaleService,
    private toast: ToastService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      callback: () => void;
    }
  ) {}

  /** 当前手机区号 */
  currentPhoneZone: string = '';

  /** 当前手机区号 */
  fogClassName: string = '';

  /** 手机号 */
  phone: string = '';

  /**  */
  phoneError: boolean = false;

  isAuthValid: boolean = false;

  otpType: VerifyAction = 'BindMobile';

  /** 当前验证状态有 initial（初始），sent（发送），timeout（超时） */
  authStatus = 'initial';

  /** 手机验证码 */
  authcode: string = '';

  /** uni 代码 */
  uniCode: string = '';

  /** 发送语音短信 */
  smsVoice: boolean = false;

  isSuccess: boolean = false;

  /** 提交loading */
  submitLoading: boolean = false;

  isEurope: boolean = false;

  ngOnInit(): void {
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
  }

  close() {
    this.dialogRef.close();
  }

  /** 执行回调 */
  onTriggerCallback() {
    if (this.isEurope) {
      this.data?.callback();
    }
  }

  /**
   * 手机区号选择弹出框
   *
   * @returns
   */
  handleSelectPhone(): MatDialogRef<PhoneNumberSelecterComponent> {
    return this.dialog.open(PhoneNumberSelecterComponent, {
      panelClass: ['phone-number-dialog-container', 'mobile-dialog'],
    });
  }

  /**
   * 按钮是否可以点击
   *
   * @param phone
   * @returns
   */
  canSubmit(): boolean {
    return !this.phoneError && this.isAuthValid && this.authcode.length == 6;
  }

  /**
   * ENTER 键提交
   *
   * @param stepper
   */

  checkToSubmit() {
    if (!this.canSubmit()) return;
  }

  /**
   * 手机号规则验证
   *
   * @param element 手机号输入框
   */
  onPhoneInput() {
    if (this.phone.length >= 2) {
      //inputValue要大于等于两个字符，用电话验证才不会报错
      this.phoneError = !this.phoneNumberService.checkVaild(this.phone, this.currentPhoneZone.substr(1));
    } else {
      this.phoneError = true;
    }
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

  /**
   * 接收通过手机验证api的返回数据
   *
   * @param event
   */
  onOtpCode(event: any) {
    this.authcode = event.authcode;
    this.isAuthValid = event.valid;
  }

  async submit() {
    if (this.isAuthValid) {
      this.submitLoading = true;
      // 手机号绑定
      const callbackData: any = await this.accountApi.postBindmobile(
        this.currentPhoneZone,
        this.phone,
        this.uniCode,
        this.authcode,
        this.smsVoice
      );
      if (callbackData.success) {
        this.getUserInfo();
        this.toast.show({
          message: this.localeService.getValue('bound_phone_success'),
          type: 'success',
        });
      } else {
        let errorMsg: string = callbackData.title;
        if (!errorMsg) {
          errorMsg = this.localeService.getValue('bound_phone_failed');
        }
        this.toast.show({ message: errorMsg, type: 'fail' });
      }
      this.submitLoading = false;
    }
  }

  /** 绑定成功之后重新获取用户讯息 */
  async getUserInfo() {
    //获取用户信息
    const accountInfor = await firstValueFrom(this.accountApi.getUserAccountInfor());
    if (accountInfor?.data) {
      this.isSuccess = true;
      this.appService.userInfo$.next(accountInfor.data);
      this.isEurope = accountInfor.data.isEurope;
    }
    this.submitLoading = false;
  }
}
