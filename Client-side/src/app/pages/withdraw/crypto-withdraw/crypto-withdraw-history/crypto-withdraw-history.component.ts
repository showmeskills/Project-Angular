import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { DigitalReceiptDialogComponent } from 'src/app/pages/top-up/digital/digital-receipt-dialog/digital-receipt-dialog.component';
import { WalletHistoryService } from 'src/app/pages/user-asset/wallet-history/wallet-history.service';
import { CointxHistoryInterface } from 'src/app/shared/interfaces/history.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';

@UntilDestroy()
@Component({
  selector: 'app-crypto-withdraw-history',
  templateUrl: './crypto-withdraw-history.component.html',
  styleUrls: ['./crypto-withdraw-history.component.scss'],
})
export class CryptoWithdrawHistoryComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private appService: AppService,
    private walletHistoryService: WalletHistoryService,
    private layout: LayoutService
  ) {}
  @Input() historyList: CointxHistoryInterface[] = [];
  @Input() loading: boolean = true;
  isH5!: boolean;

  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => {
      this.isH5 = e;
    });
  }

  /**处理地址格式 */
  getAddresseElipsis(addresse: string) {
    return addresse.slice(0, 7) + '...' + addresse.slice(-7);
  }

  //记录弹出框
  openReceipt(item: any) {
    item.isSelected = !item.isSelected;
    this.dialog.open(DigitalReceiptDialogComponent, {
      panelClass: 'custom-dialog-container',
      data: {
        callback: this.closeReceiptCallBack.bind(this),
        item,
        type: 'crypto',
      },
    });
  }

  //绑定接收DigitalReceiptDialogComponent 关闭后触发
  closeReceiptCallBack(data: any) {
    data.isSelected = false;
  }

  //跳转页面
  getLink(): string {
    this.walletHistoryService.designatedWithdrawCurrencyHistory$.next('isDigital');
    return `/${this.appService.languageCode}/wallet/history/withdrawal`;
  }
}
