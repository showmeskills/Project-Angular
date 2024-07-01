import { Pipe, PipeTransform } from '@angular/core';
import { arrSearch } from 'src/app/shared/models/tools.model';

@Pipe({
  name: 'filterKey',
  standalone: true,
})
export class FilterKeyPipe implements PipeTransform {
  constructor() {}

  transform<T>(value: T[], keys?: keyof T | Array<keyof T>, keyVale?: T[keyof T & string]): T[] {
    if (!Array.isArray(value)) return value;

    return value.filter((e) => {
      if (Array.isArray(keys) && keys?.length) {
        return keys.every((key) => (keyVale !== undefined ? e[key] === keyVale : e[key]));
      } else if (typeof keys === 'string') {
        return keyVale !== undefined ? e[keys] === keyVale : e[keys];
      }

      return e;
    });
  }
}

@Pipe({
  name: 'search',
  standalone: true,
})
export class searchFilter implements PipeTransform {
  constructor() {}

  transform(value: any[], key?: string | false, searchValue?: string): any {
    return arrSearch(value, searchValue, key);
  }
}
