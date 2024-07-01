import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { DeleteParams, QueryNoticeParams } from '../interfaces/notification-center.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class NotificationCenterApi extends BaseApi {
  //获取各通知类型未读数量
  getNoticeCount(): Observable<any> {
    const url = `${environment.apiUrl}/v1/sitemail/usernotice/getnoticecount`;
    return this.get(url).pipe(map((x: any) => x?.data));
  }
  // 获取最新n条未读通知
  getNoticeList(params: any): Observable<any> {
    const url = `${environment.apiUrl}/v1/sitemail/usernotice/getnoticelist`;
    return this.get(url, params);
  }
  //查询通知
  getQueryNotice(params?: QueryNoticeParams): Observable<any> {
    const url = `${environment.apiUrl}/v1/sitemail/usernotice/querynotice`;
    return this.get(url, params);
  }
  //删除通知
  deleteNotice(params: DeleteParams): Observable<any> {
    const url = `${environment.apiUrl}/v1/sitemail/usernotice/deletenotice`;
    return this.post(url, params);
  }
  //标记已读
  readNotice(params: DeleteParams): Observable<any> {
    const url = `${environment.apiUrl}/v1/sitemail/usernotice/readnotice`;
    return this.post(url, params);
  }

  /**
   *  删除所有通知
   *
   * @param params
   * @param params.noticeType
   * @params noticeType 是当前通知类型，不传是删除全部
   * @returns boolean or null
   */
  onDeleteAll(params: { noticeType: string }): Observable<boolean | null> {
    const url = `${environment.apiUrl}/v1/sitemail/usernotice/deleteall`;
    return this.post(url, params).pipe(map((x: any) => x?.data || null));
  }
  /**
   *  设置所有通知 已读
   *
   * @param params
   * @param params.noticeType
   *  @params noticeType 是当前通知类型，不传是已读全部全部
   * @returns boolean or null
   */
  onReadAll(params: { noticeType: string }): Observable<boolean | null> {
    const url = `${environment.apiUrl}/v1/sitemail/usernotice/readall`;
    return this.post(url, params).pipe(map((x: any) => x?.data || null));
  }
}
