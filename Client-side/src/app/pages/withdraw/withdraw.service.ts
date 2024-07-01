import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { TokenAddressApi } from 'src/app/shared/apis/tokenaddress.api';
import { WalletApi } from 'src/app/shared/apis/wallet.api';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { KycStatus } from 'src/app/shared/interfaces/kyc.interface';
import { KycDialogService } from 'src/app/shared/service/kyc-dialog.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';

@Injectable({
  providedIn: 'root',
})
export class WithdrawService {
  constructor(
    private walletApi: WalletApi,
    private popup: PopupService,
    private appService: AppService,
    private route: Router,
    private localeService: LocaleService,
    private dialog: MatDialog,
    private kycDialogService: KycDialogService,
    private toast: ToastService,
    private tokenAddressApi: TokenAddressApi,
    private location: Location // private riskService: RiskControlService
  ) {}

  /**
   * 是否开始 虚拟币 提款KYC 验证
   *
   * @returns
   */
  get kycVerifyCryptoWidthdraw() {
    return JSON.parse(this.appService.tenantConfig?.config?.kycVerifyCryptoWidthdraw || 'false');
  }

  /** 提法得虚 是否 创建订单 */
  isOrdered: boolean = false;

  get getOrdered(): boolean {
    return this.isOrdered;
  }

  set setOrdered(value: boolean) {
    this.isOrdered = value;
  }

  /** 创建订单后 提交收据 */
  submitRecipet: any;

  get getSubmitRecipt(): any {
    return this.submitRecipet;
  }

  set setSubmitRecipet(value: any) {
    this.submitRecipet = value;
  }

  /** user kyc 状态 */
  userKycStatus: KycStatus[] = [];

  /** 检查是否允许提款 */
  allowWithdrawal() {
    return this.walletApi.allowWithdrawal();
  }

  /** ———————合并提法得虚和提虚返回的值的处理——————— */

  /**
   * 重制数据
   *
   */

  onResetValue() {
    this.setOrdered = false;
    this.submitRecipet = null;
  }

  /**
   *
   * 读取地址列表
   *
   */
  loadAddressList() {
    const param = {
      currency: '',
      isWhiteList: null,
      isUniversalAddress: null,
      address: '',
      isWithdraw: true,
      walletAddressType: '',
    };

    return this.tokenAddressApi.getTokenadd(param);
  }
  /**
   *
   * 提交定单
   *
   * @param res
   */
  closeSubmitCallBack(res: any) {
    if (!res?.data) {
      this.setOrdered = false;
      const code = res?.code || '';
      if (code == '400' || code == '401' || code == '403' || code == '500') {
        const errorMsg = `${this.localeService.getValue('api_err')}${code}`;
        this.toast.show({ message: errorMsg, type: 'fail' });
      } else {
        this.openErrorDialog(code, res?.message || '');
      }
    } else {
      this.setSubmitRecipet = res.data;
      this.setOrdered = true;
      //手动更新余额
      this.appService.assetChanges$.next({ related: 'Wallet' });
      //检查风控
      // console.log('检查风控表单');
      // this.riskService.checkUserRiskForm();
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
   * @param disableClose
   * @param closeIcon
   */
  errorDialog(
    title?: string,
    code?: string,
    errorMsg?: string,
    btnTxt?: string,
    primary?: boolean,
    disableClose?: boolean,
    closeIcon: boolean = false
  ) {
    this.dialog.closeAll();
    this.popup.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        type: 'warn',
        content: title,
        buttons: [{ text: btnTxt, primary: primary }],
        description: errorMsg,
        callback: () => {
          this.closeErroeCallBack(primary, code);
        },
        closeIcon,
        closecallback: () => {
          this.location.back();
        },
      },
      disableClose: disableClose,
    });
  }

  openErrorDialog(code: string, errorMsg?: string) {
    //title
    switch (code) {
      case 'kcyError':
        this.errorDialog(
          this.localeService.getValue('safety_rem00'),
          code,
          errorMsg,
          //去认证
          this.localeService.getValue('verification'),
          true,
          true
        );
        break;
      case '2049':
      case '2052':
        this.errorDialog(
          this.localeService.getValue('not_ava'),
          code,
          //您的身份验证地区与该付款方式不符。如果您持有有效该地区有效签证和外国护照并希望继续，请联系客服。
          `${this.localeService.getValue('not_match')} ${this.localeService.getValue(
            'visa_continue'
          )} ${this.localeService.getValue('contact_cust')}`,
          this.localeService.getValue('online_cs'),
          true,
          false
        );
        break;
      case '2050':
        this.errorDialog(
          this.localeService.getValue('safety_rem00'),
          code,
          //为保障您的账户安全，进行本项操作以前，请立即进行身份中级认证
          this.localeService.getValue('kyc_error02'),
          this.localeService.getValue('verification'),
          true,
          true
        );
        break;
      case '2053':
        this.errorDialog(
          //存款金额超出当日限额
          this.localeService.getValue('kyc_error03'),
          code,
          // 您的提款金额超过当日/月限额，请进行身份认证获得更高额度
          this.localeService.getValue('kyc_error04'),
          this.localeService.getValue('verification'),
          true,
          false
        );
        break;
      // 提法得虚 新增 错误
      //code=2045,提款金额必须大于0
      case '2045':
      //code=2057,提款金额超出当日限额
      case '2057':
      //code = 2058, 提款金额超出可用限额;
      case '2058':
      //(code = 2060), 提款金额超过选择支付方式范围;
      case '2060':
      //(code = 2062), 提款账户 / 地址已锁定;
      case '2062':
      //	code=2110,汇率过期，提示用户汇率更新
      case '2110':
      default:
        if (!errorMsg) return;
        this.errorDialog(
          this.localeService.getValue('hint'),
          code,
          errorMsg,
          this.localeService.getValue('i_ha_kn00'),
          false,
          false
        );
        break;
    }
  }

  // 关闭后触发
  closeErroeCallBack(kycStauts?: boolean, errCode?: string) {
    const kycPrimary = this.userKycStatus?.find((item: any) => item.type === 'KycPrimary');
    const intermediate = this.userKycStatus?.find((item: any) => item.type === 'KycIntermediat');
    if (kycStauts) {
      switch (errCode) {
        case '2049':
          return;
        case '2052':
          this.appService.toOnLineService$.next(true);
          return;
        case 'kcyError':
          if (kycPrimary?.status !== 'S') {
            this.kycDialogService.openPrimaryVerifyDialog();
          } else if (intermediate?.status !== 'S') {
            this.kycDialogService.openVerifyDialog(3);
          }
          this.route.navigateByUrl(`/${this.appService.languageCode}/userCenter/kyc`);
          break;
        case 'documentError':
        case 'kycLevelNotEnough':
          this.route.navigateByUrl(`/${this.appService.languageCode}/userCenter/kyc`);
          break;
        default:
          break;
      }
    }
  }
}
