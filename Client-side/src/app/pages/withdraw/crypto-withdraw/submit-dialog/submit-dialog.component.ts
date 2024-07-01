import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { WithdrawApi } from 'src/app/shared/apis/withdraw.api';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { TokenAddress } from 'src/app/shared/interfaces/tokenaddress.interface';
import { CoinFiatToCrypto, CoinWithdrawReq, CurrencyWithdrawReq } from 'src/app/shared/interfaces/withdraw.interface';
import { General2faverifyService } from 'src/app/shared/service/general2faverify.service';
import { KycDialogService } from 'src/app/shared/service/kyc-dialog.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { SentryService } from 'src/app/shared/service/sentry.service';

export type DialogDataSubmitCallback<T> = (row: T) => void;

@Component({
  selector: 'app-submit-dialog',
  templateUrl: './submit-dialog.component.html',
  styleUrls: ['./submit-dialog.component.scss'],
})
export class SubmitDialogComponent implements OnInit {
  constructor(
    private sentryService: SentryService,
    private general2faverifyService: General2faverifyService,
    private appService: AppService,
    private withdrawApi: WithdrawApi,
    private popupService: PopupService,
    private localeService: LocaleService,
    private kycDialogService: KycDialogService,
    @Optional() public dialogRef: MatDialogRef<SubmitDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      callback: DialogDataSubmitCallback<any>;
      submitData: any;
      submitWay: string;
      need2fa?: boolean;
      isCrypToSubmit?: boolean;
      isNeedWalletAddress?: boolean;
    }
  ) {}

  loadding!: boolean;

  ngOnInit() {
    console.log('submitData--->', this.data.submitData);
  }

  /**关闭弹窗 */
  close(): void {
    this.dialogRef.close();
  }
  //submit
  next() {
    //2fa认证(法币提款默认不再需要2fa)
    if (this.data.need2fa) {
      this.general2faverifyService.launch('Withdraw').subscribe(res => {
        if (res.status) this.submitOrder(res.key);
      });
    } else {
      this.submitOrder(this.data?.submitData?.key);
    }
  }

  async submitOrder(key?: string) {
    this.loadding = true;
    this.dialogRef.disableClose = true;

    //-------------------------数字货币订单
    if (this.data.submitWay == 'cryptoWithdraw') {
      // 提法得虚
      if (this.data.submitData.isCrypToSubmit) {
        this.onCrypToSubmit(key);
        return;
      }
      const param: CoinWithdrawReq = {
        key: key,
        currency: this.data.submitData.currency,
        address: this.data.submitData.address,
        addressId: this.data.submitData.addressId,
        network: this.data.submitData.network,
        amount: this.data.submitData.amount,
      };
      const result = await firstValueFrom(this.withdrawApi.coinWithdraw(param));
      if (result?.code === '2098') {
        // 禁止提款
        this.appService.showForbidTip('income', result.message);
      } else if (result?.code === '2050') {
        this.kycDialogService.showKycError(2050, 1, false);
      } else {
        this.data.callback(result);
      }
      //sentryLog
      if (!result?.data) {
        this.sentryService.error('WithdrawError', 'Crypto Withdraw Error', {
          extra: { params: param, response: result },
          level: 'warning',
        });
      }
      this.close();
    } else {
      //------------------------法币订单
      let param: CurrencyWithdrawReq;
      if (this.data.submitData.isNeedWalletAddress) {
        const selectedAddress: TokenAddress | null = this.data.submitData.selectedAddress;
        if (selectedAddress) {
          // 地址簿不用2fakey
          param = {
            paymentCode: this.data.submitData.selectedWithdraw.code,
            currency: this.data.submitData.selectedCurrency.currency,
            amount: this.data.submitData.amount,
            actionType: this.data.submitData.selectedWithdraw.actionType,
            walletaddress: selectedAddress.address,
            addressId: selectedAddress.id,
          };
        } else {
          param = {
            key: key,
            paymentCode: this.data.submitData.selectedWithdraw.code,
            currency: this.data.submitData.selectedCurrency.currency,
            amount: this.data.submitData.amount,
            actionType: this.data.submitData.selectedWithdraw.actionType,
            walletaddress: this.data.submitData.walletaddress,
          };
        }
      } else {
        param = {
          key: key,
          paymentCode: this.data.submitData.selectedWithdraw.code,
          currency: this.data.submitData.selectedCurrency.currency,
          bankCardId: this.data.submitData.selectbackCard.id,
          amount: this.data.submitData.amount,
          actionType: this.data.submitData.selectedWithdraw.actionType,
        };
      }
      const result = await firstValueFrom(this.withdrawApi.currencyWithdraw(param));
      if (result?.data) {
        this.data.callback(result);
      } else {
        if (result?.code === '2098') {
          // 禁止提款
          this.appService.showForbidTip('income', result?.message || '');
        } else {
          if (result?.message) {
            this.errorDialog(
              this.localeService.getValue(`hint`),
              result.message,
              this.localeService.getValue(`i_ha_kn00`)
            );
          }
        }
        this.sentryService.error('WithdrawError', 'Fiat Withdraw Error', {
          extra: { params: param, response: result },
          level: 'warning',
        });
      }
      this.close();
    }
  }

  // 错误弹出框
  errorDialog(title?: string, errorMsg?: string, btnTxt?: string) {
    this.popupService.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        type: 'warn',
        content: title,
        buttons: [{ text: btnTxt, primary: true }],
        description: errorMsg,
      },
    });
  }

  /**
   * 提虚得法的 方法
   *
   * @param key 2fa 返回的值
   */
  onCrypToSubmit(key?: string) {
    const data = this.data.submitData;
    const params: CoinFiatToCrypto = {
      key,
      currency: data.currency,
      withdrawCurrency: data.withdrawCurrency,
      address: data.address,
      network: data.network,
      amount: data.amount,
      paymentCode: data.paymentCode,
      actionType: data.actionType,
      rateId: data.rateId,
      addressId: data.addressId,
    };
    this.withdrawApi.coinFiatToCrypto(params).subscribe(data => {
      this.loadding = false;
      this.data.callback(data);
      //sentryLog
      if (!data?.data) {
        this.sentryService.error('WithdrawError', 'Fiat to Crypto Withdraw Error', {
          extra: { params, response: data },
          level: 'warning',
        });
      }
      this.close();
    });
  }

  minus(a: number, b: number) {
    return Number(a).minus(Number(b));
  }
}
