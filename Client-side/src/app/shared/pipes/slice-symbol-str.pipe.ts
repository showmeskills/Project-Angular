import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sliceSymbolStr',
})
export class SliceSymbolStr implements PipeTransform {
  /**
   * 给数字字段添加逗号
   *
   * @param value 要分割的字符串或者数字
   * @param stringSplit 以什么符号分割 默认是 逗号
   * @param num 多少位默认 3位
   * @returns
   */
  transform(value: number | string, stringSplit: string = ',', num: number = 3): string {
    let data = value.toString();
    if (data.length <= num) return data;

    let result = '';
    while (data.length > num) {
      result = `${stringSplit}${data.slice(-num)}${result}`;
      data = data.slice(0, data.length - num);
    }

    if (data) result = data + result;

    return result;
  }
}
