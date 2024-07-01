import { Injectable, OnDestroy } from '@angular/core';
import { SelectApi } from 'src/app/shared/api/select.api';
import { BehaviorSubject } from 'rxjs';
import { Currency } from 'src/app/shared/interfaces/currency';
import BigNumber from 'bignumber.js';
import { AssetApi } from 'src/app/shared/api/asset.api';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService implements OnDestroy {
  constructor(
    private selectApi: SelectApi,
    private assetApi: AssetApi
  ) {
    this.updateCurrency();
  }

  private _list$ = new BehaviorSubject<Currency[]>([]);

  get list$() {
    return this._list$.asObservable();
  }

  get list() {
    return this._list$.getValue();
  }

  /** 基于USDT换算其他币种的汇率数据 */
  currencyRateList: { currency: string; rate: number }[] = [];

  /** 格式币种小数点（法币2虚拟币8）
   * @param currency {string} 币种
   * @param value {any} 被格式化的值
   * @return {string}
   */
  toFormatCurrency(currency: string, value): string {
    for (const prod of this.list) {
      if (prod.code?.toLowerCase() === currency.toLowerCase()) {
        const num = prod.isDigital ? 8 : 2;
        return new BigNumber(+value || 0).toFixed(num);
      }
    }

    return '-';
  }

  /** 是否为虚拟币
   * @param currency {string} 币种
   * @param list {Currency[]} 币种列表
   * @return {boolean}
   */
  isDigital(currency: string, list?: Currency[]): boolean {
    list = list !== undefined ? list : this.list;

    return list.some((e) => e.code?.toLowerCase() === currency.toLowerCase() && e.isDigital);
  }

  /**
   * 更新币种列表
   * @param currency 更新的币种列表，不传则从新拉取 默认为undefined
   */
  updateCurrency(currency?: Currency[]): Promise<Currency[]> {
    return new Promise((resolve) => {
      if (currency !== undefined) {
        this._list$.next(currency);
        return resolve(currency);
      }

      this.selectApi.getCurrencySelect().subscribe((res) => {
        this._list$.next(res);

        this.getCurrencyRate();

        resolve(res);
      });
    });
  }

  /** 基于USDT换算其他币种实时汇率 */
  getCurrencyRate() {
    this.assetApi
      .getrate({
        baseCurrency: 'USDT',
        exchangeCurrencies: this.list
          .filter((v) => v.code !== 'USDT')
          .map((j) => j.code)
          .join(),
      })
      .subscribe((rateData) => {
        this.currencyRateList = Array.isArray(rateData?.data?.rates) ? rateData?.data?.rates : [];
      });
  }

  /** 基于USDT实时汇率换算币种金额 */
  getUsdtRateAmount(currency: string, amount: number) {
    if (!amount || !currency || !this.currencyRateList.length) return '';

    if (currency === 'USDT') return amount;
    const rate = this.currencyRateList.find((v) => v?.currency === currency)?.rate || 0;
    return rate * amount;
  }

  /** lifeCycle */
  ngOnDestroy(): void {
    this._list$.complete();
  }
}
