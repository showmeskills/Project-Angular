import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpEventType,
  HttpHeaders,
  HttpParams,
  HttpResponseBase,
} from '@angular/common/http';
import { AppService } from 'src/app/app.service';
import { Observable, of, switchMap, timer } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from '../service/localstorage.service';
import { cloneDeep, compact, isArray, isEmpty, isPlainObject, transform } from 'lodash';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { Auth403 } from 'src/app/shared/api/auth403';
import { PayService } from 'src/app/pages/proxy/approval/approval-apply/pay.service';
import { SentryService } from 'src/app/shared/service/sentry.service';

let _RefreshTokenPromise: any; //刷新token Promise

@Injectable({
  providedIn: 'root',
})
export class BaseApi {
  protected http = inject(HttpClient);
  protected appService = inject(AppService);
  protected localStorageService = inject(LocalStorageService);
  protected langService = inject(LangService);
  protected payService = inject(PayService);
  protected auth403 = inject(Auth403);
  protected sentryService = inject(SentryService);

  /**
   * 过滤数据
   * @param params
   * @protected
   */
  protected filterParams(params: any) {
    // 过滤undefined值
    if (isPlainObject(params)) {
      // 纯对象进行过滤 有File对象传递情况
      const cleanArray = (o) => (isArray(o) ? compact(o) : o);
      const clean = (obj) =>
        transform(obj, (r: any, v, k) => {
          const isObject = isPlainObject(v);
          const val = isObject ? cleanArray(clean(v)) : v;
          const keep = isObject ? !isEmpty(val) : val !== undefined;

          if (keep) r[k] = val;
        });

      return clean(cloneDeep(params));
    }

    return params;
  }

  protected get httpOptions() {
    return {
      headers: this.getHeaders(),
    };
  }

  protected getHeaders(headers?: object) {
    return new HttpHeaders({
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: `Bearer ${this.localStorageService.token}`,
      lang: this.langService.currentLang?.toLowerCase() || 'zh-cn',
      ...headers,
    });
  }

  private _propOptions: any = {};
  protected setOptions(options: any) {
    this._propOptions = options;
  }

  /**
   * 获取参数
   */
  getConfig(config) {
    return { ...this.httpOptions, ...this._propOptions, ...config };
  }

  /**
   * get请求
   * @param url
   * @param params
   * @param config
   * @param customHandleError 自定义错误处理，默认返回 null
   * @returns Observable<T>
   */
  get<T>(
    url: string,
    params?:
      | HttpParams
      | {
          [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> | any;
        },
    config?: any,
    customHandleError: (
      error: any,
      apiUrl: string,
      params: any,
      method: 'GET' | 'POST',
      config?: any
    ) => Observable<any> = this.handleError
  ): Observable<T> {
    if (!environment.production) {
      console.groupCollapsed(
        `%cGET%c ${url}`,
        'color: #ffffff; background-color:#61affe;padding: 2px 4px;border-top-left-radius: 10px;border-bottom-left-radius: 10px;',
        ''
      );
      if (params) {
        console.log('%cParams', 'color: #ffffff; background-color:#333;padding: 2px 4px', params);
      }
      console.groupEnd();
    }

    const configOptions = this.getConfig({ ...config, params: this.filterParams(params) });

    return this.http.get<T>(url, configOptions).pipe(
      catchError((error: any) => {
        return customHandleError(error, url, params, 'GET', configOptions);
      }),
      switchMap((res: any) => this.handleResultError(url, res, configOptions))
    );
  }

  /**
   * post请求
   * @param url
   * @param body
   * @param config
   * @param customHandleError 自定义错误处理，默认返回 null
   * @returns Observable<T>
   */
  post<T>(
    url: string,
    body?: any,
    config?: any,
    customHandleError: (
      error: any,
      apiUrl: string,
      body: any,
      method: 'GET' | 'POST',
      config?: any
    ) => Observable<any> = this.handleError
  ): Observable<T> {
    if (!environment.production) {
      console.groupCollapsed(
        `%cPOST%c ${url}`,
        'color: #ffffff; background-color:#49cc90;padding: 2px 4px;border-top-left-radius: 10px;border-bottom-left-radius: 10px;',
        ''
      );
      if (body) {
        console.log('%cParams', 'color: #ffffff; background-color:#333;padding: 2px 4px', body);
      }
      console.groupEnd();
    }

    body = this.filterParams(body);
    const configOptions = this.getConfig(config);

    return this.http.post<T>(url, body, { ...configOptions }).pipe(
      catchError((error: any) => {
        return customHandleError(error, url, body, 'POST', configOptions);
      }),
      switchMap((res: any) => this.handleResultError(url, res, { ...configOptions, body }))
    );
  }

  /**
   * put请求
   * @param url
   * @param body
   * @param config
   * @param customHandleError 自定义错误处理，默认返回 null
   * @returns Observable<T>
   */
  put<T>(
    url: string,
    body?: any,
    config?: any,
    customHandleError: (
      error: any,
      apiUrl: string,
      body: any,
      method: 'GET' | 'POST' | 'PUT',
      config?: any
    ) => Observable<any> = this.handleError
  ): Observable<T> {
    if (!environment.production) {
      console.groupCollapsed(
        `%cPUT%c ${url}`,
        'color: #ffffff; background-color:#cc9e49;padding: 2px 4px;border-top-left-radius: 10px;border-bottom-left-radius: 10px;',
        ''
      );
      if (body) {
        console.log('%cParams', 'color: #ffffff; background-color:#333;padding: 2px 4px', body);
      }
      console.groupEnd();
    }

    body = this.filterParams(body);
    const configOptions = this.getConfig(config);

    return this.http.put<T>(url, body, { ...configOptions }).pipe(
      catchError((error: any) => {
        return customHandleError(error, url, body, 'PUT', configOptions);
      }),
      switchMap((res: any) => this.handleResultError(url, res, { ...configOptions, body }))
    );
  }

  /**
   * put请求 - query参数
   * @param url
   * @param params
   * @param config
   * @returns Observable<T>
   */
  putQuery<T>(url: string, params?: any, config?: any): Observable<T> {
    if (!environment.production) {
      console.groupCollapsed(
        `%cPUT%c ${url}`,
        'color: #ffffff; background-color:#49cc90;padding: 2px 4px;border-top-left-radius: 10px;border-bottom-left-radius: 10px;',
        ''
      );
      if (params) {
        console.log('%cParams', 'color: #ffffff; background-color:#333;padding: 2px 4px', params);
      }
      console.groupEnd();
    }

    params = this.filterParams(params);
    const configOptions = this.getConfig(config);

    return this.put<T>(url, null, { params, ...configOptions });
  }

  /**
   * delete请求
   * @param url
   * @param body
   * @param config
   * @param customHandleError 自定义错误处理，默认返回 null
   * @returns Observable<T>
   */
  delete<T>(
    url: string,
    body?:
      | HttpParams
      | {
          [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> | any;
        },
    config?: any,
    customHandleError: (
      error: any,
      apiUrl: string,
      body: any,
      method: 'GET' | 'POST' | 'DELETE',
      config?: any
    ) => Observable<any> = this.handleError
  ): Observable<T> {
    if (!environment.production) {
      console.groupCollapsed(
        `%cDELETE%c ${url}`,
        'color: #ffffff; background-color:#61affe;padding: 2px 4px;border-top-left-radius: 10px;border-bottom-left-radius: 10px;',
        ''
      );
      if (body) {
        console.log('%cParams', 'color: #ffffff; background-color:#333;padding: 2px 4px', body);
      }
      console.groupEnd();
    }

    body = this.filterParams(body);
    const configOptions = this.getConfig(config);

    return this.http.delete<T>(url, { ...configOptions, body }).pipe(
      catchError((error: any) => {
        return customHandleError(error, url, body, 'DELETE', configOptions);
      }),
      switchMap((res: any) => this.handleResultError(url, res, { ...configOptions, body }))
    );
  }

  /**
   * put请求 - query参数
   * @param url
   * @param params
   * @param config
   * @returns Observable<T>
   */
  deleteQuery<T>(url: string, params?: any, config?: any): Observable<T> {
    if (!environment.production) {
      console.groupCollapsed(
        `%cDELETE%c ${url}`,
        'color: #ffffff; background-color:#49cc90;padding: 2px 4px;border-top-left-radius: 10px;border-bottom-left-radius: 10px;',
        ''
      );
      if (params) {
        console.log('%cParams', 'color: #ffffff; background-color:#333;padding: 2px 4px', params);
      }
      console.groupEnd();
    }

    params = this.filterParams(params);
    const configOptions = this.getConfig(config);

    return this.delete<T>(url, undefined, { params, ...configOptions });
  }

  /**
   * 请求刷新token并重新请求失败的api
   * @returns
   */
  private async refreshToken() {
    if (_RefreshTokenPromise) return await _RefreshTokenPromise;
    const url = `${environment.apiUrl}/admin/auth/refresh/refresh?token=${this.localStorageService.token}`;
    // eslint-disable-next-line no-async-promise-executor
    _RefreshTokenPromise = new Promise(async (resolve) => {
      const result: any = await this.get(url, undefined, (/*_error, _apiUrl, _body, _method*/) => {
        this.localStorageService.token = null;
        this.appService.jumpToLogin();
        return of(null);
      }).toPromise();
      _RefreshTokenPromise = null;
      if (result) {
        this.localStorageService.token = result.token;
        resolve(true);
        return;
      }
      this.localStorageService.token = null;
      this.appService.jumpToLogin();
      resolve(false);
    });
    return await _RefreshTokenPromise;
  }

  /**
   * token过期重新请求
   * @param apiUrl
   * @param body
   * @param method
   * @returns
   */
  private async reRequest(apiUrl: string, body: any, method: 'GET' | 'POST' | string) {
    const isRefresh: boolean = await this.refreshToken();
    if (isRefresh) {
      await timer(3000).toPromise();
      if (method === 'GET') {
        return await this.http.get(apiUrl, body).toPromise();
      } else if (method === 'POST') {
        return await this.http.post(apiUrl, body).toPromise();
      }
      return await this.http.put(apiUrl, body).toPromise();
    }
    return of(null);
  }

  /**
   * 内容处理
   * @returns
   * @param url
   * @param res
   * @param config
   */
  private handleResultError(url: string, res: any | HttpErrorResponse, config: any): Observable<any> {
    // 可能处于reportProgress状态下，直接抛出去给框架底层处理，转到上面catchError
    if (res instanceof HttpResponseBase) {
      if (res.type !== undefined && res.type === HttpEventType.ResponseHeader) {
        return of(res);
      }
    }

    if (
      res?.status === 400 ||
      res?.status === 404 ||
      res?.status === 500 ||
      res?.success === false // 代理、红利的服务
    ) {
      this.appService.isContentLoadingSubject.next(false);

      this.langService
        .get('common.fail')
        .pipe(take(1))
        .subscribe(async (fail) => {
          // 尝试处理二进制类型请求返回的错误信息
          if (res.error instanceof Blob) {
            let error = await res.error.text();
            try {
              res.error = JSON.parse(error);
            } catch (error) {
              console.error(`【handleResultError 二进制类型请求】` + error);
            }
          }

          // PS: 由于后端返回错误信息各种格式，这里做了一下兼容
          const msg =
            (res.errors && JSON.stringify(res?.errors)) ||
            (res.error?.errors && JSON.stringify(res.error?.errors)) ||
            res.error?.detail ||
            res.error?.title ||
            res?.Message || // 闪兑预览接口会出现且无法返回标准错误信息 Orange 2022-10-20
            res?.message || // 代理、红利的错误信息
            res?.detail ||
            res?.error ||
            res?.title ||
            fail;

          if (!config?.['skipToast']) {
            this.appService.showToastSubject.next({ msg });
          }

          console.error(`【handleResultError】` + msg);
          // 其他错误记录到日志中
          this.sentryService.error(
            '[BaseApi.ts:ResultError]' + url,
            {
              params: config?.params || {},
              body: config?.body || {},
              response: res,
              url: url || '',
            },
            {
              username: this.localStorageService.userInfo?.userName,
              id: this.localStorageService.userInfo?.id,
            }
          );
        });

      if (!config?.['skipThrowError']) throw res; // 抛出错误不要往下执行
    }

    return of(res);
  }

  /**
   * 错误处理
   * @param error
   * @param url
   * @param body
   * @param method
   * @param config
   * @returns
   */
  private handleError = (
    error: HttpErrorResponse,
    url: string,
    body: any,
    method: 'GET' | 'POST' | string,
    config: any
  ): Observable<any> => {
    this.appService.isContentLoadingSubject.next(false);

    if (error.status === 401) {
      // TODO 这里应该要重新刷新Token
      //TODO: 登录过期弹出框
      // let res: any = Promise.resolve(null);
      // try {
      //   res = this.reRequest(apiUrl, body, method);
      // } catch (err) {}
      //
      // (async () => {
      //   let result = await res;
      //
      //   if (result.error && result.error.code === '401' && result.error.message === 'Status401Unauthorized') {
      //     this.appService.jumpToLogin(); // 重试还是401 直接跳转到登录页
      //   }
      // })()

      // token失效后，记录要去往的路由path；（功能关联登录重定向）
      const redirectPath = location.pathname + location.search + location.hash;
      if (!this.appService.publicPath.some((e) => redirectPath.replace(/^\/.*?(?=\/)/, '').startsWith(e))) {
        this.localStorageService.redirectPath = redirectPath;
      }

      this.appService.jumpToLogin(); // 重试还是401 直接跳转到登录页
    }

    if (error.status === 403) {
      // if (!error.url?.includes('/api/v1/resource/upload/getuploadhost')) {
      //   this.appService.showToastSubject.next({ msg: '权限不足', only: true });
      // }
      this.auth403.push(error);
    }

    if ([400, 404].includes(error.status)) {
      return of(error); // 往下流出 通过handleResultError控制弹出提示
    }

    if (error.status === 500) {
      this.appService.showToastSubject.next({ msg: error.error?.message || 'Service Error！' });
      throw error; // 抛出错误不要往下执行
    }

    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
      // errMsg = error.error.message;
    } else {
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
      // errMsg = error.error.message;
    }

    if (!config?.['skipThrowError']) {
      this.appService.isContentLoadingSubject.next(false);
      throw error; // 抛出错误不要往下执行，会有全局错误处理进行发送
    } else {
      // 除了以下状态记录到日志中
      if (![401, 403].includes(error.status)) {
        this.sentryService.error(
          '[BaseApi.ts:Global]' + url,
          {
            body: body || {},
            error: error || {},
            url: url || '',
          },
          {
            username: this.localStorageService.userInfo?.userName,
            id: this.localStorageService.userInfo?.id,
          }
        );
      }
    }

    return of(null);
  };
}
