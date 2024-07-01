import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { BannerDetail, BannerDetailParams, BannerItem } from 'src/app/shared/interfaces/banner';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BannerApi extends BaseApi {
  private _url = `${environment.apiUrl}/admin/banner`;

  /**
   * 获取banner列表
   */
  getBannersList(params: { tenantId: number; bannerClientType: string /* Web/App */ }): Observable<BannerItem[]> {
    return this.get<any>(`${this._url}/getbannerslist`, params).pipe(
      map((res) => (Array.isArray(res) ? res : [])),
      catchError(() => of([]))
    );
  }

  /**
   * 添加或编辑
   */
  postAddorUpdateBanner(params: BannerDetailParams): Observable<boolean | unknown> {
    return this.post<any>(`${this._url}/addorupdatebanner`, params);
  }

  /**
   * 获取banner详情
   */
  getInfocs(params: { bannerId: number }): Observable<BannerDetail> {
    return this.get<any>(`${this._url}/infocs`, params);
  }

  /**
   * 获取所有banner页类型
   */
  getallpagetypes(tenantId: any): Observable<any> {
    return this.get<any>(`${this._url}/getallpagetypes`, { tenantId });
  }

  /**
   *  获取所有客户端类型
   */
  getallclienttypes(tenantId: any): Observable<any> {
    return this.get<any>(`${this._url}/getallclienttypes`, { tenantId });
  }

  /**
   *  banner 排序
   */
  getUpdateSort(params: any): Observable<any> {
    return this.get<any>(`${this._url}/updatesort`, params);
  }

  /**
   *  banner 删除
   */
  postDeleteBanner(params: any): Observable<any> {
    return this.post<any>(`${this._url}/deletebanner`, params);
  }
}
