import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { MonitorListParams, ReviewItem, ReviewParams } from 'src/app/shared/interfaces/review';
import { PageResponse } from 'src/app/shared/interfaces/base.interface';

@Injectable({
  providedIn: 'root',
})
export class ReviewApi extends BaseApi {
  private _url = `${environment.apiUrl}/audit`;
  private _urlAdmin = `${environment.apiUrl}/admin/adminoperateaudit`;

  /**
   * 获取审核列表
   */
  getReviewList(params: MonitorListParams): Observable<PageResponse<ReviewItem>> {
    return this.get<PageResponse<ReviewItem>>(`${this._url}/getauditrecordlist`, params);
  }

  /**
   *  操作审核&会员异常 - 审核
   */
  getAuditUpdateStatus(params: any): Observable<any> {
    return this.post<any>(`${this._urlAdmin}/updatestatus`, params);
  }

  /**
   * 获取审核历史记录
   */
  getList(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getlist`, params);
  }

  /**
   * 法币存款申请详情
   */
  getCurrencyAppealbyId(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getcurrencyappealbyid`, params);
  }

  /**
   * 虚拟币存款申请详情
   */
  getCoinAppealbyId(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getcoinappealbyid`, params);
  }

  /**
   * 审核申诉
   */
  updateAppeal(params: any): Observable<any> {
    return this.post<any>(`${this._url}/updateappeal`, params);
  }

  /**
   * 获取审核详情
   * @param id
   */
  getReviewDetail(id: number): Observable<ReviewItem> {
    return this.get<ReviewItem>(`${this._url}/getauditrecord`, { id });
  }

  /**
   * 审核
   */
  reviewUpdate(params: ReviewParams): Observable<boolean> {
    return this.post<any>(`${this._url}/auditverify`, params);
  }
}
