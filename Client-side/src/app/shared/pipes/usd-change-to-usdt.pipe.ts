import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'usdChangeToUsdt' })
export class UsdChangeToUsdtPipe implements PipeTransform {
  /**
   * 如果是USD则返回USDT
   *
   * @param val
   */
  transform(val: string): string {
    if (val === 'USD') return 'USDT';
    return val;
  }
}
