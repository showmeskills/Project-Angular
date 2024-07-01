import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { BannerList } from '../interfaces/resource.interface';
import { ResponseData } from '../interfaces/response.interface';
import { BaseApi } from './base.api';
@Injectable({
  providedIn: 'root',
})
export class ResourceApi extends BaseApi {
  /**
   *  用户是否有存款记录
   *
   * @param params
   * @param params.isDigital 判断是否是虚拟货币或者法币，不传为所有
   * @returns boolean
   */
  getUserDeposit(params?: { isDigital: boolean }): Observable<boolean> {
    const url = `${environment.apiUrl}/v1/asset/history/hasdeposittx`;
    return this.get<ResponseData<boolean>>(url, params).pipe(map(x => x?.data));
  }

  /**
   * 获取banner
   *
   * @param bannerPageType Banner页类型
   * @param clientType 客户端类型(Web、APP)
   * @returns //
   */
  getbannerlist(
    bannerPageType: 'FrontPage' | 'GamesPage' | 'LotteryPage',
    clientType = 'Web',
  ): Observable<ResponseData<BannerList[]>> {
    const url = `${environment.apiUrl}/v1/resource/banner/getbannerlist`;
    return this.getByCaches(url, { bannerPageType, clientType });
  }

  /**
   * 获取页脚
   *
   * @returns //
   */
  getFooter() {
    const url = `${environment.apiUrl}/v1/resource/footer/getfooterlist`;
    return this.getByCaches(url, { clientType: 'Web' });
  }

  /**
   * 加载翻译链接
   *
   * @param langCode
   * @returns //
   */
  getLocale(langCode: string): Observable<{ [key: string]: string }> {
    const localeUrls = environment.translateUrl.split(',').map(x => {
      if (!x.startsWith('http')) x = window.location.origin + x;
      return x.replace('[lang]', langCode);
    });
    let index = 0;
    const timeOut = 10 * 1000; //10秒超时
    const retryFn = (error: unknown) => {
      this.sentryService.apiError(localeUrls[index], error);
      index = index + 1 >= localeUrls.length ? 0 : index + 1;
      if (index === 0) {
        return of(null);
        // return timer(10 * 1000).pipe(
        //   switchMap(() => this.getByCaches<{ [key: string]: string }>(localeUrls[index], undefined, timeOut, retryFn))
        // );
      } else {
        return this.getByCaches<{ [key: string]: string }>(localeUrls[index], undefined, timeOut, retryFn);
      }
    };
    return this.getByCaches<{ [key: string]: string }>(localeUrls[index], undefined, timeOut, retryFn);
  }

  /**
   * 上传附件集成
   *
   * @param file 原生文件对象
   * @param fileType
   * @param type 上传的用途类型字段
   * @param time 超时 默认120秒
   * 'Kyc'
   * 'Agent'
   * 'Appeal' : 申诉
   * 'User'
   * 'UserFeedback' : 建议反馈
   * @returns //
   */
  uploadFile(
    file: File,
    fileType: string,
    type: 'Kyc' | 'Agent' | 'Appeal' | 'User' | 'UserFeedback',
    time: number = 120 * 1000,
  ): Observable<string | null> {
    const url = `${environment.apiUrl}/v1/resource/upload/createuploadurl`;
    return this.post<ResponseData<{ url: string; fullUrl: string }>>(url, {
      type: type,
      fileName: file.name,
    }).pipe(
      mergeMap(postRes => {
        return forkJoin([
          of(postRes),
          postRes?.data
            ? this.put(
                postRes.data.url,
                file,
                { headers: new HttpHeaders({ 'Content-Type': fileType, 'ngsw-bypass': 'true' }) },
                time,
              )
            : of(null),
        ]);
      }),
      map(([step1, step2]) => {
        if (step2) return step1.data.fullUrl;
        return null;
      }),
      catchError(() => of(null)),
    );
  }
}
