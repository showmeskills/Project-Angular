import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'routerActive',
  pure: false,
})
export class RouterActivePipe implements PipeTransform {
  /**
   * 检查路径是否激活
   *
   * @param value 要检查匹配的路径
   * @param type 类型 full 完全匹配 | include 包含匹配
   * @returns
   */
  transform(value: string, type: 'full' | 'include' = 'full'): boolean {
    if (!value) return false;
    const url = location.pathname.split('/').slice(2).join('/');

    switch (type) {
      case 'full':
        return value === url;
      case 'include':
        return url.includes(value);
      default:
        return false;
    }
  }
}
