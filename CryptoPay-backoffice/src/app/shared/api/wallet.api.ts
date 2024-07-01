import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { map, pluck } from 'rxjs/operators';
import { NetworkLink } from 'src/app/shared/interfaces/select.interface';
import {
  TradeDetail,
  TradeItem,
  TradeListParams,
  TradeParams,
  TradePreview,
  TradePreviewParams,
} from 'src/app/shared/interfaces/conversion';
import { PageResponse } from 'src/app/shared/interfaces/base.interface';

@Injectable({
  providedIn: 'root',
})
export class WalletApi extends BaseApi {
  private _url = `${environment.apiUrl}/virtualwallet`;

  /**
   * 更新热钱包
   */
  hotwallet_update(params: any): Observable<any> {
    return this.post(`${this._url}/hotwallet_update`, params);
  }

  /**
   * 获取热钱包
   */
  hotwallet(params?: any): Observable<any> {
    return this.get(`${this._url}/hotwallet`, params).pipe(map((e) => (Array.isArray(e) ? e : [])));
  }

  /**
   * 获取加密钱包
   */
  cryptowallet_assert(params?: any): Observable<any> {
    return this.get(`${this._url}/cryptowallet_assert`, params).pipe(map((e) => (Array.isArray(e) ? e : [])));
  }

  /**
   * 获取加密钱包
   */
  getUserWallet(params?: any): Observable<any> {
    return this.get(`${this._url}/userwallet`, params);
  }

  /**
   * 更新冷钱包
   */
  coldwallet_update(params?: any): Observable<any> {
    return this.post(`${this._url}/coldwallet_update`, params);
  }

  /**
   * 新增冷钱包
   */
  coldwallet(params?: any): Observable<any> {
    return this.post(`${this._url}/coldwallet`, params);
  }

  /**
   * 获取冷钱包
   */
  getColdwallet(params?: any): Observable<any> {
    return this.get(`${this._url}/coldwallet`, params).pipe(map((e) => (Array.isArray(e) ? e : [])));
  }

  /**
   * 获取所有币种和主链
   */
  getWalletPrimary(): Observable<NetworkLink[]> {
    return this.get<any>(`${this._url}/option_gettokenlist`).pipe(
      pluck('list'),
      map((e) =>
        Array.isArray(e)
          ? e.reduce((t, j: NetworkLink) => {
              const now = t.find((c) => c.network === j.network);

              if (now) {
                now.children.push(j);
              } else {
                t.push({
                  network: j.network,
                  children: [j],
                });
              }

              return t;
            }, [] as NetworkLink[])
          : ([] as any)
      )
    );
  }

  /**
   * 验证虚拟币钱包地址是否有效
   */
  verifyCoinAddress(params?: any): Observable<boolean> {
    return this.get(`${this._url}/refdata_verifyaddress`, params);
  }

  /**
   * 获取热钱包闪兑订单列表    GET    /api/v1/virtualwallet/conversion
   * @param params
   */
  conversion(params?: TradeListParams): Observable<PageResponse<TradeItem>> {
    return this.get(`${environment.apiUrl}/conversion/orders`, params);
  }

  /**
   * 闪兑预览    POST    /api/v1/virtualwallet/conversion_preview
   * 闪兑预览    POST    /api/v1/Conversion/Preview
   * @param params
   */
  conversion_preview(params?: TradePreviewParams): Observable<TradePreview> {
    return this.post(`${environment.apiUrl}/conversion/preview`, params);
  }

  /**
   * 创建热钱包闪兑订单    POST    /api/v1/virtualwallet/conversion_add
   * @param params
   */
  conversion_add(params?: TradeParams): Observable<boolean | Error> {
    return this.post(`${environment.apiUrl}/conversion/trade`, params);
  }

  /**
   * 闪兑订单详情 /api/v1/Conversion/OrderDetail
   * @param conversionId
   */
  conversionDetail(conversionId: number): Observable<TradeDetail> {
    return this.get(`${environment.apiUrl}/conversion/orderdetail`, { conversionId });
  }
}
