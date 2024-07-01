import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
@Injectable({
  providedIn: 'root',
})
export class ResourceApi extends BaseApi {
  /**
   * 加载原创翻译链接
   *
   * @param langCode
   * @returns //
   */
  getLocale(langCode: string): Observable<{ [key: string]: string }> {
    const localeUrls = environment.translateUrl.split(',').map(x => {
      if (!x.startsWith('http')) x = window.location.origin + x;
      return x.replace('[lang]', langCode).replace(/\/LanguageTranslate\/Web\d*/, '/LanguageTranslate/OriginalGame');
    });
    let index = 0;
    const timeOut = 10 * 1000; //10秒超时
    const retryFn = (error: unknown) => {
      this.sentryService.apiError(localeUrls[index], error);
      index = index + 1 >= localeUrls.length ? 0 : index + 1;
      if (index === 0) {
        return of(null);
      } else {
        return this.getByCaches<{ [key: string]: string }>(localeUrls[index], timeOut, retryFn);
      }
    };
    return this.getByCaches<{ [key: string]: string }>(localeUrls[index], timeOut, retryFn);
  }
}
