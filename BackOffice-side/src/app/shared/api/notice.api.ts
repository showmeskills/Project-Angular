import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class NoticeApi extends BaseApi {
  private _url = `${environment.apiUrl}/resource/notice`;

  /**
   * 获取公告列表
   */
  getNoticeList(params?: any): Observable<any> {
    return this.get<any>(`${this._url}/getnoticelist`, params);
  }
}
