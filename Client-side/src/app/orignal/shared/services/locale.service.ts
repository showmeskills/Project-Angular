import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocaleService {
  constructor() {}

  localData: { [key: string]: string } = {};

  /**
   * 设置多语言数据
   *
   * @param data
   */
  setLocaleData(data: { [key: string]: string }) {
    this.localData = data;
  }

  /**
   * 获取多语言的文字
   *
   * @param key
   * @returns //
   */
  getValue(key: string) {
    return this.localData[key] || '';
  }
}
