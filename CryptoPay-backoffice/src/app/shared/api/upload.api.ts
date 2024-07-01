import { Injectable } from '@angular/core';
import { Observable, of, switchMap, zip } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { catchError, map } from 'rxjs/operators';
import { UploadType, UploadURL } from '../interfaces/upload';

@Injectable({
  providedIn: 'root',
})
export class UploadApi extends BaseApi {
  private _url = `${environment.apiUrl}/system`;

  /**
   * GoMoney获取上传接口
   * @param type Merchant Currency GameProvider Games
   * @param fileName 文件名包含后缀
   * @param mark 文件标识（大小寸尺） 20_20 图片宽高度 | img或video
   */
  getUploadURL(type: UploadType, fileName: string, mark?: string): Observable<UploadURL> {
    return this.post<any>(`${this._url}/createuploadurl`, {
      type,
      fileName: fileName ? encodeURI(fileName) : '',
      mark,
    });
  }

  /**
   *
   * 上传
   * @param uploadURL 要put图片的地址对象 通过getUploadURL接口返回
   * @param file 图片file对象
   * @param config
   */
  upload(uploadURL: UploadURL, file: any, config?) {
    return this.put<any>(uploadURL?.url, file, {
      headers: { 'Content-Type': file.type },
      ...config,
    });
  }

  /**
   * 获取上传批量地址
   */
  createMultipleUploadUrl(params: any): Observable<any> {
    return this.post(`${this._url}/createmultipleuploadurl`, params);
  }

  /**
   * 获取静态配置文件内容
   * @returns
   */
  getStaticConfig(url): Observable<any> {
    return this.http.get<any>(url).pipe(catchError(() => of(undefined)));
  }

  /**
   * 获取商户静态配置文件
   * @param merchantId
   */
  getMerchantStaticConfig(merchantId: number | string): Observable<any> {
    const webUrl = this.appService.joinHost(`/configs/web-${merchantId}.json?_=${Date.now()}`);
    const appUrl = this.appService.joinHost(`/configs/app-${merchantId}.json?_=${Date.now()}`);

    return zip([this.getStaticConfig(webUrl), this.getStaticConfig(appUrl)]).pipe(map(([web, app]) => ({ web, app })));
  }

  /**
   * 上传商户静态配置文件
   * @returns
   */
  uploadMerchantStaticConfig(merchantId: number | string, content: Object): Observable<any> {
    const fileName = `${merchantId}.json`;

    const upload = (uploadURL, type) => {
      const file = new File([new Blob([JSON.stringify(content[type])])], type + '-' + fileName);

      return this.upload(uploadURL, file).pipe(map((res) => (res === null ? uploadURL.filePath : null)));
    };

    const request = (type) =>
      this.post<any>(`${this._url}/createconfiguploadurl`, {
        fileName: type + '-' + fileName,
      }).pipe(
        catchError(() => of(undefined)),
        switchMap((uploadURL) => upload(uploadURL, type))
      );

    return zip([request('web'), request('app')]).pipe(
      switchMap(([web, app]) => {
        return web || app ? this.clearCDNCache().pipe(map(() => ({ web, app }))) : of(null);
      })
    );
  }

  /**
   * 清除CDN缓存
   */
  clearCDNCache(): Observable<any> {
    return this.post(`${this._url}/clearcdncache`);
  }
}
