import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { combineLatest, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { UserAssetsService } from 'src/app/pages/user-asset/user-assets.service';
import { TokenAddressApi } from 'src/app/shared/apis/tokenaddress.api';
import { NetworksInterface } from 'src/app/shared/interfaces/deposit.interface';
import { EwPaymentlist, TokenAddress } from 'src/app/shared/interfaces/tokenaddress.interface';
import { WithdrawService } from '../../withdraw.service';

@Component({
  selector: 'app-select-address-dialog',
  templateUrl: './select-address-dialog.component.html',
  styleUrls: ['./select-address-dialog.component.scss'],
})
export class SelectAddressDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<unknown>,
    private withdrawService: WithdrawService,
    private tokenAddressApi: TokenAddressApi,
    private userAssetsService: UserAssetsService,
    public appService: AppService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      /**币种 */
      currency: string;
      /**支付方式（用于电子钱包,传了就代表筛选该电子钱包的地址） */
      paymentMethod: string;
    }
  ) {}

  /**准备中 */
  isLoading: boolean = true;
  /**用户当前货币、支付方式可能用地址列表 */
  userAddressList: TokenAddress[] = [];
  /**当前币种可用的网路（数字货币专用） */
  networks: NetworksInterface[] = [];
  /**电子钱包列表 */
  ewalletpaymentlist: EwPaymentlist[] = [];

  hasdata: boolean = false;

  ngOnInit() {
    if (!this.data.currency) return;
    combineLatest([
      this.withdrawService.loadAddressList().pipe(map(x => x?.data || [])),
      from(this.userAssetsService.getWithdrawTokenNetWorks('Withdraw')),
      this.tokenAddressApi.getewalletpaymentlist().pipe(map(x => x?.data || [])),
    ]).subscribe(([userAddressList, tokenNetworks, ewalletpaymentlist]) => {
      this.ewalletpaymentlist = ewalletpaymentlist;
      this.networks = tokenNetworks.find(x => x.currency === this.data.currency)?.networks || [];
      this.userAddressList = userAddressList.map(x => {
        let available = false;
        let networkInfo: NetworksInterface | null = null;
        if (this.data.paymentMethod) {
          available = this.data.paymentMethod === x.paymentMethod && this.data.currency === x.currency;
        } else {
          networkInfo = this.networks.find(y => y.network === x.network) ?? null;
          available = !!networkInfo;
        }
        if (available) this.hasdata = true;
        return {
          ...x,
          available,
          networkInfo,
        };
      });
      this.isLoading = false;
    });
  }

  clickAddress(item: TokenAddress) {
    if (item.available) {
      this.dialogRef.close(item);
    }
  }
}
