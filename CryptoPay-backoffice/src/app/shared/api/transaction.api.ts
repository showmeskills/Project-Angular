import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import {
  DepositHelperParams,
  DepositHelperResponse,
  OperaPaymentChannel,
  PaymentChannel,
  PaymentChannelListParams,
} from 'src/app/shared/interfaces/transaction';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TransactionApi extends BaseApi {
  private _url = `${environment.apiUrl}/asset/transaction`;

  /**
   * 获取后台操作存提款支付方式支付渠道列表
   * @param params 参数
   */
  paymentChannelList(params: PaymentChannelListParams): Observable<OperaPaymentChannel[]> {
    return this.get<any>(`${this._url}/paymentchannellist`, params).pipe(map((e) => (Array.isArray(e) ? e : [])));
  }

  /**
   * C2C支付方式支付渠道列表
   * @param params 参数
   */
  c2cpaymentchannellist(params: PaymentChannelListParams): Observable<PaymentChannel[]> {
    return this.get<any>(`${this._url}/c2cpaymentchannellist`, params).pipe(map((e) => (Array.isArray(e) ? e : [])));
  }

  /**
   * 待客入款
   * @param params 参数
   */
  deposithelper(params: DepositHelperParams): Observable<DepositHelperResponse> {
    return this.post<any>(`${this._url}/deposithelper`, params);
  }
}
