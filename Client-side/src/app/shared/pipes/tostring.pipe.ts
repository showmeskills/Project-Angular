import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tostring',
})
export class TostringPipe implements PipeTransform {
  /**
   * 转换科学计数法为字符串
   *
   * @param value 数字
   * @param decimal 是否要指定的位数
   * @returns
   */
  transform(value: number, decimal?: number): string {
    if (value === undefined || value === null) return '';

    if (decimal !== undefined) {
      return value.toDecimal(decimal);
    } else {
      //63213e+4
      const m: any = value?.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
      if (m?.length) {
        return value.toFixed(Math.max(0, (m[1] || '').length - m[2]));
      }
      return value?.toString() || '';
    }
  }
}
