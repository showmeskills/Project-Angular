import { Component, DestroyRef, HostListener, OnInit, WritableSignal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { AccountApi } from 'src/app/shared/apis/account.api';
import { KycApi } from 'src/app/shared/apis/kyc-basic.api';
import { AuthPromptComponent } from 'src/app/shared/components/auth-prompt/auth-prompt.component';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { AccountInforData, PostPrimaryParams } from 'src/app/shared/interfaces/account.interface';
import { AuthPromptInputItem } from 'src/app/shared/interfaces/kyc.interface';
import { ResponseData } from 'src/app/shared/interfaces/response.interface';
import { EMAIL_VALID_REGEXP } from 'src/app/shared/service/general.service';
import { KycDialogService } from 'src/app/shared/service/kyc-dialog.service';
import { KycValidationService } from 'src/app/shared/service/kyc-validation';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { KycService } from '../../kyc.service';

@Component({
  selector: 'app-primary-kyc',
  templateUrl: './primary-kyc.component.html',
  styleUrls: ['./primary-kyc.component.scss'],
})
export class PrimaryKycComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<PrimaryKycComponent>,
    private dialog: MatDialog,
    public kycService: KycService,
    private kycApi: KycApi,
    private toast: ToastService,
    private appService: AppService,
    private localeService: LocaleService,
    private popupService: PopupService,
    private kycDialogService: KycDialogService,
    private accApi: AccountApi,
    private destroyRef: DestroyRef
  ) {}

  dropDowntype: string = 'dialog';
  isOpen: boolean = false; //打开下拉选单

  /**邮箱 */
  email: string = '';

  /**地址 */
  address: string = '';

  /**邮编 */
  zipCode: string = '';

  /**城市 */
  city: string = '';

  /**国家代码 api */
  countryCode: string = 'CN';

  /**区号 api */
  areaCode: string = '';

  /**手机验证码 api */
  authcode: string = '';
  otpType: string = 'BindMobile';
  /**otp码,已绑定手机则不带 api */
  otpCode: string = '';
  /**验证码发送方式 api */
  smsVoice: boolean = false;

  /**当前手机区号国家 css */
  fogClassName: string = 'Register';
  /**倒计时 */
  timer: number = 60;
  /**是否在提交中 */
  submitLoading: boolean = false;

  userInfor!: AccountInforData;
  /**是否发送验证码 */
  authStatus: boolean = false;

  /** 是否已提交 */
  isSubmitted: WritableSignal<boolean> = signal(false);

  /** service 缓存表单 */
  cnPrimaryKycForm = this.kycService.cnPrimaryKycForm;

  /** 初始化 loading */
  initLoading: boolean = false;

  ngOnInit() {
    this.onInitData();

    this.kycService.refreshKycStatus$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(type => {
      if (!this.isSubmitted()) return;

      if (type === 'cn-primary-kyc-submit') {
        // 打开success弹出框
        this.popupService.open(StandardPopupComponent, {
          speed: 'faster',
          data: {
            type: 'success',
            content: this.localeService.getValue('acc_veri'),
            buttons: [{ text: this.localeService.getValue('sure'), primary: true }],
            description: this.localeService.getValue('up_inter'),
            callback: () => {
              // 关闭当前认证弹出框
              this.close();
              this.submitLoading = false;
              this.kycDialogService.openVerifyDialog(3);
            },
          },
        });
      }
    });
  }

  /** 弹窗打开 加载 */
  onInitData() {
    this.initLoading = true;
    this.kycService.primaryFormData$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        mergeMap(formData => {
          if (formData) {
            this.cnPrimaryKycForm.fullName.value = formData?.fullName || '';
            if (formData?.fullName) {
              this.onUserNameInput();
            }

            if (formData?.areaCode === '+86') {
              this.cnPrimaryKycForm.phone.value = formData?.mobile || '';
            }

            this.countryCode = formData?.countryCode || '';
            this.areaCode = formData?.areaCode || '';
          }
          return this.appService.userInfo$;
        }),
        mergeMap(userInfo => {
          if (!userInfo?.isBindMobile) {
            return this.appService.currentCountry$.pipe(filter(x => x));
          }

          if (userInfo) {
            this.userInfor = userInfo;
            const { isBindMobile, mobile, areaCode, mobileRegionCode } = userInfo;

            this.cnPrimaryKycForm.phone.boundPhone = isBindMobile;
            if (isBindMobile) {
              this.areaCode = areaCode;
              this.countryCode = mobileRegionCode;
              this.cnPrimaryKycForm.phone.value = mobile;
            }
          }

          return of(null);
        })
      )
      .subscribe(country => {
        if (country) {
          this.areaCode = country?.areaCode || '';
          this.countryCode = country?.iso || '';
        }
        this.initLoading = false;
      });
  }

  /**
   * 关闭弹窗
   */
  close(): void {
    if (this.isSubmitted()) {
      this.dialogRef.close();
      this.isSubmitted.set(false);
    } else {
      this.initLoading = true;
      this.kycApi
        .onSavePrimaryKycForm({
          fullName: this.cnPrimaryKycForm.fullName.value || '',
          mobile: this.cnPrimaryKycForm.phone.value || '',
          areaCode: this.areaCode,
          countryCode: this.countryCode,
        })
        .subscribe(data => {
          if (data) {
            this.toast.show({ message: this.localeService.getValue('save_info_success'), type: 'success' });
          } else {
            this.toast.show({ message: this.localeService.getValue('save_info_failed'), type: 'fail' });
          }
          this.dialogRef.close();
          this.initLoading = false;
          this.isSubmitted.set(false);
        });
    }
  }

  /**
   * 选择国家下拉选框
   */
  onOpenDropDown() {
    this.isOpen = !this.isOpen;
  }

  /**
   * 用户姓名规则验证
   *
   */
  onUserNameInput() {
    this.cnPrimaryKycForm.fullName.error = !KycValidationService.validateNameWithNationalityItem(
      this.countryCode == 'CN' ? 'CHN' : '',
      this.cnPrimaryKycForm.fullName.value
    );
    this.cnPrimaryKycForm.fullName.errorText = this.cnPrimaryKycForm.fullName.error
      ? this.localeService.getValue('fill_again')
      : '';
  }

  /**
   * 邮箱规则验证 - 未使用
   */
  emailError: string = '';
  onEmailInput() {
    const valid = EMAIL_VALID_REGEXP.test(this.email);
    this.emailError = !!this.email && !valid ? this.localeService.getValue('email_err') : '';
  }

  getKycOtpChange(event: unknown) {
    if (typeof event == 'object' && event !== null) {
      const typedEvent = event as { type: string; value: any };
      switch (typedEvent.type) {
        case 'authcode':
          this.otpCode = typedEvent.value;
          break;
        case 'smsVoice':
          this.smsVoice = typedEvent.value;
          break;
        case 'phone':
          this.cnPrimaryKycForm.phone.value = typedEvent.value;
          break;
        case 'authStatus':
          this.authStatus = typedEvent.value;
          break;
        default:
          break;
      }
    }
  }

  /**
   * 继续按钮是否可以点击
   */
  canSubmit(): boolean {
    if (this.cnPrimaryKycForm.phone.boundPhone) {
      return !!this.cnPrimaryKycForm.fullName.value && !this.cnPrimaryKycForm.fullName.error;
    } else {
      if (this.cnPrimaryKycForm.fullName.value?.length > 0 && this.authStatus && this.otpCode.length == 6) {
        return !this.cnPrimaryKycForm.fullName.error;
      } else {
        return false;
      }
    }
  }

  // enter键操作
  @HostListener('document:keydown.enter', ['$event'])
  handleSubmit() {
    // 检查资料齐全
    if (!this.canSubmit()) {
      return;
    }

    this.submit();
  }

  submit() {
    // 中国区基础验证
    this.submitLoading = true;
    const primaryParams: PostPrimaryParams = {
      otpCode: this.otpCode,
      smsVoice: this.smsVoice,
      otpType: this.otpType,
      countryCode: this.countryCode,
      fullName: this.cnPrimaryKycForm.fullName.value,
      email: this.email,
      address: this.address.trim(),
      zipCode: this.zipCode,
      city: this.city.trim(),
      areaCode: this.areaCode,
      mobile: this.cnPrimaryKycForm.phone.value,
    };
    this.kycApi.postPrimary(primaryParams).subscribe((callback: ResponseData<boolean>) => {
      if (callback?.data) {
        this.accApi.getUserAccountInfor().subscribe(userInfo => {
          this.isSubmitted.set(true);
          if (userInfo?.data) {
            this.appService.userInfo$.next(userInfo.data);
            // 需要重新获取kycstatus 数据
            this.kycService._refreshKycStatus.set('cn-primary-kyc-submit');
            this.kycService._refreshKycStatusTopbar.set(true);
          } else {
            this.submitLoading = false;
            this.close();
          }
        });
      } else {
        this.toast.show({ message: callback?.message || '', type: 'fail' });
        this.submitLoading = false;
      }
    });
  }

  /**
   * 驗證提示
   */
  completePhoneNum(): MatDialogRef<AuthPromptComponent> | void {
    const data: AuthPromptInputItem = {
      mode: 'phone',
      title: this.localeService.getValue(`bind_p_tit`),
      cont: this.localeService.getValue(`enter_phone`),
      cont2: this.localeService.getValue(`last_6_dig00`),
      btn1: this.localeService.getValue('sure'),
      currentAreaCode: this.areaCode,
      phoneNum: this.cnPrimaryKycForm.phone.value,
    };

    const dialogRef = this.openAuthPrompt(data);
    dialogRef.afterClosed().subscribe(res => {
      if (res == 'CLOSE_DIALOG' || !res) return;
      this.cnPrimaryKycForm.phone.value = res;
      this.submit();
    });
  }

  /**
   * 驗證提示
   *
   * @param data
   */
  openAuthPrompt(data: AuthPromptInputItem): MatDialogRef<AuthPromptComponent> {
    return this.dialog.open(AuthPromptComponent, {
      panelClass: 'phone-number-dialog-container',
      data: data,
    });
  }
}
