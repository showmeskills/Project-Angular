import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class MessagestationApi extends BaseApi {
  private _url = `${environment.apiUrl}/sitemail/usernotice`;

  /**
   * 获取通知类型
   */
  getNoticeTypeList(): Observable<any> {
    return this.get<any>(`${this._url}/getnoticetypelist`);
  }

  /**
   * 获取通知状态
   */
  getNoticeStatusList(): Observable<any> {
    return this.get<any>(`${this._url}/getnoticestatuslist`);
  }

  /**
   * 查询通知列表
   */
  getQueryNotice(params: any): Observable<any> {
    return this.get<any>(`${this._url}/querynotice`, params);
  }

  /**
   * 查询通知详情
   */
  getNotice(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getnotice`, params);
  }

  /**
   * 查询会员列表
   */
  getFinduserList(params: any): Observable<any> {
    return this.post<any>(`${this._url}/finduserlist`, params);
  }

  /**
   * 撤回通知
   */
  cancelNotice(params: any): Observable<any> {
    return this.post<any>(`${this._url}/cancelnotice`, params);
  }

  /**
   * 更新通知内容
   */
  updaTenotice(params: any): Observable<any> {
    return this.post<any>(`${this._url}/updatenotice`, params);
  }

  /**
   * 新增通知
   */
  createNotice(params: any): Observable<any> {
    return this.post<any>(`${this._url}/createnotice`, params);
  }

  /**
   * 查询模板列表
   */
  getQueryTemplate(params: any): Observable<any> {
    return this.get<any>(`${this._url}/querytemplate`, params);
  }

  /**
   * 查询模板详情
   */
  getTemplate(params: any): Observable<any> {
    return this.get<any>(`${this._url}/gettemplate`, params);
  }

  /**
   * 更新模板内容
   */
  updaTetemplateContent(params: any): Observable<any> {
    return this.post<any>(`${this._url}/updatetemplatecontent`, params);
  }
}
