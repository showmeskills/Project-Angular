import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, filter, Observable, of, OperatorFunction, switchMap } from 'rxjs';
import { catchError, debounceTime, map } from 'rxjs/operators';
import { createOperatorSubscriber } from 'rxjs/internal/operators/OperatorSubscriber';
import { operate } from 'rxjs/internal/util/lift';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { PermissionNotEnoughList } from 'src/app/shared/interfaces/common.interface';

/**
 * 403无权限收集器：收集403的接口，请求成功后显示具体权限
 * 通过debounce 在请求后进行收集不断刷新时间，直到 {{ 1s }} 内没有请求，找出收集器的URL，清空收集器，进行请求
 *  -[ ] 可扩展支持参数配置，命中url后，不进行请求，直接返回等等配置
 */
@Injectable({
  providedIn: 'root',
})
export class Auth403 {
  constructor(protected http: HttpClient, protected ls: LocalStorageService) {}

  private _url = `${environment.apiUrl}/admin/permission`;
  private debounceTime = 1e3;
  private collector$ = new BehaviorSubject<HttpErrorResponse[]>([]);

  private get _refreshChange$() {
    return this.collector$.asObservable().pipe(debounceTime(this.debounceTime));
  }

  /**
   * 收集
   * @param e
   */
  push(e: HttpErrorResponse) {
    // 去重
    const hasVal = this.collector$.value.some((j) => new URL(j.url || '').pathname === new URL(e.url || '').pathname);

    this.collector$.next(hasVal ? this.collector$.value : [...this.collector$.value, e]);
  }

  protected get httpOptions() {
    return {
      headers: new HttpHeaders({
        lang: this.ls.lang?.toLowerCase(),
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Bearer ${this.ls.token}`,
      }),
    };
  }

  /**
   * 初始化
   */
  refreshChange$() {
    return this._refreshChange$.pipe(
      filter((e) => Array.isArray(e) && !!e.length),
      switchMap<HttpErrorResponse[], Observable<PermissionNotEnoughList>>((value: HttpErrorResponse[]) => {
        this.collector$.next([]);

        if (!value.length) return of([] as PermissionNotEnoughList);
        return this.http
          .post<PermissionNotEnoughList>(
            `${this._url}/getpermissionbyurls`,
            value.map((e) => new URL(e.url || '').pathname).filter((e) => e),
            {
              headers: this.httpOptions.headers,
            }
          )
          .pipe(
            map((e) => (Array.isArray(e) ? e : [])),
            catchError((err) => {
              console.error(err);
              return of([]);
            })
          );
      })
    );
  }

  /**
   * TODO: 扩展 请求前需收集数量，数量完成之后再手动Flush收集器，手动请求并加上debounce
   */

  /**
   * 刷新收集器的操作符
   * @private
   */
  refresh<T>(): OperatorFunction<T, T> {
    return operate((source, subscriber) => {
      source
        // .pipe(
        //   // finalize(() => {
        //   //   this.collector$.next();
        //   // })
        // )
        .subscribe(createOperatorSubscriber(subscriber));
    });
  }
}
