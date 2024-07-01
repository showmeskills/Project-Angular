import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sliceArray',
})
export class SliceArrayPipe implements PipeTransform {
  /**
   * 按传入长度分割数组
   *
   * @param data 要分割的数组
   * @param num 每个子数组的长度，最后不足的剩多少就是多少
   * @returns
   */
  transform<T>(data: T[], num: number): T[][] | T[] {
    if (num < 2) return data;
    const arr: T[][] = [];
    for (let i = 0; i < data.length; i = i + num) {
      arr.push(data.slice(i, i + num));
    }
    return arr;
  }
}
