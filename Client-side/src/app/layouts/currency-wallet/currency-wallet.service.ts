import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserAssetsService } from 'src/app/pages/user-asset/user-assets.service';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { AllRateData, RateItem } from 'src/app/shared/interfaces/wallet.interface';

export type ConversionCurrency = {
  currency: CurrenciesInterface | null;
  enable: boolean;
  loading: boolean;
  rate: RateItem[];
};

export type DefaultFiatToFiat = {
  currency: CurrenciesInterface | null;
  rates: RateItem[] | null;
};

@Injectable({
  providedIn: 'root',
})
export class CurrencyWalletService {
  /** 默认币种 和 其他法币兑换 汇率*/
  defaultToFiat$: BehaviorSubject<DefaultFiatToFiat> = new BehaviorSubject<DefaultFiatToFiat>({
    currency: null,
    rates: [],
  });

  /** 当前显示用于换算的币种 */
  conversionCurrency$: BehaviorSubject<ConversionCurrency> = new BehaviorSubject<ConversionCurrency>({
    currency: null,
    enable: false,
    loading: false,
    rate: [],
  });

  constructor(private userAssetsService: UserAssetsService) {}

  /**
   *
   * @param currencies
   * @param data
   * @returns
   */
  async updateRate(data: AllRateData) {
    const self = this.conversionCurrency$.value;
    if (!self || !self.currency || self.loading) return;
    this.conversionCurrency$.next({ ...self, loading: true });
    const baseCurrency = self.currency.currency;
    const res = this.userAssetsService.getRatesBaseCurrency(data, baseCurrency);
    this.conversionCurrency$.next({
      ...self,
      loading: false,
      rate: res.rates || [],
    });
  }

  amountAfterCalculateRate(balance: number, currency: string) {
    const rate = this.conversionCurrency$.value.rate?.find(x => x.currency === currency)?.rate || 1;
    if (rate) return Number(balance ?? 0) * rate;
    return 0;
  }
}
