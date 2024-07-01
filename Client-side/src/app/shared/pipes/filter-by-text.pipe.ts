import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterByText' })
export class FilterByTextPipe implements PipeTransform {
  /**
   * 过滤列表（通常用于搜索）
   *
   * @param list 列表
   * @param searchText 搜索内容
   * @param keys 要搜索的字段数组
   * @returns
   */
  transform(list: any[], searchText: string, keys: string[]): any[] {
    const st = (String(searchText) || '').trim().toUpperCase();
    return list?.filter(item => keys.some(x => (String(item[x]) || '').toUpperCase().includes(st)));
  }
}
