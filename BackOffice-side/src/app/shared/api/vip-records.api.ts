import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import {
  PlayersPromoteParams,
  PlayersPromoteItem,
  VipPerformanceParams,
  VipPerformanceItem,
  VipComparisonParams,
  VipComparisonItem,
} from 'src/app/shared/interfaces/vip-records.interface';
import { PageResponse } from 'src/app/shared/interfaces/base.interface';

@Injectable({
  providedIn: 'root',
})
export class VipRecordsApi extends BaseApi {
  private _report = `${environment.apiUrl}/member`;

  /**
   * 推广玩家
   */
  getPlayersPromoteData(params: PlayersPromoteParams): Observable<PageResponse<PlayersPromoteItem>> {
    return this.get<any>(`${this._report}/playerspromote`, params);
  }

  /**
   * VIP绩效
   */
  getVipPerformanceData(params: VipPerformanceParams): Observable<PageResponse<VipPerformanceItem>> {
    return this.get<any>(`${this._report}/vipperformance`, params);
  }

  /**
   * VIP绩效
   */
  getVipComparisonData(params: VipComparisonParams): Observable<PageResponse<VipComparisonItem>> {
    return this.get<any>(`${this._report}/vipcomparison`, params);
  }
}
