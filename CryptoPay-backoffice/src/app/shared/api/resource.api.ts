import { Injectable } from '@angular/core';
import { BaseApi } from './base.api';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ResourceListParams } from '../interfaces/resource.interface';

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
}
