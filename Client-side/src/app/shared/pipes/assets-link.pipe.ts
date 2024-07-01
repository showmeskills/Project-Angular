import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'assetsLink',
})
export class AssetsLinkPipe implements PipeTransform {
  /**拼接资源 */
  transform(value: string): any {
    if (!value) return '';
    if (value.startsWith('http')) return value;
    return `${environment.resourceUrl}${value.startsWith('/') ? '' : '/'}${value}`;
  }
}
