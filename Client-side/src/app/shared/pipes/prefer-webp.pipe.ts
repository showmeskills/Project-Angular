import { Pipe, PipeTransform, isDevMode } from '@angular/core';
import { AppService } from 'src/app/app.service';

@Pipe({
  name: 'preferWebp',
})
export class PreferWebpPipe implements PipeTransform {
  constructor(private appService: AppService) {}
  transform(value: string, simple: boolean | string = false): string {
    let v = value ?? '';
    if (simple && v.startsWith('http')) {
      const base = '?q=80';
      const format = '&format=webp';
      const width = typeof simple === 'string' ? '&w=' + simple : '';
      return window.isSupportWebp ? v + base + format + width : v + base + width;
    }
    const arr = v.split('.');
    // 支持webp默认使用webp，要确保该图片的webp格式存在
    if (arr[1] && arr[1] !== 'webp' && window.isSupportWebp) {
      v = `${arr[0]}.webp`;
    }
    // 如果是本地资源，改用 deployUrl 域名
    if (!v.startsWith('http') && !isDevMode()) {
      const deployUrl = this.appService.tenantConfig?.config?.deployUrl || '';
      v = deployUrl + v;
    }
    // 增加版本号
    if (v) {
      v = `${v}?v=${window.version}`;
    }
    return v;
  }
}
