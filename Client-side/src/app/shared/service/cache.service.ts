import { Injectable } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { environment } from 'src/environments/environment';
import { Country } from '../interfaces/country.interface';

const LANGUAGE = 'lang';
const COUNTRY = 'country';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  constructor(private appService: AppService) {}

  private prefix: string = 'cache.';

  //清理上一个版本的缓存
  private removeCache(key: string): void {
    const oldKey = this.prefix + (Number(environment.cacheKey) - 1) + key;
    localStorage.removeItem(oldKey);
  }

  private getValue(key: string): string | null {
    return window.localStorage.getItem(this.prefix + environment.cacheKey + key);
  }

  private setValue(key: string, value: string | null) {
    localStorage.setItem(this.prefix + environment.cacheKey + key, value || '');
  }

  /**
   * 国家数据
   */
  get countries(): Country[] {
    const jsonStr = this.getValue(COUNTRY + this.appService.languageCode);
    if (jsonStr) return JSON.parse(jsonStr);
    return [];
  }

  /**
   * 国家数据
   */
  set countries(value: Country[]) {
    this.removeCache(COUNTRY + this.appService.languageCode);
    this.setValue(COUNTRY + this.appService.languageCode, JSON.stringify(value));
  }
}
