import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class LegalAreaApi extends BaseApi {
  private _url = `${environment.apiUrl}/admin/legalarea`;

  /**
   * 获取司法管辖区
   */
  getLegalareaList(): Observable<any> {
    return this.get<any>(`${this._url}/getlegalarealist`);
  }

  /**
   * 更新司法管辖区
   */
  getUpdateLagalarea(params): Observable<any> {
    return this.post<any>(`${this._url}/updatelagalarea`, params);
  }

  /**
   * 新增司法管辖区
   */
  createLagalArea(params): Observable<any> {
    return this.post<any>(`${this._url}/createlagalarea`, params);
  }
}
