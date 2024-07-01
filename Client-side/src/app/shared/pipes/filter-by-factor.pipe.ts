import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterByFactor' })
export class FilterByFactorPipe implements PipeTransform {
  /**
   * 过滤列表 条件判断
   *
   * @param list 列表
   * @param enable 是否启用过滤
   * @param factor 条件函数
   * @returns
   */
  transform(list: any[], enable: boolean, factor: (item: any) => boolean = () => false): any[] {
    // console.log(factor(item))
    return list.filter(item => (enable ? factor(item) : true));
  }
}
