import { Pipe, PipeTransform } from '@angular/core';
import { AppService } from 'src/app/app.service';

@Pipe({
  name: 'currencyIcon',
  pure: false,
})
export class CurrencyIconPipe implements PipeTransform {
  constructor(private appService: AppService) {}

  result: string = '';
  currency: string = '';

  //返回币种图标
  transform(currency: string): string {
    if (this.currency === currency && this.result) return this.result;
    const currencies = this.appService.currencies$.value;
    const item = currencies.find((x: any) => x.currency === currency);
    this.result = item?.icon ?? '';
    this.currency = currency;
    return this.result;
  }
}
