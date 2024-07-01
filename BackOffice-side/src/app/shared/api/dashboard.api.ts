import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class DashboardApi extends BaseApi {
  private _url = `${environment.apiUrl}/admin/dashboard`;

  /**
   * 交易概括
   */
  getTransactionSummary(params: any): Observable<any> {
    return this.get<any>(`${this._url}/gettransactionsummary`, params);
  }

  /**
   * 实时监控数据
   */
  getRealtimeData(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getrealtimedata`, params);
  }

  /**
   * 用户留存率
   */
  getRetentionRateOutPut(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getretentionrateoutput`, params);
  }

  /**
   * 支付一览
   */
  payMentList(params: any): Observable<any> {
    return this.get<any>(`${this._url}/paymentlist`, params);
  }

  /**
   * 会员趋势
   */
  getMemberTrends(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getmembertrends`, params);
  }

  /**
   * 实时概括
   */
  getRealTimeSummary(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getrealtimesummary`, params);
  }

  /**
   * 游戏排行榜
   */
  getGameRank(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getgamerank`, params);
  }

  /**
   * 真人娱乐场排行榜
   */
  getlivecasinorank(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getlivecasinorank`, params);
  }

  /**
   * 老虎机棋牌排行榜
   */
  getslotchessrank(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getslotchessrank`, params);
  }

  /**
   * 会员排行榜
   */
  getUserGameRank(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getusergamerank`, params);
  }

  /**
   * 国家排行榜
   */
  getCountryGameRank(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getcountrygamerank`, params);
  }

  /**
   * 货币排行榜
   */
  getCurrencyGameRank(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getcurrencygamerank`, params);
  }
}
