import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class AllianceApi extends BaseApi {
  private _url = `${environment.apiUrl}/alliance`;

  /**
   * 常规返佣 模式配置
   */
  gettenantactivitysettings(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/referraladmindashboard_gettenantactivitysettings`, parmas);
  }

  /**
   * 奖励发放 - 常规返佣
   */
  getdailytotalcommissionrewardslist(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/referraladmindashboard_getdailytotalcommissionrewardslist`, parmas);
  }

  /**
   * 奖励发放 - 常规返佣 - 详情
   */
  getdailycommissionrewardslist(parmas: any = {}): Observable<any> {
    return this.get<any>(`${this._url}/getdailycommissionrewardslist`, parmas);
  }

  /**
   * 奖励发放 - CAP奖励
   */
  getdailytotalreferralrewardslist(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/referraladmindashboard_getdailytotalreferralrewardslist`, parmas);
  }

  /**
   * 奖励发放 - CAP奖励 - 详情
   */
  getdailyreferralrewardslist(parmas: any = {}): Observable<any> {
    return this.get<any>(`${this._url}/getdailyreferralrewardslist`, parmas);
  }

  /**
   * 推荐好友红利设定 - CPA奖励设定 - 获取
   */
  getviplevelsettings(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/referraladmindashboard_getviplevelsettings`, parmas);
  }

  /**
   * 推荐好友红利设定 - CPA奖励设定 - 修改
   */
  updateviplevelsettings(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/referraladmindashboard_updateviplevelsettings`, parmas);
  }

  /**
   * 推荐好友红利设定 - CPA奖励设定 - 新增
   */
  addviplevelsettings(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/referraladmindashboard_addviplevelsettings`, parmas);
  }

  /**
   * 分享图配置（商户5）- 语言获取
   */
  config_language_query(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/config_language_query`, parmas);
  }

  /**
   * 分享图配置（商户5）- 语言保存
   */
  config_language_save(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/config_language_save`, parmas);
  }

  /**
   * 分享图配置（商户5）- 保存
   */
  config_share_save(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/config_share_save`, parmas);
  }

  /**
   * 分享图配置（商户5）- 上传地址获取
   */
  config_share_query(params: any): Observable<any> {
    return this.post<any>(`${this._url}/config_share_query`, params);
  }

  /**
   * 分享图配置（商户5）- 批量获取
   */
  config_share_batchimagequery(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/config_share_batchimagequery`, parmas);
  }

  /**
   * 分享图配置（商户5）- 删除
   */
  config_share_batchimagedelete(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/config_share_batchimagedelete`, parmas);
  }

  /**
   * 推荐好友- 最新注册 （商户5）
   */
  getregisterpage(parmas: any = {}): Observable<any> {
    return this.get<any>(`${this._url}/getlastregisterlist`, parmas);
  }

  /**
   * 推荐好友- 最新首存 （商户5）
   */
  getftdlistpage(parmas: any = {}): Observable<any> {
    return this.get<any>(`${this._url}/getlastfirstdepositlist`, parmas);
  }
}
