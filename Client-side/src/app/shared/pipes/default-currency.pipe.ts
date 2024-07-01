import { Pipe, PipeTransform } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { CurrencyWalletService } from 'src/app/layouts/currency-wallet/currency-wallet.service';
import { UserAssetsService } from 'src/app/pages/user-asset/user-assets.service';

@Pipe({
  name: 'transToDefaultCurrency',
  pure: false,
})
export class TransToDefaultCurrencyPipe implements PipeTransform {
  constructor(
    private appService: AppService,
    private userAssetsService: UserAssetsService,
    private currencyWalletService: CurrencyWalletService
  ) {}

  /**
   * 返回 兑换的当前默认币种
   *
   * @param currency 接口返回币种
   * @param amount 接口返回金额
   * @param normal 正常 转换 默认为 false 用于 tournament
   * @returns
   */
  transform(amount: number = 0, currency: string, normal: boolean = false): string {
    const currentCurrency = this.appService.currentCurrency$.value;
    const cryptoRates = this.userAssetsService.allRate.value?.rates;
    const defaultToFiatRates = this.currencyWalletService.defaultToFiat$.value?.rates;

    // 默认币种和返回币种相同
    if (currentCurrency?.currency === currency) return normal ? String(amount) : String(this.processAmount(amount));

    // 当前币种 为虚拟货币 baseCurrency USDT
    if (currentCurrency?.isDigital) {
      const rate = cryptoRates?.find((rate: { currency: string; rate: number }) => rate?.currency === currency)?.rate;
      const returnAmount = Number(amount).subtract(rate || 0);
      return normal ? String(returnAmount) : String(this.processAmount(returnAmount));
    }

    // 当默认币种为法币时
    const fiatRate = defaultToFiatRates?.find(rate => rate.currency === currency)?.rate;
    const returnFiatAmount = Number(amount).subtract(fiatRate || 0);

    return normal ? String(returnFiatAmount) : String(this.processAmount(returnFiatAmount));
  }

  /**
   * tournament 金额显示 处理
   * 拿接口 数据金额 先做汇率换算 默认币种，然后格式化，最后相加
   *
   * @param amount
   * @returns
   */
  processAmount(amount: number): number {
    return Number(amount || 0) > 1
      ? Number(String(amount || 0).split('.')[0])
      : Number(Number(amount || 0).toFixed(2)) > 0.01
      ? Number(Number(amount || 0).toFixed(2))
      : 0;
  }
}
