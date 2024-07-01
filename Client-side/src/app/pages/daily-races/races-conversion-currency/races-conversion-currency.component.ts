import { Component, Input, OnChanges, SimpleChanges, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyWalletService } from 'src/app/layouts/currency-wallet/currency-wallet.service';

@Component({
  selector: 'app-races-conversion-currency',
  templateUrl: './races-conversion-currency.component.html',
  styleUrls: ['./races-conversion-currency.component.scss'],
})
export class RacesConversionCurrencyComponent implements OnChanges {
  constructor(private currencyWalletService: CurrencyWalletService) {}

  /** 金额 */
  @Input() amount: number = 0;
  _amount = signal(this.amount);
  renderAmount = computed(() => this._amount);

  /** 币种 */
  @Input() currency: string = 'USDT';
  _currency = signal(this.currency);
  renderCurrency = computed(() => this._currency);

  /** 是否开启  */
  conversionEnable = toSignal(this.currencyWalletService.conversionCurrency$);

  ngOnChanges(changes: SimpleChanges): void {
    this._amount.set(changes?.amount?.currentValue || 0);
    this._currency.set(changes?.currency?.currentValue || 'USDT');
  }
}
