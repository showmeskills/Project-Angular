import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { map } from 'rxjs/operators';
import { NegativeClearItem, NegativeClearParams } from 'src/app/shared/interfaces/monitor';
import { PageResponse } from 'src/app/shared/interfaces/base.interface';

@Injectable({
  providedIn: 'root',
})
export class NegativeclearApi extends BaseApi {
  private _url = `${environment.apiUrl}/member/negativeclear`;

  /**
   * 负值清零申请-查询
   */
  getNegativeClearList(params: NegativeClearParams): Observable<PageResponse<NegativeClearItem>> {
    return this.get<any>(`${this._url}/query`, params);
  }

  /**
   * 详情
   */
  getDetail(params: any): Observable<any> {
    return this.get<any>(`${this._url}/detail`, params);
  }

  /**
   * 今日
   */
  todayTotal(params: any): Observable<any> {
    return this.get<any>(`${this._url}/todaytotal`, params);
  }

  /**
   * 历史统计
   */
  historyTotal(params: any): Observable<any> {
    return this.get<any>(`${this._url}/historytotal`, params);
  }

  /**
   * 更新状态
   */
  updateStatus(params: any): Observable<any> {
    return this.post<any>(`${this._url}/updatestatus`, params);
  }

  /**
   * 更新负值清零状态
   */
  updatenegativeclearstatus(params: any): Observable<any> {
    return this.post<any>(`${this._url}/updatenegativeclearstatus`, params);
  }

  /**
   * 自动审核记录 - 类型下拉
   */
  negativeclearcategoryselect(): Observable<any> {
    return this.get<any>(`${this._url}/negativeclearcategoryselect`).pipe(map((e) => (Array.isArray(e) ? e : [])));
  }
}
