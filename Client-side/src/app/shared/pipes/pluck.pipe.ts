/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pluck',
})
export class PluckPipe implements PipeTransform {
  /**
   * 从对象数组中摘取指定key组成新数组返回，或组成字符串返回
   *
   * @param data
   * @param key 指定key
   * @param join 设置了非undefined的值，即代表返回字符串，并用它来连接各个成员
   * @param prefix 附加到成员前面
   * @param suffix 附加到成员后面
   * @returns //
   */
  transform(data: any[], key: string, join?: string, prefix: string = '', suffix: string = ''): string[] | string {
    const r: string[] = data.map(v => v[key] as string);
    if (join !== undefined) {
      return r.map(x => prefix + String(x) + suffix).join(join);
    }
    return r;
  }
}
