import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import {
  AddMerchantsParams,
  MerchantDetail,
  MerchantsListParams,
  UpdateMerchantsParams,
  UpdateMerchantsStatusParams,
} from '../interfaces/merchants-interface';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MerchantsApi extends BaseApi {
  private _url = `${environment.apiUrl}/resource/merchant`;
  /**
   * 商户列表
   * @param params 参数
   * @returns 示例数据
   */
  getList(params: MerchantsListParams): Observable<any> {
    return this.get<any>(`${this._url}/getmerchant`, params);
  }

  /**
   * 商户状态更新，禁用或者开启
   * @param params 参数 id
   * @returns 示例数据
   */
  updateMerchantsStatus(params: UpdateMerchantsStatusParams): Observable<any> {
    return this.put<any>(`${this._url}/updatemerchantstatus?Id=${params.Id}`);
  }

  /**
   * 查询商户服务配置
   * @returns 示例数据
   */
  getmerchantServiceConfig(): Observable<any> {
    return this.get<any>(`${this._url}/getmerchantserviceconfig`).pipe(map((e) => e.filter((j) => j !== 'Gomoney')));
  }

  /**
   * 新增商户
   * @returns 示例数据
   */
  creatMerchant(param: AddMerchantsParams): Observable<any> {
    return this.post<any>(`${this._url}/createmerchant`, param);
  }

  /**
   * 新增商户
   * @returns 示例数据
   */
  updateMerchant(param: UpdateMerchantsParams): Observable<any> {
    return this.put<any>(`${this._url}/updatemerchant`, param);
  }

  /**
   * 查询单个商户
   * @param id 商户id
   * @returns
   */
  querymerchant(id: string): Observable<MerchantDetail> {
    return this.get<any>(`${this._url}/querymerchant?id=${id}`);
  }

  /**
   * 获取商户支持语系
   */
  getMerchantLanguage(id: string | number): Observable<string[]> {
    return this.get<any>(`${this._url}/getmerchantlanguage`, { id }).pipe(catchError(() => of([])));
  }

  /**
   * 获取商户支持语系
   */
  getNotodDivision(): Observable<string[]> {
    return this.get<any>(`${this._url}/getnotodivisions`).pipe(catchError(() => of([])));
  }
}
