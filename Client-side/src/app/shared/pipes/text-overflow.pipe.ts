import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textOverflow',
})
export class TextOverflowPipe implements PipeTransform {
  /**
   * 某些地方产品规定了固定字数，目前只考虑中文 TODO: 其他语言处理
   *
   * @param text 截取的字符串
   * @param max 最大长度
   * @param join 超出显示，默认...
   * @returns
   */
  transform(text: string, max: number, join: string = '...'): string {
    return text.length > max ? text.slice(0, max) + join : text;
  }
}
