import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { RoleCreateParams } from '../interfaces/role';

@Injectable({
  providedIn: 'root',
})
export class PermissionApi extends BaseApi {
  private _url = `${environment.apiUrl}/admin/permission`;

  /**
   * 根据角色id获取角色权限
   * @param roleId
   */
  getRole(roleId: number): Observable<any> {
    return this.get<any>(`${this._url}/getrolepermission`, { roleId });
  }

  /**
   * 创建角色权限
   */
  createRole(params: RoleCreateParams): Observable<any> {
    const state = params.state ? 'Enabled' : 'Disabled';

    return this.post<any>(`${this._url}/createrolepermission`, {
      ...params,
      state,
    });
  }

  /**
   * 更新角色权限
   */
  updateRole(params: RoleCreateParams): Observable<any> {
    const state = params.state ? 'Enabled' : 'Disabled';

    return this.post<any>(`${this._url}/updaterolepermission`, {
      ...params,
      state,
    });
  }
}
