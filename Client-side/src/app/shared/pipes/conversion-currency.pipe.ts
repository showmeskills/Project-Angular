import { Pipe, PipeTransform } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { CurrencyWalletService } from 'src/app/layouts/currency-wallet/currency-wallet.service';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';

@Pipe({
  name: 'conversionCurrency',
  pure: false,
})
export class ConversionCurrencyPipe implements PipeTransform {
  constructor(
    private currencyWalletService: CurrencyWalletService,
    private appService: AppService,
    private currencyValue: CurrencyValuePipe
  ) {}

  /**
   * 返回 兑换的当前默认币种
   *
   * @param amount 当前值
   * @param currency 传入货币值
   * @param isSymbol 是否展示 货币符号
   * @param isFiatSymbol
   * @returns
   */
  transform(amount: string, currency: string, isSymbol: boolean = true, isFiatSymbol: boolean = false) {
    const enable = this.currencyWalletService.conversionCurrency$.value.enable;
    const currentConversion = this.currencyWalletService.conversionCurrency$.value.currency;
    const digitals = this.appService.currencies$.value.filter(currency => currency.isDigital && currency.isVisible);
    const fiats = this.appService.currencies$.value.filter(currency => !currency.isDigital && currency.isVisible);
    const currentRates = this.currencyWalletService.conversionCurrency$.value.rate;
    // 未开启时 直接返回当前值
    if (!enable) return amount;

    // 如果当前值已经是法币，不进行转化
    if (fiats?.find(fiat => fiat?.currency === currency)) {
      // 开启 兑换汇率后 是否显示 当前兑换的法币符合和换算后的值
      const currentFiatRate = currentRates?.find(rate => rate?.currency === currency);
      if (currentFiatRate) {
        const afterFiatConversion = this.currencyValue.transform(
          Number(amount.replace(/,/g, '')).subtract(currentFiatRate?.rate || 0),
          currentConversion?.currency || ''
        );
        return isFiatSymbol ? `${currentConversion?.symbol}${afterFiatConversion}` : amount;
      }
    }

    // 虚拟货币转化为法币
    const currentRate = currentRates?.find(rate => rate.currency === currency);

    if (digitals?.find(digital => digital.currency === currency) && currentRate) {
      const afterConversion = this.currencyValue.transform(
        Number(amount.replace(/,/g, '')).subtract(currentRate?.rate),
        currentConversion?.currency || ''
      );
      return isSymbol ? `${currentConversion?.symbol}${afterConversion}` : afterConversion;
    }

    return amount;
  }
}
