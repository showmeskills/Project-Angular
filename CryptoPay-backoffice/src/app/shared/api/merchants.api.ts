import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import {
  AddMerchantsParams,
  MerchantDetail,
  MerchantRateCurrency,
  MerchantsListParams,
  UpdateMerchantsParams,
  UpdateMerchantsStatusParams,
} from '../interfaces/merchants-interface';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MerchantsApi extends BaseApi {
  private _url = `${environment.apiUrl}/merchant`;
  /**
   * 商户列表
   * @param params 参数
   * @returns 示例数据
   */
  getList(params: MerchantsListParams): Observable<any> {
    return this.get<any>(`${this._url}/getmerchantinfos`, params);
  }

  /**
   * 商户状态更新，禁用或者开启
   * @param params 参数 id
   * @returns 示例数据
   */
  updateMerchantsStatus(params: UpdateMerchantsStatusParams): Observable<any> {
    return this.put<any>(`${this._url}/updatemerchantstate?id=${params.id}&state=${params.state}`);
  }

  /**
   * 查询商户服务配置
   * @returns 示例数据
   */
  getmerchantServiceConfig(): Observable<any> {
    return this.get<any>(`${this._url}/getmerchantserviceconfig`);
  }

  /**
   * 新增商户
   * @returns 示例数据
   */
  creatMerchant(param: AddMerchantsParams): Observable<any> {
    return this.post<any>(`${this._url}/addmerchantinfo`, param);
  }

  /**
   * 新增商户
   * @returns 示例数据
   */
  updateMerchant(param: UpdateMerchantsParams): Observable<any> {
    return this.put<any>(`${this._url}/updatemerchantinfo`, param);
  }

  /**
   * 查询单个商户
   * @param id 商户id
   * @returns
   */
  querymerchant(id: number | string): Observable<MerchantDetail> {
    return this.get<any>(`${this._url}/getmerchant?id=${id}`);
  }

  /**
   * 获取商户费率可配置的币种
   * @returns
   */
  merchant_getratescurrencies(): Observable<MerchantRateCurrency[]> {
    return this.get<any>(`${environment.apiUrl}/merchant/getratescurrencies`).pipe(
      map((e) => (Array.isArray(e) ? e : []))
    );
  }
}
