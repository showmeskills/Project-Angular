import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserAssetsService } from 'src/app/pages/user-asset/user-assets.service';
import {
  CryptoNetWorkItem,
  CurrenciesInterface,
  TokenNetworksFlatInterface,
  TokenNetworksInterface,
} from 'src/app/shared/interfaces/deposit.interface';
import { TokenNetworksValidationService } from 'src/app/shared/service/token-networks-validation';

export type DialogDataSubmitCallback<T> = (row: T) => void;

//数字货币提现选择网络弹出框
@Component({
  selector: 'app-select-network-dialog',
  templateUrl: './select-network-dialog.component.html',
  styleUrls: ['./select-network-dialog.component.scss'],
})
export class SelectNetworkDialogComponent implements OnInit {
  tokenNetworksFlat: CryptoNetWorkItem[] = [];
  isLoading: boolean = false;
  tokenNetworks: TokenNetworksInterface[] = [];
  tokenNetworksFlatDigital: TokenNetworksFlatInterface[] = [];

  constructor(
    private tokenNetworksValidationService: TokenNetworksValidationService,
    public dialogRef: MatDialogRef<SelectNetworkDialogComponent>,
    private userAssetsService: UserAssetsService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      callback: DialogDataSubmitCallback<any>;
      selectedCurrency: CurrenciesInterface;
      address: string;
      addressValied: boolean;
      isDeposit: boolean;
    },
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    if (!this.data.isDeposit) {
      //是提现
      await this.getNetWork('Withdraw');
      //网络地址正确&& 有选择币种 ：筛选出可用网络
      if (this.data.selectedCurrency && this.data.addressValied) {
        this.tokenNetworksFlat = this.tokenNetworksValidationService.getCryptoWithdrawNetWorkValiedList(
          this.data.selectedCurrency?.currency || '',
          this.data.address,
        );
      } else {
        // 当前币种的所有网络
        this.tokenNetworksFlat = this.tokenNetworksValidationService.getCryptoWithdrawNetWorkNuValiedList(
          this.data.selectedCurrency?.currency || '',
        );
      }
    } else {
      //充值
      await this.getNetWork('Deposit');
      this.tokenNetworksFlatDigital = this.tokenNetworksValidationService.getCryptoDepositNetWorkNuValiedList(
        this.data.selectedCurrency?.currency || '',
      );
    }
    this.isLoading = false;
  }

  //获取数字货币数据
  async getNetWork(category: string) {
    await this.userAssetsService.getWithdrawTokenNetWorks(category);
  }

  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
  }

  handleSelect(item: any) {
    if (!this.data.isDeposit) {
      //判断时充值还是提现
      if (!item.isValied) {
        //不匹配不允许选择
        return;
      }
    }

    this.data.callback(item);
    this.close();
  }
}
