import { Injectable } from '@angular/core';
import { BaseApi } from './base.api';
import { environment } from 'src/environments/environment';
import { Page } from '../interfaces/page';
import { Observable } from 'rxjs';
import { UpdatePasswordParams, UserInfoDetail, UserInfoUpdateParams } from 'src/app/shared/interfaces/user';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserApi extends BaseApi {
  private _url = `${environment.apiUrl}/admin/user`;

  /**
   * 获取用户
   * @param params 参数
   * @returns 示例数据
   */
  getUser(params: Page): Observable<any> {
    return this.get<any>(`${this._url}/getUser`, params);
  }

  /**
   * 创建用户
   * @param params 参数
   * @returns 示例数据
   */
  getCreateUser(params: UserInfoUpdateParams): Observable<any> {
    return this.post<any>(`${this._url}/createuser`, params);
  }

  /**
   * 修改用户
   */
  updateuser(params: UserInfoUpdateParams): Observable<any> {
    return this.put<any>(`${this._url}/updateuser`, params);
  }

  /**
   * 修改密码
   */
  updatePassword(params: UpdatePasswordParams): Observable<any> {
    return this.put<any>(`${this._url}/updatepassword`, {
      id: this.localStorageService.userInfo.id,
      ...params,
    });
  }

  /**
   * 获取用户信息（账号权限使用） TODO 后期问下Derrick 是否可使用 auth/getuserinfo 的接口 可行直接使用localstorage的数据
   */
  getUserInfo(params: { userId: number | string }): Observable<UserInfoDetail | null> {
    return this.get<any>(`${this._url}/getuserinfo`, params).pipe(map((res) => (res.id ? res : null)));
  }

  /**
   * 系统账号 - 编辑 - 修改用户信息
   */
  updateUser(params: any): Observable<any> {
    return this.put<any>(`${this._url}/updateuser`, params);
  }

  /**
   * 获取用户下拉列表
   * @param params 参数
   * @returns 示例数据
   */
  getUserSelected(params: Page): Observable<any> {
    return this.get<any>(`${this._url}/getuserselected`, params);
  }

  /**
   * 获取 开启群组状态的用户
   * @param params 参数
   * @returns 示例数据
   */
  getGroupUser(params: Page): Observable<any> {
    return this.get<any>(`${this._url}/getuserselected`, params);
  }

  /**
   * 重置密码接口
   * @param params 参数
   * @returns 示例数据
   */
  resetPassword(params: any): Observable<any> {
    return this.post<any>(`${this._url}/resetpassword`, params);
  }

  /**
   * 重置密码后新密码更新接口
   * @param params 参数
   * @returns 示例数据
   */
  updateResetPassword(params: any): Observable<any> {
    return this.post<any>(`${this._url}/updateresetpassword`, params);
  }
}
