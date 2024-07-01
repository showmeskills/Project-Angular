import { Injectable } from '@angular/core';
import { BaseApi } from './base.api';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { ResourceListParams, ResourceRegionItem } from 'src/app/shared/interfaces/resource';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ResourceApi extends BaseApi {
  private _url = `${environment.apiUrl}/admin/resource`;

  /**
   * 获取资源列表
   * @param params 参数
   * @returns 示例数据
   */
  getresource(params: ResourceListParams): Observable<any> {
    return this.get<any>(`${this._url}/getresource`, params);
  }

  /**
   * 资源下拉选单
   */
  getResourceSelect(): Observable<any> {
    return this.get<any>(`${this._url}/getresourceselect`);
  }

  /**
   * 新增用户资源
   */
  getCreateUserResource(params: any): Observable<any> {
    return this.post<any>(`${this._url}/createuserresource`, params);
  }

  /**
   * 获取地区列表（大洲）
   */
  regionList(): Observable<ResourceRegionItem[]> {
    return this.get<any>(`${this._url}/getcontinentalityselect`).pipe(
      catchError(() => of([])),
      map((e) => (Array.isArray(e) ? e : []))
    );
  }
}
