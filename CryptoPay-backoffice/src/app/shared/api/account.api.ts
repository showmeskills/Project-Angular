import { Injectable } from '@angular/core';
import { combineLatestWith, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { Login, LoginResult } from 'src/app/shared/interfaces/login';
import { catchError, map, tap } from 'rxjs/operators';
import { UserInfo } from 'src/app/shared/interfaces/common.interface';

@Injectable({
  providedIn: 'root',
})
export class AccountApi extends BaseApi {
  private _url = `${environment.apiUrl}/admin/auth`;

  /**
   * 获取接口版本号
   */
  getApiVersion(): Observable<any> {
    let host = '';

    if (environment.apiUrl?.includes('/api/v1')) {
      host = environment.apiUrl.replace('/api/v1', '');
    } else {
      let url = environment.apiUrl;
      if (environment.apiUrl?.startsWith('//')) {
        url = window.location.protocol + environment.apiUrl;
      }

      host = new URL(url).origin;
    }

    return this.get<any>(`${host}/version`);
  }

  /**
   * 登录
   * @param params 参数
   * @param conf
   * @returns 示例数据
   */
  login(params: Login, conf?: any): Observable<LoginResult> {
    return this.post<any>(`${this._url}/login`, params, conf);
  }

  /**
   * 获取当前登录密码加密的密钥
   * @returns 示例数据
   */
  getpasswordencryptkey(): Observable<{ encyptKey: string; key: string }> {
    return this.get<any>(`${this._url}/getpasswordencryptkey`);
  }

  /**
   * 获取当前登录的用户信息
   * @returns UserInfo
   */
  getUserInfo(): Observable<UserInfo> {
    return this.get<UserInfo>(`${this._url}/getUserInfo`).pipe(
      tap((info) => {
        this.sentryService.setUser(info);
      }),
      combineLatestWith(
        this.get<any>(`${environment.apiUrl}/system/getuploadhost`).pipe(catchError(() => of(undefined))), // 获取静态资源host
        this.get<any>(`${environment.apiUrl}/admin/menu/getloginusermenu`).pipe(
          // 获取当前账号导航
          tap((menu) => (this.localStorageService.menu = menu))
        )
      ),
      map(([info, host]) => ({ ...info, resourceHost: host?.list || [] }))
    );
  }

  /**
   * 退出登陆
   * @returns 示例数据
   */
  logOut(): Observable<any> {
    return this.get<any>(`${this._url}/logout/logout`).pipe(tap(() => this.sentryService.setUser()));
  }
}
