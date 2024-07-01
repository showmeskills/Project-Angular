import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { ToolTipModule } from 'src/app/shared/components/tool-tip/tool-tip.module';
import { CurrencyRatio } from 'src/app/shared/interfaces/game.interface';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
export type DialogDataSubmitCallback<T> = (row: T) => void;
@Component({
  selector: 'app-sports-currency-popup',
  standalone: true,
  imports: [CustomizeFormModule, CommonModule, MatDialogModule, PipesModule, ToolTipModule],
  templateUrl: './sports-currency-popup.component.html',
  styleUrls: ['./sports-currency-popup.component.scss'],
})
export class SportsCurrencyPopupComponent implements OnInit {
  constructor(
    @Optional() public dialogRef: MatDialogRef<SportsCurrencyPopupComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      currency: string[];
      selectedPlayCoin: string;
      currencyRatio: CurrencyRatio[];
      callback: DialogDataSubmitCallback<string>;
    },
  ) {}
  showTip: boolean = false;
  selectedPlayCoin: string = '';

  /**显示币种提示 */
  get showCurrencyTip(): boolean {
    if (!this.data.currencyRatio) return false;
    const currency = this.data.currencyRatio.find(x => x.currency === this.data.selectedPlayCoin);
    return currency ? currency.ratio !== 1 : false;
  }

  ngOnInit(): void {
    this.showTip = this.showCurrencyTip;
    this.selectedPlayCoin = this.data.selectedPlayCoin;
  }

  onClose() {
    this.dialogRef.close();
  }

  onSelectCurrency(currency: string) {
    if (this.data.selectedPlayCoin === currency) return;
    this.data.selectedPlayCoin = currency;
    this.showTip = this.showCurrencyTip;
  }

  onConfirm() {
    this.onClose();
    if (this.selectedPlayCoin === this.data.selectedPlayCoin) return;
    this.data.callback(this.data.selectedPlayCoin);
  }
}
