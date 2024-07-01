// filter.pipe.ts

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'countryFilter' })
export class CountryFilterPipe implements PipeTransform {
  /**
   *
   * @param list
   * @param searchText 搜索国家名或区号
   * @returns
   */
  transform(list: any[], searchText: any): any[] {
    const len = searchText.length;
    return list.find(
      item => item.name.toLowerCase().substr(0, len).search(searchText.toLowerCase().substr(0, len)) > -1
    )
      ? list.filter(item => item.name.toLowerCase().substr(0, len).search(searchText.toLowerCase().substr(0, len)) > -1)
      : list.filter(item => item.areaCode.substr(0, len + 1).search(searchText.substr(0, len)) > -1);
  }
}
