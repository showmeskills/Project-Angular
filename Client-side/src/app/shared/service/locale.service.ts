import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocaleService {
  private localeData: { [key: string]: string } = {};

  /**
   * 设置多语言数据
   *
   * @param data
   */
  setLocaleData(data: { [key: string]: string }) {
    this.localeData = data;
  }

  /**
   * 获取多语言
   *
   * @param key
   * @param {...any} replace
   */
  getValue(key: string, ...replace: any[]): string {
    if (location.search.includes('showkey=1')) return key;
    if (!key) return '';
    let result = this.localeData[key.toLowerCase()] ?? '';
    if (replace.length > 0) {
      replace.forEach((v, i: number) => {
        result = result.replace(new RegExp('\\$\\{' + i + '\\}', 'g'), v);
      });
    }
    result = this.brandNameReplace(result);
    return result;
  }

  /**@brandNameReplace brand name 替换 */
  brandNameReplace(value: string): string {
    return value.replace(/({\s*Brand\s*Name\s*})|({\s*Brand\s*})|(x{3,})/gi, this.localeData['brand_name'] ?? '');
  }
}
