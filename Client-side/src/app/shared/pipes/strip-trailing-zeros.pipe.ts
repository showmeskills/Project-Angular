import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stripTrailingZeros',
})
export class StripTrailingZerosPipe implements PipeTransform {
  /**
   * 移除小数点后 多余的 0
   *
   * @param value 原始值
   * @returns
   */
  transform(value: string): string {
    return String(Number(String(value || 0)));
  }
}
