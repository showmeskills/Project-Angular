/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { SentryService } from 'src/app/shared/service/sentry.service';
import { environment } from 'src/environments/environment';
import { OrignalService } from '../../orignal.service';

@Injectable({
  providedIn: 'root',
})
export class BaseApi {
  constructor(
    protected http: HttpClient,
    protected orignalService: OrignalService,
    protected sentryService: SentryService,
    protected appService: AppService,
  ) {}

  protected get httpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json;charset=utf-8',
        Token: this.orignalService.token,
        'ngsw-bypass': 'true',
      }),
    };
  }

  /**
   * get请求
   *
   * @param url
   * @param params
   * @param headers
   * @param customHandleError 自定义错误处理，默认返回 null
   * @returns Observable<T>
   */
  protected get<T>(
    url: string,
    params?:
      | HttpParams
      | {
          [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
        },
    headers: HttpHeaders = this.httpOptions.headers,
    customHandleError: (error: any, apiUrl: string, params: any) => Observable<any> = this.handleError,
  ): Observable<T> {
    return this.http.get<T>(url, { headers: headers, params: params }).pipe(
      timeout(20000),
      catchError((error: any) => {
        return customHandleError(error, url, params);
      }),
    );
  }

  /**
   * 请求并判断是否缓存（目前仅适用于语言获取）
   *
   * @param url
   * @param time
   * @param retryFn
   * @param saveToCaches
   * @returns //
   */
  protected getRemoteLang<T>(
    url: string,
    time?: number,
    retryFn: (error: any, apiUrl: string) => Observable<any> = () => of(null),
    saveToCaches: boolean = false,
  ): Observable<T> {
    return this.http.get<T>(url, { headers: { 'ngsw-bypass': 'true' } }).pipe(
      timeout(time || 20000),
      tap(x => {
        if (saveToCaches && x) this.setCachesData(url, x);
      }),
      catchError(error => {
        return retryFn(error, url);
      }),
    );
  }

  /**
   * post请求
   *
   * @param url
   * @param body
   * @param headers
   * @param customHandleError 自定义错误处理，默认返回 null
   * @returns Observable<T>
   */
  protected post<T>(
    url: string,
    body: any,
    headers: HttpHeaders = this.httpOptions.headers,
    customHandleError: (error: any, apiUrl: string, body: any) => Observable<any> = this.handleError,
  ): Observable<T> {
    return this.http.post<T>(url, body, { headers: headers }).pipe(
      timeout(20000),
      catchError((error: any) => {
        return customHandleError(error, url, body);
      }),
    );
  }

  /**
   * 通过缓存请求（目前仅适用于语言获取）
   *
   * @param url
   * @param params
   * @param time
   * @param retryFn
   * @returns //
   */
  protected getByCaches<T>(
    url: string,
    time?: number,
    retryFn: (error: any, apiUrl: string) => Observable<any> = () => of(null),
  ): Observable<T> {
    if (this.appService.curCaches) {
      return new Observable<T>(observer => {
        this.getCachesData<T>(url)
          .then(cachedData => {
            // 有缓存，返回缓存，并进行新请求用于下一次使用
            observer.next(cachedData);
            observer.complete();
            this.getRemoteLang<T>(url, time, retryFn, true).subscribe();
          })
          .catch(() => {
            // 没有缓存，触发错误
            observer.error();
          });
      }).pipe(
        catchError(() => {
          // 捕捉错误，进行新请求，并进行缓存
          return this.getRemoteLang<T>(url, time, retryFn, true);
        }),
      );
    } else {
      // 不支持缓存，转到正常流程，且不缓存
      return this.getRemoteLang<T>(url, time, retryFn);
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
              response
                .json()
                .then(data => {
                  resolve(data);
                })
                .catch(() => {
                  reject(null);
                });
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
      this.appService.curCaches.put(key, new Response(JSON.stringify(response)));
    }
  }

  /**
   * 错误处理
   *
   * @param error
   * @param apiUrl
   * @param body
   * @returns //
   */
  private handleError(error: any, apiUrl: string, body: any): Observable<any> {
    // 错误的http状态码
    const status = error?.status;
    // 判断错误类型，前三种交由平台其它接口响应，这里不做处理;
    switch (status) {
      case 401:
        return of(null);
      case 403:
        return of(null);
      case 400:
        return of(null);
      default: {
        // 剩余包含超时、500、和其它未知情况，弹出提示，并记录到日志中心
        this.sentryService.apiError(
          apiUrl,
          error,
          body,
          false,
          {},
          {
            originalGame: true,
          },
        );
        return of(null);
      }
    }
  }

  /**
   * 获取Api请求Url
   *
   * @param requestPath 请求路径
   * @returns 完整的URL
   */
  protected getRequestUrl(requestPath: string): string {
    return `${environment.orignal.apiUrl}${requestPath}`;
  }

  /**
   * 获取randomApi请求Url
   *
   * @param requestPath 请求路径
   * @returns 完整的URL
   */
  protected getRandomRequestUrl(requestPath: string): string {
    return `${environment.orignal.newRandomUrl}/${requestPath}`;
  }
}
