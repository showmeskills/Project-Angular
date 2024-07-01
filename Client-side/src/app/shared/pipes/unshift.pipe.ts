import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unshift',
})
export class UnshiftPipe implements PipeTransform {
  /**
   * 把传入内容压入数组第一位
   *
   * @param data 要操作的数据，必须是数组，例如 [{foo:true...},{foo:false...}...]
   * @param item 要压入的数据
   * @returns
   */
  transform<T>(data: T[], item: T): T[] {
    return [item, ...data];
  }
}
