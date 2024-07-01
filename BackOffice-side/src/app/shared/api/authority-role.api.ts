import { Injectable } from '@angular/core';
import { filter, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { map } from 'rxjs/operators';
import { RoleListParams, UpdateRoleParams, CreateUserRoleParams, UpdateUserRoleParams } from '../interfaces/role';

/**
 * 权限 - 群组管理API
 */
@Injectable({
  providedIn: 'root',
})
export class AuthorityRoleApi extends BaseApi {
  private _url = `${environment.apiUrl}/admin/role`;

  /**
   * 获取角色列表
   * @param params
   */
  getList(params: RoleListParams): Observable<any> {
    return this.get<any>(`${this._url}/getrole`, params).pipe(
      filter((e) => e.list),
      map((e) => {
        e.list = e.list.map((j) => ({ ...j, state: j.state === 'Enabled' }));

        return e;
      })
    );
  }

  /**
   * 更新角色
   * @param params
   */
  updateRole(params: UpdateRoleParams): Observable<any> {
    const state = params.state ? 'Enabled' : 'Disabled';
    return this.put<any>(`${this._url}/updaterole`, { ...params, state });
  }

  /**
   * 获取权限列表
   */
  getRole(): Observable<any> {
    return this.get<any>(`${this._url}/getuserrolebyuser`, {
      userId: this.localStorageService.userInfo.id,
    });
  }

  /**
   * 根据角色id获取权限列表
   */
  getRoleById(roleId: number): Observable<any> {
    return this.get<any>(`${this._url}/getuserrolebyrole`, { roleId });
  }

  /**
   * 新增用户角色
   */
  createuserrole(params: Array<CreateUserRoleParams>): Observable<any> {
    return this.post<any>(`${this._url}/createuserrole`, params);
  }

  /**
   * 更新用户的角色
   */
  updateuserrole(params: UpdateUserRoleParams): Observable<boolean> {
    return this.post<any>(`${this._url}/updateuserrole`, params);
  }

  /**
   * 获得角色选单
   */
  getRoleSelect(params: any): Observable<boolean> {
    return this.get<any>(`${this._url}/getroleselect`, params);
  }

  /**
   * 分页取得操作角色日志清单
   */
  getPageRoleLog(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getpageoperationalrolelogbyrole`, params);
  }

  /**
   * 分页取得角色用户清单
   */
  getPageUserRole(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getpageuserrolebyrole`, params);
  }
}
