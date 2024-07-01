import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { map } from 'rxjs/operators';
import {
  AppealStat,
  GameRank,
  LiveTransaction,
  SourceCount,
  SupplierReport,
  TransactionGeneralize,
  UserRank,
  UserTrend,
} from 'src/app/shared/interfaces/supplier';

@Injectable({
  providedIn: 'root',
})
export class SupplierApi extends BaseApi {
  private _url = `${environment.apiUrl}/asset/supplier`;

  /**
   * 供应商报表 总入口 (累计输赢展示,输赢趋势图,交易概括模块,各游戏厂商模块)
   */
  getSupPlierGamestat(params: any): Observable<SupplierReport> {
    return this.get<any>(`${this._url}/suppliergamestat`, params);
  }

  /**
   * 会员详情 总入口 (累计输赢展示,输赢趋势图,交易概括模块,各游戏厂商模块)
   */
  getMembergamesTatt(params: any): Observable<any> {
    return this.get<any>(`${this._url}/membergamestat`, params);
  }

  /**
   * 供应商报表 输赢趋势图
   */
  getPayOutTrendChart(params: any): Observable<any> {
    return this.get<any>(`${this._url}/payouttrendchart`, params);
  }

  /**
   * 会员详情 输赢趋势图
   */
  getMemberPayOutTrendChart(params: any): Observable<any> {
    return this.get<any>(`${this._url}/memberpayouttrendchart`, params);
  }

  /**
   * 游戏排名查询
   */
  getGameRank(params: any): Observable<GameRank[]> {
    return this.get<any>(`${this._url}/gamerank`, params).pipe(map((res) => (Array.isArray(res) ? res : [])));
  }

  /**
   * 会员排名查询
   */
  getUserRank(params: any): Observable<UserRank[]> {
    return this.get<any>(`${environment.apiUrl}/asset/dashboard/userwagerrank`, params).pipe(
      map((res) => (Array.isArray(res) ? res : []))
    );
  }

  /**
   * 游戏排名比较查询
   */
  getGameRankCompare(params: any): Observable<any> {
    return this.get<any>(`${this._url}/gamerankcompare`, params);
  }

  /**
   * 交易概括
   */
  getGeneralize(params: any): Observable<TransactionGeneralize[]> {
    return this.get<any>(`${this._url}/transactionsummary`, params).pipe(map((res) => (Array.isArray(res) ? res : [])));
  }

  /**
   * 实时概括
   */
  getTransaction(params: any): Observable<LiveTransaction> {
    return this.get<any>(`${environment.apiUrl}/asset/dashboard/transactionstat`, params);
  }

  /**
   * 实时监控 - 申诉统计
   */
  getAppealStat(params: any): Observable<AppealStat> {
    return this.get<any>(`${environment.apiUrl}/asset/dashboard/appealstat`, params);
  }

  /**
   * 会员趋势
   */
  getUserTrend(params: any): Observable<UserTrend[]> {
    return this.get<any>(`${environment.apiUrl}/asset/dashboard/usertrend`, params).pipe(
      map((res) => (Array.isArray(res) ? res : []))
    );
  }

  /**
   * 来源统计
   */
  getSource(params: any): Observable<SourceCount[]> {
    return this.get<any>(`${environment.apiUrl}/asset/dashboard/userchannelstat`, params).pipe(
      map((res) => (Array.isArray(res) ? res : []))
    );
  }
}
