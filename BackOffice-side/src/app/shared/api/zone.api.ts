import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ZoneApi extends BaseApi {
  private _url = `${environment.apiUrl}/resource/zone`;

  /**
   * 获取国家
   */
  getCountries(): Observable<any> {
    return this.get<any>(`${this._url}/getcountries`);
  }

  /**
   * 获取全部语言
   */
  getLanguages(): Observable<any> {
    return this.get<any>(`${this._url}/getlanguages`).pipe(
      map((e) => (Array.isArray(e) ? e.map((j) => ({ ...j, code: j.code.toLowerCase() })) : []))
    );
  }
}
