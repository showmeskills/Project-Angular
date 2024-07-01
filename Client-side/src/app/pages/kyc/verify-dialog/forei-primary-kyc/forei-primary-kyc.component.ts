import { Component, DestroyRef, HostListener, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';
import { of } from 'rxjs';
import { filter, mergeMap, take } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { AccountApi } from 'src/app/shared/apis/account.api';
import { KycApi } from 'src/app/shared/apis/kyc-basic.api';
import { PaymentIqService } from 'src/app/shared/components/select-deposit-bonus/payment-iq/payment-iq.service';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { AccountInforData, PostPrimaryParams } from 'src/app/shared/interfaces/account.interface';
import { PrimaryForEuParams } from 'src/app/shared/interfaces/kyc.interface';
import { EMAIL_VALID_REGEXP } from 'src/app/shared/service/general.service';
import { KycValidationService } from 'src/app/shared/service/kyc-validation';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { KycService } from '../../kyc.service';

@Component({
  selector: 'app-forei-primary-kyc',
  templateUrl: './forei-primary-kyc.component.html',
  styleUrls: ['./forei-primary-kyc.component.scss'],
})
export class ForeiPrimaryKycComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ForeiPrimaryKycComponent>,
    private kycApi: KycApi,
    public kycService: KycService,
    private toast: ToastService,
    private appService: AppService,
    private localeService: LocaleService,
    private popupService: PopupService,
    private accApi: AccountApi,
    private destroyRef: DestroyRef,
    private piqService: PaymentIqService,
  ) {}
  /**当前地区代码 */
  countryCode: string = '';
  /**区号 api */
  areaCode: string = '';
  /**手机验证码 api */
  authcode: string = '';
  otpType: string = 'BindMobile';
  /**otp码,已绑定手机则不带 api */
  otpCode: string = '';
  /**验证码发送方式 api */
  smsVoice: boolean = false;

  /**是否发送验证码 */
  authStatus: boolean = false;

  /**用户信息 */
  userInfor!: AccountInforData;

  /**是否在提交中 */
  submitLoading: boolean = false;

  /** service 缓存表单 */
  foreiPrimaryKycForm = this.kycService.foreiPrimaryKycForm;

  /** 初始化 loading */
  initLoading: boolean = false;

  /** 是否提交 */
  isSubmitted: boolean = false;

  ngOnInit() {
    this.onInitData();
  }

  /** 弹窗打开 加载 */
  onInitData() {
    this.initLoading = true;

    this.kycService.primaryFormData$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        mergeMap(formData => {
          if (formData) {
            console.log('formData===>', formData);
            this.foreiPrimaryKycForm.fullName.value = formData?.fullName || '';
            if (formData?.fullName) {
              this.onFullNameChange();
            }

            this.foreiPrimaryKycForm.firstName.value = formData?.firstName || '';
            if (formData?.firstName) {
              this.onFirstNameAndLastNameInput(true);
            }
            this.foreiPrimaryKycForm.lastName.value = formData?.lastName || '';
            if (formData?.lastName) {
              this.onFirstNameAndLastNameInput(false);
            }
            this.foreiPrimaryKycForm.userBorth.value = formData?.dob || '';
            this.foreiPrimaryKycForm.address.value = formData?.address || '';
            this.foreiPrimaryKycForm.city.value = formData?.city || '';
            this.foreiPrimaryKycForm.zipCode.value = formData?.zipCode || '';
            this.foreiPrimaryKycForm.email.value = formData?.email || '';
            if (formData?.email) {
              this.onEmailInput();
            }
            if (formData?.areaCode !== '+86') {
              this.foreiPrimaryKycForm.phone.value = formData?.mobile || '';
            }
            this.countryCode = formData?.countryCode || '';
            this.areaCode = formData?.areaCode || '';
          }

          return this.appService.userInfo$.pipe(
            filter(v => !!v),
            take(1),
          );
        }),
        mergeMap(userInfo => {
          if (userInfo) {
            this.userInfor = userInfo;

            if (userInfo?.isBindEmail) {
              this.foreiPrimaryKycForm.email.value = userInfo?.email;
              this.foreiPrimaryKycForm.email.boundEmail = userInfo?.isBindEmail;
            } else {
              if (!this.foreiPrimaryKycForm.email.value) {
                this.foreiPrimaryKycForm.email.value = userInfo?.email;
              }
              this.foreiPrimaryKycForm.email.boundEmail = false;
            }

            if (userInfo?.isBindMobile) {
              this.areaCode = userInfo.areaCode;
              this.countryCode = userInfo.mobileRegionCode;
              this.foreiPrimaryKycForm.phone.value = userInfo.mobile;
              this.foreiPrimaryKycForm.phone.boundPhone = userInfo?.isBindMobile;
            } else {
              this.foreiPrimaryKycForm.phone.boundPhone = false;

              return this.appService.currentCountry$.pipe(filter(x => x));
            }
          }

          return of(null);
        }),
      )
      .subscribe(country => {
        if (country) {
          this.areaCode = country?.areaCode || '';
          this.countryCode = country?.iso || '';
        }
        this.initLoading = false;
      });
  }

  getKycOtpChange(event: unknown) {
    if (typeof event === 'object' && event !== null) {
      const typedEvent = event as { type: string; value: any };
      switch (typedEvent.type) {
        case 'authcode':
          this.otpCode = typedEvent.value;
          break;
        case 'smsVoice':
          this.smsVoice = typedEvent.value;
          break;
        case 'phone':
          this.foreiPrimaryKycForm.phone.value = typedEvent.value;
          break;
        case 'authStatus':
          this.authStatus = typedEvent.value;
          break;
        default:
          break;
      }
    }
  }

  /** 检查姓名规则 不可包含特殊字符和数字 */
  onFullNameChange() {
    const formattedName = this.foreiPrimaryKycForm.fullName.value.trim().split(' ').join('');
    this.foreiPrimaryKycForm.fullName.error = KycValidationService.validateNameWithNationalityItem(
      this.countryCode,
      formattedName,
    );
    this.foreiPrimaryKycForm.fullName.errorText = !this.foreiPrimaryKycForm.fullName.error
      ? this.localeService.getValue('fill_again')
      : '';
  }

  /**
   * 检查 名和姓 不可包含特殊字符和数字
   * 允许空格
   *
   * @param isFirstName
   */
  onFirstNameAndLastNameInput(isFirstName: boolean) {
    if (isFirstName) {
      const formattedName = this.foreiPrimaryKycForm.firstName.value.trim().split(' ').join('');
      this.foreiPrimaryKycForm.firstName.error = KycValidationService._hasValidFLName(this.countryCode, formattedName);
      this.foreiPrimaryKycForm.firstName.errorText =
        !this.foreiPrimaryKycForm.firstName.error && !!this.foreiPrimaryKycForm.firstName.value
          ? this.localeService.getValue('enter_first_name')
          : '';
    }

    if (!isFirstName) {
      const formattedName = this.foreiPrimaryKycForm.lastName.value.trim().split(' ').join('');
      this.foreiPrimaryKycForm.lastName.error = KycValidationService._hasValidFLName(this.countryCode, formattedName);
      this.foreiPrimaryKycForm.lastName.errorText =
        !this.foreiPrimaryKycForm.lastName.error && !!this.foreiPrimaryKycForm.lastName.value
          ? this.localeService.getValue('enter_last_name')
          : '';
    }
  }

  /**
   * 邮箱规则验证
   */

  onEmailInput() {
    const valid = EMAIL_VALID_REGEXP.test(this.foreiPrimaryKycForm.email.value);
    this.foreiPrimaryKycForm.email.errorText =
      !!this.foreiPrimaryKycForm.email.value && !valid ? this.localeService.getValue('email_err') : '';
  }

  checkSubmitValid(): boolean {
    //中间名不是必填 全名
    if (this.kycService.fullNameModeCountryList.includes(this.countryCode)) {
      if (this.foreiPrimaryKycForm.phone.boundPhone) {
        if (this.foreiPrimaryKycForm.fullName.value?.length > 0 && this.foreiPrimaryKycForm.userBorth.value) {
          return (
            this.foreiPrimaryKycForm.fullName.error &&
            !!this.foreiPrimaryKycForm.userBorth.value &&
            !this.foreiPrimaryKycForm.email.errorText &&
            !!this.foreiPrimaryKycForm.email.value &&
            !!this.foreiPrimaryKycForm.address.value &&
            !!this.foreiPrimaryKycForm.city.value &&
            !!this.foreiPrimaryKycForm.zipCode.value &&
            !!this.foreiPrimaryKycForm.phone.value
          );
        } else {
          return false;
        }
      } else {
        if (this.foreiPrimaryKycForm.fullName.value?.length > 0 && this.authStatus && this.otpCode.length == 6) {
          return (
            this.foreiPrimaryKycForm.fullName.error &&
            !!this.foreiPrimaryKycForm.userBorth.value &&
            !this.foreiPrimaryKycForm.email.errorText &&
            !!this.foreiPrimaryKycForm.email.value &&
            !!this.foreiPrimaryKycForm.address.value &&
            !!this.foreiPrimaryKycForm.city.value &&
            !!this.foreiPrimaryKycForm.zipCode.value &&
            !!this.foreiPrimaryKycForm.phone.value
          );
        } else {
          return false;
        }
      }
    }

    // 名 姓
    if (!this.kycService.fullNameModeCountryList.includes(this.countryCode)) {
      // 已经绑定过手机
      if (this.foreiPrimaryKycForm.phone.boundPhone) {
        if (
          this.foreiPrimaryKycForm.firstName.value?.length > 0 &&
          this.foreiPrimaryKycForm.lastName.value?.length > 0 &&
          this.foreiPrimaryKycForm.userBorth.value
        ) {
          return (
            this.foreiPrimaryKycForm.firstName.error &&
            this.foreiPrimaryKycForm.lastName.error &&
            !!this.foreiPrimaryKycForm.userBorth.value &&
            !this.foreiPrimaryKycForm.email.errorText &&
            !!this.foreiPrimaryKycForm.email.value &&
            !!this.foreiPrimaryKycForm.address.value &&
            !!this.foreiPrimaryKycForm.city.value &&
            !!this.foreiPrimaryKycForm.zipCode.value &&
            !!this.foreiPrimaryKycForm.phone.value
          );
        } else {
          return false;
        }
      }

      // 没有绑定过手机
      if (!this.foreiPrimaryKycForm.phone.boundPhone) {
        if (
          this.foreiPrimaryKycForm.firstName.value?.length > 0 &&
          this.foreiPrimaryKycForm.lastName.value?.length > 0 &&
          this.authStatus &&
          this.otpCode.length == 6
        ) {
          return (
            this.foreiPrimaryKycForm.firstName.error &&
            this.foreiPrimaryKycForm.lastName.error &&
            !!this.foreiPrimaryKycForm.userBorth.value &&
            !this.foreiPrimaryKycForm.email.errorText &&
            !!this.foreiPrimaryKycForm.email.value &&
            !!this.foreiPrimaryKycForm.address.value &&
            !!this.foreiPrimaryKycForm.city.value &&
            !!this.foreiPrimaryKycForm.zipCode.value &&
            !!this.foreiPrimaryKycForm.phone.value
          );
        } else {
          return false;
        }
      }
    }

    return false;
  }

  // /**
  //  * 驗證提示
  //  */
  // completePhoneNum(): MatDialogRef<AuthPromptComponent> | void {
  //   const data: AuthPromptInputItem = {
  //     mode: 'phone',
  //     title: this.localeService.getValue('bind_p_tit'),
  //     cont: this.localeService.getValue('enter_phone'),
  //     cont2: this.localeService.getValue('last_6_dig00'),
  //     btn1: this.localeService.getValue('sure'),
  //     currentAreaCode: this.areaCode,
  //     phoneNum: this.foreiPrimaryKycForm.phone.value,
  //   };

  //   const dialogRef = this.openAuthPrompt(data);
  //   dialogRef.afterClosed().subscribe(res => {
  //     if (res == 'CLOSE_DIALOG' || !res) return;
  //     this.foreiPrimaryKycForm.phone.value = res;
  //     this.submit();
  //   });
  // }

  // /**
  //  * 驗證提示
  //  *
  //  * @param data
  //  */
  // openAuthPrompt(data: AuthPromptInputItem): MatDialogRef<AuthPromptComponent> {
  //   return this.dialog.open(AuthPromptComponent, {
  //     panelClass: 'phone-number-dialog-container',
  //     data: data,
  //   });
  // }

  // 继续操作
  @HostListener('document:keydown.enter', ['$event'])
  handleSubmit() {
    // 检查资料齐全
    if (!this.checkSubmitValid()) {
      return;
    }

    this.submit();
  }

  submit() {
    const userBirth = moment(this.foreiPrimaryKycForm.userBorth.value).format('YYYY-MM-DD');
    this.submitLoading = true;
    const primaryParams = {
      countryCode: this.countryCode,
      firstName: this.foreiPrimaryKycForm.firstName.value.trim(),
      lastName: this.foreiPrimaryKycForm.lastName.value.trim(),
      fullName: this.foreiPrimaryKycForm.fullName.value.trim(),
      dob: userBirth ?? '',
      address: this.foreiPrimaryKycForm.address.value.trim(),
      city: this.foreiPrimaryKycForm.city.value.trim(),
      zipCode: this.foreiPrimaryKycForm.zipCode.value,
      otpCode: this.otpCode,
      smsVoice: this.smsVoice,
      otpType: this.otpType,
      mobile: this.foreiPrimaryKycForm.phone.value,
      areaCode: this.areaCode,
      email: this.foreiPrimaryKycForm.email.value,
    };
    const isEurope: boolean = !this.kycService.fullNameModeCountryList.includes(this.countryCode);
    if (isEurope && this.kycService.getSwitchEuKyc) {
      this.kycApi.postPrimaryForEu(primaryParams as PrimaryForEuParams).subscribe(data => {
        if (data?.data) {
          this.isSubmitted = true;
          this.handleSuccess('eu-primary-kyc-submit');
          this.close();
          this.popupService.open(StandardPopupComponent, {
            speed: 'faster',
            data: {
              type: 'success',
              content: this.localeService.getValue('acco_verified'),
              buttons: [{ text: this.localeService.getValue('sure_btn'), primary: true }],
              description: this.localeService.getValue('up_inter'),
              callback: () => {
                this.piqService.autoOpen();
              },
            },
          });
        } else {
          this.toast.show({ message: data?.message || '', type: 'fail' });
        }
        this.submitLoading = false;
      });
    } else {
      this.kycApi.postPrimary(primaryParams as PostPrimaryParams).subscribe(data => {
        if (data?.data) {
          this.isSubmitted = true;
          this.handleSuccess('asia-primary-kyc-submit');
          this.close();
          // 打开success弹出框
          this.popupService.open(StandardPopupComponent, {
            speed: 'faster',
            data: {
              type: 'success',
              content: this.localeService.getValue('acco_verified'),
              buttons: [{ text: this.localeService.getValue('sure_btn'), primary: true }],
              description: this.localeService.getValue('up_inter'),
            },
          });
        } else {
          this.toast.show({ message: data?.message, type: 'fail' });
        }
        this.submitLoading = false;
      });
    }
  }

  handleSuccess(type: string) {
    this.accApi.getUserAccountInfor().subscribe(userInfo => {
      if (userInfo?.data) {
        this.kycService._refreshKycStatus.set(type);
        this.kycService._refreshKycStatusTopbar.set(true);
        this.appService.userInfo$.next(userInfo.data);
      } else {
        this.toast.show({ message: userInfo?.message, type: 'fail' });
      }
    });
  }

  /**
   * 关闭弹窗
   */
  close(): void {
    if (this.isSubmitted) {
      this.dialogRef.close();
      this.isSubmitted = false;
    } else {
      this.initLoading = true;
      const userBirth = moment(this.foreiPrimaryKycForm.userBorth.value).format('YYYY-MM-DD');
      const isFullNameCountry: boolean = this.kycService.fullNameModeCountryList.includes(this.countryCode);
      this.kycApi
        .onSavePrimaryKycForm({
          firstName: !isFullNameCountry ? this.foreiPrimaryKycForm.firstName.value || '' : '',
          lastName: !isFullNameCountry ? this.foreiPrimaryKycForm.lastName.value || '' : '',
          fullName: isFullNameCountry ? this.foreiPrimaryKycForm.fullName.value || '' : '',
          zipCode: this.foreiPrimaryKycForm.zipCode.value || '',
          dob: userBirth !== 'Invalid date' ? userBirth || '' : '',
          address: this.foreiPrimaryKycForm.address.value || '',
          city: this.foreiPrimaryKycForm.city.value || '',
          mobile: this.foreiPrimaryKycForm.phone.value || '',
          email: this.foreiPrimaryKycForm.email.value || '',
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
          this.isSubmitted = false;
        });
    }
  }
}
