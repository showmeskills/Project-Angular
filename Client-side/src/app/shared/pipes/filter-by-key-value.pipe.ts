/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByKeyValue',
})
export class FilterByKeyValuePipe implements PipeTransform {
  /**
   * 根据对应值，过滤数组成员，如果数据很多且经常变化，请慎用
   *
   * @param data 要过滤的数据，必须是对象数组，例如 [{foo:true...},{foo:false...}...]
   * @param key 要根据什么值过滤，如果 contrast 没有传(即undefined),则直接判断这个[key]值的真假，为真的返回
   * @param contrast 对比值，如果传了，则会根据这个值来对比，成员的 [key] 完全等于 contrast 才会返回
   * @param outputKey 输出第一个结果的 [outputKey] 的值，如果没有结果，则返回空字符串; 如果传'_SELF'直接返回结果的第一个成员(对象)
   * @param defaultText
   * @returns 原数组的一部分成员组成的数组、原数组的其中一个成员、某一个成员的某个key的值等
   */
  transform(
    data: any[],
    key: string,
    contrast?: string | number | boolean,
    outputKey?: string,
    defaultText?: string,
  ): any {
    const result = (data || []).filter(x => (contrast === undefined ? x[key] : x[key] === contrast));
    if (outputKey === undefined) {
      return result;
    } else {
      if (result[0]) {
        if (outputKey === '_SELF') {
          return result[0];
        } else {
          return result[0][outputKey];
        }
      } else {
        return defaultText ?? '';
      }
    }
  }
}
