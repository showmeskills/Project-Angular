import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class FooterApi extends BaseApi {
  private _url = `${environment.apiUrl}/resource/footer`;

  /**
   * 获取列表
   */
  getFooterList(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getfooterlist`, params);
  }

  /**
   * 添加或编辑footer
   */
  updateFooter(params: any): Observable<any> {
    return this.post<any>(`${this._url}/addorupdatefooter`, params);
  }

  /**
   * 页尾类型下拉
   */
  getFooterTypeList(): Observable<any> {
    return this.get<any>(`${this._url}/footertypelist`);
  }

  /**
   * 页尾排序
   */
  updateSort(TenantId, SortIds): Observable<any> {
    return this.get<any>(`${this._url}/updatesort`, { TenantId, SortIds });
  }

  /**
   * 页尾删除
   */
  deleteFooter(tenantId, footerId): Observable<any> {
    return this.post<any>(`${this._url}/deletefooter`, { tenantId, footerId });
  }

  /**
   * 获取Footer详情
   */
  getFooterDetail(footerId, lang): Observable<any> {
    return this.get<any>(`${this._url}/getfooterdetail`, { footerId, lang });
  }

  /**
   * 获取牌照详情
   */
  getLicense(licenseId): Observable<any> {
    return this.get<any>(`${this._url}/getlicensedetail`, { licenseId });
  }
}
