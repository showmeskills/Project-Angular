import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replace',
})
export class ReplacePipe implements PipeTransform {
  /**
   *
   * @param value 要替换的原始值
   * @param find 查找的字符串 或 正则表达式
   * @param to 替换为的字符串
   * @returns 结果字符串
   */
  transform(value: string, find: string | RegExp, to: string): string {
    if (find instanceof RegExp) {
      return value.replace(find, to);
    } else {
      // 替代 replaceAll
      const strArr = value.split(find);
      return strArr.length > 1 ? strArr.join(to) : value;
    }
  }
}
