import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class MultilingualismApi extends BaseApi {
  private _url = `${environment.apiUrl}/resource/languagetranslate`;

  /**
   * 获取类型
   */
  getCategory(): Observable<any> {
    return this.get<any>(`${this._url}/gettypeselect`);
  }

  /**
   * 查询多语系列表
   */
  getList(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getlist`, params);
  }

  /**
   * 新增字段
   */
  addKey(params: any): Observable<any> {
    return this.post<any>(`${this._url}/addkey`, params);
  }

  /**
   * 修改多语系
   */
  update(params: any): Observable<any> {
    return this.put<any>(`${this._url}/update`, params);
  }

  /**
   * 新增多语系
   */
  add(params: any): Observable<any> {
    return this.post<any>(`${this._url}/add`, params);
  }

  /**
   * 新增语系
   */
  addlanguage(params: any): Observable<any> {
    return this.post<any>(`${this._url}/addlanguage`, params);
  }

  /**
   * 生成翻译资源 /api/v1/resource/languagetranslate/generatetranslate
   */
  geneRateTransLate(params: any): Observable<any> {
    return this.get<any>(`${this._url}/generatetranslate`, params);
  }

  /**
   * 上传翻译文件
   */
  uploadtranslatefile(file: any): Observable<any> {
    const data = new FormData();
    data.append('file', file);
    return this.post<any>(`${this._url}/uploadtranslatefile`, data, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.localStorageService.token}`,
      }),
    });
  }

  /**
   * 获取所有翻译的字段
   */
  getkeylist(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getkeylist`, params);
  }

  /**
   * 删除字段
   */
  delKey(params: any): Observable<any> {
    return this.post<any>(`${this._url}/deletatranslates`, params);
  }
}
