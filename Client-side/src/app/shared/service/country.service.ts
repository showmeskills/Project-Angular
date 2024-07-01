import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CountryUtilsService {
  //增加语言需要增加这里的样式对应
  public classNames: { [key: string]: string } = {
    'zh-cn': 'country-China',
    'en-us': 'country-United_Kingdom',
    th: 'country-Thailand',
    vi: 'country-Vietnam',
    tr: 'country-Turkey',
    'pt-br': 'country-Brazil',
    ja: 'country-Japan',
  };

  /**
   * 获取国家classname
   *
   * @param lang 语系
   * @returns //
   */
  getcountryClassName(lang: string = 'zh-cn') {
    lang = lang.toLowerCase();
    if (this.classNames[lang]) return this.classNames[lang];
    return '';
  }
}
