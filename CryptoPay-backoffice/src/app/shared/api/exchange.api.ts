import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { Exchange, ExchangeItem, ExchangeParams, ExchangeStatusParams } from '../interfaces/exchange';
import { PageResponse } from 'src/app/shared/interfaces/base.interface';
import { catchError, map } from 'rxjs/operators';
import { ExchangeRecordParams, ExchangeRecordRes } from 'src/app/shared/interfaces/merchants-interface';

@Injectable({
  providedIn: 'root',
})
export class ExchangeApi extends BaseApi {
  private _url = `${environment.apiUrl}/exchangeratesetting`;

  /**
   * 获取汇率列表
   */
  getExchangeList(params: ExchangeParams): Observable<PageResponse<ExchangeItem>> {
    return this.get<any>(`${this._url}/getexchangeratesettings`, params);
  }

  /**
   * 获取汇率选项
   */
  getExchangeRates(params?: { target: string }): Observable<Exchange[]> {
    return this.get<any>(`${this._url}/getexchangerates`, params).pipe(
      catchError((err) => {
        console.error(err);
        return of([]);
      }),
      map((e) => (Array.isArray(e) ? e : []))
    );
  }

  /**
   * 更新汇率
   */
  updateExchange(params: { currency: string; buyRateSpread: number; sellRateSpread: number }): Observable<any> {
    return this.put<any>(`${this._url}/updateexchangeratesetting`, params);
  }

  /**
   * 更新汇率兑换状态
   */
  updateStatus(params: ExchangeStatusParams): Observable<boolean | Error> {
    return this.putQuery<boolean | Error>(`${this._url}/updatestatus`, params);
  }

  /**
   * 获取商户资产统计列表
   */
  getExchangeRecordList(params: ExchangeRecordParams): Observable<ExchangeRecordRes> {
    return this.get<any>(`${environment.apiUrl}/exchange/getexchangelist`, params);
  }
}
