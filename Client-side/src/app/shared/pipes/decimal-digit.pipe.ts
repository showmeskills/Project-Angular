import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decimalDigit',
})
export class DecimalDigitPipe implements PipeTransform {
  /**
   * 返回截取位数的小数字符串
   *
   * @param value 原始值，默认 0
   * @param max 允许小数点前后一共多少位，多余的删除，少的补0
   * @param calculateRightSideOnly max只计算右边的位数，等于单纯toFixed
   * @returns
   */
  transform(value: number = 0, max: number, calculateRightSideOnly?: boolean): string {
    let v = Number(value).toFixed(max);
    if (!calculateRightSideOnly) {
      let [x, y] = v.split('.');
      if (x.length + y.length > max) {
        const decimalLength = max - x.length;
        y = y.slice(0, decimalLength);
        v = [x, y].join('.');
      }
    }
    return v;
  }
}
