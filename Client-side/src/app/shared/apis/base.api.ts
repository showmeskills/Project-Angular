/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FingerprintjsProAngularService } from '@fingerprintjs/fingerprintjs-pro-angular';
import { Observable, Subject, firstValueFrom, of, timer } from 'rxjs';
import { catchError, map, tap, timeout } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { AvatarDefaultPipe } from 'src/app/shared/pipes/avatar-default.pipe';
import { ToastService } from 'src/app/shared/service/toast.service';
import { environment } from 'src/environments/environment';
import { DataCollectionService } from '../service/data-collection.service';
import { GeneralService } from '../service/general.service';
import { LocaleService } from '../service/locale.service';
import { LocalStorageService } from '../service/localstorage.service';
import { SentryService } from '../service/sentry.service';

let _RefreshTokenPromise: Promise<boolean> | null; //刷新token Promise

@Injectable({
  providedIn: 'root',
})
export class BaseApi {
  constructor(
    protected http: HttpClient,
    protected appService: AppService,
    protected localStorageService: LocalStorageService,
    protected toast: ToastService,
    protected localeService: LocaleService,
    protected generalService: GeneralService,
    protected dataCollectionService: DataCollectionService,
    protected avatartDefault: AvatarDefaultPipe,
    protected sentryService: SentryService,
    protected fpService: FingerprintjsProAngularService,
  ) {}

  protected get hashedString() {
    //@ts-ignore 使用MD5哈希函数进行哈希
    return md5 ? md5(`${Date.now()}${this.localStorageService.token}`).substring(0, 16) : '';
  }

  protected get httpOptions() {
    return {
      headers: new HttpHeaders({
        'Cache-Control': 'no-store,no-cache',
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Bearer ${this.localStorageService.token}`,
        lang: this.appService.languageCode,
        'ngsw-bypass': 'true',
        'APM-Request-ID': this.hashedString,
        'Fp-Visitor-Id': this.localStorageService.visitorIdPro || '',
      }),
    };
  }

  /**
   * get请求
   *
   * @param url
   * @param params
   * @param time 自定义超时时间（毫秒）
   * @param customHandleError 自定义错误处理，默认返回 null
   * @param saveToCaches
   * @returns Observable<T>
   */
  protected get<T>(
    url: string,
    params?: { [key: string]: any },
    time?: number,
    customHandleError: (error: any, apiUrl: string, params: any, method: 'GET' | 'POST') => Observable<any> = this
      .handleError,
    saveToCaches: boolean = false,
  ): Observable<T> {
    if (!environment.isOnline) {
      console.groupCollapsed(`%cGET%c ${url}`, 'color: #ffffff; background-color:#61affe;padding: 2px 4px', '');
      if (params) {
        console.log('%cParams', 'color: #ffffff; background-color:#333;padding: 2px 4px', params);
      }
      console.groupEnd();
    }
    let cachesKey = url;
    if (params) {
      for (const key in params) {
        if (!params[key] && params[key] !== false && params[key] !== 0) {
          delete params[key];
        } else {
          if (saveToCaches) cachesKey += `&${key}=${String(params[key])}`;
        }
      }
    }
    return this.http.get<T>(url, { ...this.httpOptions, params: params, observe: 'response' }).pipe(
      timeout(time || 20000),
      map(response => this.replaceResourceUrl(response)),
      map(x => {
        if (x) {
          this.appService.networkTips$.next(false);
          const message = (x as any).message;
          if (message !== null && typeof message === 'string') {
            return {
              ...x,
              message: this.localeService.brandNameReplace(message),
            };
          }
        }
        return x;
      }),
      tap(x => {
        if (saveToCaches && x) this.setCachesData(cachesKey, x);
      }),
      catchError((error: any) => {
        return customHandleError(error, url, params, 'GET');
      }),
    );
  }

  /**
   * post请求
   *
   * @param url
   * @param body
   * @param time 自定义超时时间（毫秒）
   * @param customHandleError 自定义错误处理，默认返回 null
   * @param saveToCaches
   * @returns Observable<T>
   */
  protected post<T>(
    url: string,
    body?: { [key: string]: any },
    time?: number,
    customHandleError: (error: any, apiUrl: string, body: any, method: 'GET' | 'POST') => Observable<any> = this
      .handleError,
    saveToCaches: boolean = false,
  ): Observable<T> {
    if (!environment.isOnline) {
      console.groupCollapsed(`%cPOST%c ${url}`, 'color: #ffffff; background-color:#49cc90;padding: 2px 4px', '');
      if (body) {
        console.log('%cParams', 'color: #ffffff; background-color:#333;padding: 2px 4px', body);
      }
      console.groupEnd();
    }
    let cachesKey = url;
    if (body) {
      for (const key in body) {
        if (!body[key] && body[key] !== false && body[key] !== 0) {
          delete body[key];
        } else {
          if (saveToCaches) cachesKey += `&${key}=${String(body[key])}`;
        }
      }
    }
    return this.http.post<T>(url, body, { ...this.httpOptions, observe: 'response' }).pipe(
      timeout(time || 20000),
      map(response => this.replaceResourceUrl(response)),
      map(x => {
        if (x) {
          this.appService.networkTips$.next(false);
          const message = (x as any).message;
          if (message !== null && typeof message === 'string') {
            return {
              ...x,
              message: this.localeService.brandNameReplace(message),
            };
          }
        }
        return x;
      }),
      tap(x => {
        if (saveToCaches && x) this.setCachesData(cachesKey, x);
      }),
      catchError((error: any) => {
        return customHandleError(error, url, body, 'POST');
      }),
    );
  }

  /**
   * post请求 用 caches 缓存
   *
   * @param url
   * @param body
   * @param time 自定义超时时间（毫秒）
   * @param customHandleError 自定义错误处理，默认返回 null
   * @returns Observable<T>
   */
  protected postByCaches<T>(
    url: string,
    body?: { [key: string]: any },
    time?: number,
    customHandleError?: (error: any, apiUrl: string, body: any, method: 'GET' | 'POST') => Observable<any>,
  ): Observable<T> {
    if (this.appService.curCaches) {
      let cachesKey = url;
      if (body) {
        for (const key in body) {
          if (!body[key] && body[key] !== false && body[key] !== 0) continue;
          cachesKey += `&${key}=${String(body[key])}`;
        }
      }
      return new Observable<T>(observer => {
        this.getCachesData<T>(cachesKey)
          .then(cachedData => {
            // 有缓存，返回缓存，并进行新请求用于下一次使用
            observer.next(cachedData);
            observer.complete();
            this.post<T>(url, body, time, customHandleError, true).subscribe();
          })
          .catch(() => {
            // 没有缓存，触发错误
            observer.error();
          });
      }).pipe(
        catchError(() => {
          // 捕捉错误，进行新请求，并进行缓存
          return this.post<T>(url, body, time, customHandleError, true);
        }),
      );
    } else {
      // 不支持缓存，转到正常流程，且不缓存
      return this.post<T>(url, body, time, customHandleError);
    }
  }

  /**
   * get请求 用 caches 缓存
   *
   * @param url
   * @param params
   * @param time 自定义超时时间（毫秒）
   * @param customHandleError 自定义错误处理，默认返回 null
   * @returns Observable<T>
   */
  protected getByCaches<T>(
    url: string,
    params?: { [key: string]: any },
    time?: number,
    customHandleError?: (error: any, apiUrl: string, body: any, method: 'GET' | 'POST') => Observable<any>,
  ): Observable<T> {
    if (this.appService.curCaches) {
      let cachesKey = url;
      if (params) {
        for (const key in params) {
          if (!params[key] && params[key] !== false && params[key] !== 0) continue;
          cachesKey += `&${key}=${String(params[key])}`;
        }
      }
      return new Observable<T>(observer => {
        this.getCachesData<T>(cachesKey)
          .then(cachedData => {
            // 有缓存，返回缓存，并进行新请求用于下一次使用
            observer.next(cachedData);
            observer.complete();
            this.get<T>(url, params, time, customHandleError, true).subscribe();
          })
          .catch(() => {
            // 没有缓存，触发错误
            observer.error();
          });
      }).pipe(
        catchError(() => {
          // 捕捉错误，进行新请求，并进行缓存
          return this.get<T>(url, params, time, customHandleError, true);
        }),
      );
    } else {
      // 不支持缓存，转到正常流程，且不缓存
      return this.get<T>(url, params, time, customHandleError);
    }
  }

  /**
   * 获取缓存
   *
   * @param key
   * @returns Promise
   */
  private getCachesData<T>(key: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (this.appService.curCaches) {
        this.appService.curCaches
          .match(key)
          .then(response => {
            if (!response || !response.ok) {
              reject(null);
            } else {
              const curv = Number(response.headers.get('version') ?? '0');
              const last = Number(this.appService.tenantConfig.config.cacheVersion ?? '0');
              if (last > curv) {
                reject(null);
              } else {
                response
                  .json()
                  .then(data => {
                    resolve(data);
                  })
                  .catch(() => {
                    reject(null);
                  });
              }
            }
          })
          .catch(() => {
            reject(null);
          });
      } else {
        reject(null);
      }
    });
  }

  /**
   * 设置缓存
   *
   * @param key
   * @param response
   * @returns //
   */
  private setCachesData(key: string, response: any) {
    if (this.appService.curCaches) {
      const cacheHeaders = new Headers({
        version: this.appService.tenantConfig.config.cacheVersion ?? 0,
      });
      this.appService.curCaches.put(key, new Response(JSON.stringify(response), { headers: cacheHeaders }));
    }
  }

  /**
   * 刷新token
   */
  private async refreshToken() {
    if (_RefreshTokenPromise) return await _RefreshTokenPromise;
    console.log('刷新token');
    //存储当前访问界面的url
    this.appService.saveUrl();
    const url = `${environment.apiUrl}/v1/api/auth/refresh?token=${this.localStorageService.token}`;
    _RefreshTokenPromise = new Promise(resolve => {
      firstValueFrom(
        this.http.get<any>(url, { headers: { 'ngsw-bypass': 'true' } }).pipe(
          catchError(error => {
            this.sentryService.apiError(url, error);
            return of(null);
          }),
        ),
      )
        .then(result => {
          if (result?.success) {
            this.localStorageService.token = result.data;
            if (this.localStorageService.loginToken) {
              this.localStorageService.loginToken = result.data;
            }
            _RefreshTokenPromise = null;
            resolve(true);
          } else {
            this.localStorageService.token = this.localStorageService.loginToken = null;
            this.appService.reFresh();
          }
        })
        .catch(() => {
          this.localStorageService.token = this.localStorageService.loginToken = null;
          this.appService.reFresh();
        });
    });
    return await _RefreshTokenPromise;
  }

  /**
   * token过期重新请求
   *
   * @param apiUrl
   * @param body
   * @param method
   * @param subject
   * @returns //
   */
  private async reRequest(apiUrl: string, body: any, method: 'GET' | 'POST', subject: Subject<any>) {
    const isRefresh: boolean = await this.refreshToken();
    if (isRefresh) {
      await firstValueFrom(timer(3000));
      if (method === 'GET') {
        subject.next(await firstValueFrom(this.get(apiUrl, body)));
        subject.complete();
        return;
      }
      subject.next(await firstValueFrom(this.post(apiUrl, body)));
      subject.complete();
      return;
    }
    subject.next(null);
    subject.complete();
  }

  /**
   * 错误处理
   *
   * @param error
   * @param apiUrl
   * @param body
   * @param method
   * @returns //
   */
  protected handleError = (error: any, apiUrl: string, body: any, method: 'GET' | 'POST'): Observable<any> => {
    // 错误的http状态码
    const status = error?.status;
    // 错误的返回内容，status 存在的时候基本必定会有
    const response = error?.error;
    switch (status) {
      case 401: {
        // token过期或失效
        const subject = new Subject();
        this.reRequest(apiUrl, body, method, subject);
        return subject;
      }
      case 403:
        // 非法请求、被禁用之类
        this.localStorageService.token = this.localStorageService.loginToken = null;
        this.appService.jumpToLogin(false, true);
        return of(null);
      case 400:
        //账号在别的地方登录，被踢 清除token
        if (response.code === '1001') this.appService.showRepeatLoginTip();
        return of(response);
      default: {
        // 剩余包含超时、500、和其它未知情况，弹出提示，并记录到日志中心
        const codeInfo = this.sentryService.apiError(apiUrl, error, body);
        this.toast.show({
          title: this.localeService.getValue('failed') + ' ' + (codeInfo?.code ?? ''),
          message: this.localeService.getValue('network_err'),
          type: 'fail',
        });
        return of(null);
      }
    }
  };

  /**
   * put请求
   *
   * @param url
   * @param body
   * @param options
   * @param time 自定义超时时间（毫秒）
   * @returns Observable<T>
   */
  protected put<T>(url: string, body: any, options: any, time?: number) {
    return this.http.put<T>(url, body, options).pipe(
      timeout(time || 20000),
      map(() => true),
      catchError(error => {
        this.sentryService.apiError(url, error, body, true);
        return of(null);
      }),
    );
  }

  /**
   * 将返回的内容中的图片链接替换成欧洲版的图片链接
   *
   * @param response Api Response
   * @returns any
   */
  private replaceResourceUrl(response: any) {
    const body = response.body;
    let newBody: any = body;
    if (environment.isEur && body) {
      newBody = JSON.parse(
        JSON.stringify(body).replace(
          new RegExp(this.appService.tenantConfig.config.resourceUrl, 'gi'),
          this.appService.tenantConfig.config.eurResourceUrl,
        ),
      );
    }
    return newBody;
  }
}
