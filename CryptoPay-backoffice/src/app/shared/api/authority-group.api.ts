import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { CreateGroupParams, UpdateGroupParams, CreateUserGroupParams } from '../interfaces/group';

/**
 * 权限 - 群组管理API
 */
@Injectable({
  providedIn: 'root',
})
export class AuthorityGroupApi extends BaseApi {
  private _url = `${environment.apiUrl}/admin/group`;

  /**
   * 获取群组列表
   * @returns
   */
  getList(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getgroup`, params);
  }

  /**
   * 查询群组
   * @param groupName 群组名称
   */
  queryGroup(groupName: string): Observable<any> {
    return this.get<any>(`${this._url}/querygroup`, { groupName });
  }

  /**
   * 新建群组
   * @param params
   * @returns
   */
  creatgroup(params: CreateGroupParams): Observable<any> {
    return this.post<any>(`${this._url}/creatgroup`, params);
  }

  /**
   * 返回群组基本资讯以及群组成员
   */
  getbygroup(id: number): Observable<any> {
    return this.get<any>(`${this._url}/getbygroup?groupId=${id}`);
  }

  /**
   * 查询群组成员
   */
  getbyuser(id: string): Observable<any> {
    return this.post<any>(`${this._url}/getbyuser?userId=${id}`);
  }

  /**
   * 更新群组
   */
  updategroup(params: UpdateGroupParams): Promise<any> {
    return this.put<any>(`${this._url}/updategroup`, params).toPromise();
  }

  /**
   * 新增用户群组
   */
  createusergroup(params: Array<CreateUserGroupParams>): Observable<any> {
    return this.post<any>(`${this._url}/createusergroup`, params);
  }

  /**
   * 删除用户群组
   */
  deleteUserGroup(params: Array<number>): Observable<any> {
    return this.delete<any>(`${this._url}/deleteusergroup`, params);
  }
}
