import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Country, LangModel } from '../interfaces/country.interface';
import { ResponseData } from '../interfaces/response.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class CountryApi extends BaseApi {
  /**
   * 获取api 请求国家数据
   *
   * @returns //
   */
  getCountries(): Observable<Country[]> {
    const url = `${environment.apiUrl}/v1/resource/country/getall`;
    return this.getByCaches<ResponseData<Country[]>>(url).pipe(
      map(x => {
        if (x?.success) return x?.data;
        return [];
      })
    );
  }

  /**
   * 获取api 所有语言
   *
   * @returns //
   */
  getalllanguage(): Observable<LangModel[]> {
    const url = `${environment.apiUrl}/v1/resource/language/getalllanguage`;
    return this.getByCaches<ResponseData<LangModel[]>>(url).pipe(
      map(x => {
        if (x) return x.data;
        return [];
      })
    );
  }

  // /**
  //  * 设置语言 参数
  //  *
  //  * @param langCode
  //  * @returns
  //  */
  // setLanguage(langCode: string): Observable<boolean | null> {
  //   const url = `${environment.apiUrl}/v1/resource/language/set?langCode=${langCode}`;
  //   return this.post<ResponseData<boolean>>(url).pipe(map(x => x?.data || null));
  // }
}
