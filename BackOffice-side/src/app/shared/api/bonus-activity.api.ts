import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class BonusActivityApi extends BaseApi {
  private _url = `${environment.apiUrl}/bonus`;

  /**
   * 竞赛活动模板 新增
   */
  competitionCreate(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/back_rank_add`, parmas);
  }

  /**
   * 竞赛活动模板 编辑
   */
  competitionUpdate(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/back_rank_update`, parmas);
  }

  /**
   * 竞赛活动模板 分页
   */
  getCompetitionList(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/back_rank_page`, parmas);
  }

  /**
   * 竞赛活动模板 状态更改
   */
  competitionStatus(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/back_rank_cos`, parmas);
  }

  /**
   * 竞赛活动 - 互动交易排名
   */
  getCompetitionIssueRank(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/back_details_array`, parmas);
  }

  /**
   * 竞赛活动 - 活动交易列表
   */
  getCompetitionIssueList(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/back_pagae`, parmas);
  }

  /**
   * 竞赛活动 - 活动交易列表 - 交易排名
   */
  getCompetitionRankDetail(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/back_details_pagae`, parmas);
  }
}
