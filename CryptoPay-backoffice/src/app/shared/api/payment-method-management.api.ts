import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  PaymentMethodItem,
  PaymentMethodParams,
  UpdatePaymentMethodParams,
} from '../interfaces/payment-method-management';
import { BaseApi } from './base.api';
import { PageResponse } from 'src/app/shared/interfaces/base.interface';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PaymentMethodManagementApi extends BaseApi {
  private _url = `${environment.apiUrl}/paymentmethod`;

  //支付管理页面资讯
  getPaymentMethodList(params: PaymentMethodParams): Observable<PageResponse<PaymentMethodItem>> {
    return this.get<any>(`${this._url}/getpaymentmethodlist`, params).pipe(
      map((res) => {
        if (Array.isArray(res?.list)) {
          res.list = res.list.map((e) => ({ ...e, fixedAmounts: e.fixedAmounts || [] }));
        }
        return res;
      })
    );
  }

  // 更新支付方式
  updatedPaymentMethod(params: UpdatePaymentMethodParams): Observable<any> {
    return this.post<any>(`${this._url}/updatedpaymentmethodinfo`, params);
  }
}
