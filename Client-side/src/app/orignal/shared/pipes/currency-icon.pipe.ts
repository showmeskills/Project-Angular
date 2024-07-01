import { Pipe, PipeTransform } from '@angular/core';
import { AppService } from 'src/app/app.service';

@Pipe({
  name: 'currencyIcon',
})
export class CurrencyIconPipe implements PipeTransform {
  constructor(private appService: AppService) {}

  //返回币种图标
  transform(currency: string): any {
    const currencies = this.appService.currencies$.value;
    const item = currencies.find((x: any) => x.currency === currency);
    return item?.icon ?? '';
  }
}
