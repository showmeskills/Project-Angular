import { Injectable } from '@angular/core';
import { Observable, TimeoutError, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  AllNetWorks,
  CurrenciesInterface,
  CurrencyPurchaseInferface,
  DepositAddressInterface,
  DepositAddressParamInterface,
  PaymentListInferface,
  PaymentListResponse,
  PostDepositCryptoInferface,
  ResponseToCurrency,
  ToCurrency,
  TokenNetworksParamInterface,
  VirtualRate,
} from '../interfaces/deposit.interface';
import { ResponseData } from '../interfaces/response.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class DepositApi extends BaseApi {
  private get depositUrl(): string {
    return `${environment.apiUrl}/v1/asset/deposit`;
  }
  private get refDataUrl(): string {
    return `${environment.apiUrl}/v1/asset/refdata`;
  }

  /**
   * 获取存款方式
   */
  getDepositType(): Observable<any> {
    return this.get<any>(`${this.depositUrl}/deposittype`);
  }

  /**
   * 获取所有币种
   *
   * @param type  0:所有币种(默认）/1:法币/2：虚拟币
   * @param category  存款/提款/所有 Deposit, Withdraw
   * @param isSupportVirtualToCurrency 支持 存续得法 或者 不支持 存续得法 默认为 null
   * @returns
   */
  getCurrencies(
    type: 0 | 1 | 2 = 0,
    category: string = '',
    isSupportVirtualToCurrency: boolean | null = null,
  ): Observable<CurrenciesInterface[] | null> {
    return this.get<ResponseData<CurrenciesInterface[]>>(`${this.refDataUrl}/currencies`, {
      type: type,
      category: category,
      isSupportVirtualToCurrency: isSupportVirtualToCurrency as boolean,
    }).pipe(
      map(res => {
        if (res?.data) {
          return res.data.sort((a, b) => a.sort - b.sort);
        } else {
          return null;
        }
      }),
    );
  }

  /**
   * 获取虚拟货币网络
   *
   * @returns
   */
  getAllNetWorks(): Observable<ResponseData<AllNetWorks[]>> {
    return this.get<any>(`${this.refDataUrl}/allnetworks`);
  }
  /**
   * 获取所有虚拟货币网络
   *
   * @param param
   */

  getTokenNetworks(param: TokenNetworksParamInterface): Observable<ResponseData<AllNetWorks>> {
    return this.get<any>(`${this.refDataUrl}/tokennetworks`, param);
  }

  /**
   * 获取虚拟币存款地址
   *
   * @param param
   * @returns
   */
  getDepositAddress(param: DepositAddressParamInterface): Observable<ResponseData<DepositAddressInterface>> {
    return this.get<any>(`${this.depositUrl}/depositaddress`, param);
  }

  /**
   * 获取法币存取款支付方式(更改真实数据)
   *
   * @param param
   * @returns
   */
  getPaymentlist(param: PaymentListInferface): Observable<{ paymentList: PaymentListResponse[]; types: string[] }> {
    return this.get<ResponseData<{ paymentList: PaymentListResponse[]; types: string[] }>>(
      `${this.refDataUrl}/getpaymentlist`,
      param,
    ).pipe(
      map(v => {
        if (v?.data) {
          return {
            ...v.data,
            // 过滤掉 没有 type 或 type 是空的
            paymentList: (v.data.paymentList || []).filter(x => x.type && x.type.length > 0),
          };
        } else {
          return { paymentList: [], types: [] };
        }
      }),
    );
  }

  /**
   * 法币存款
   *
   * @param param
   * @param options
   * @param time
   * @returns
   */
  postDepositCrypto(param: PostDepositCryptoInferface, time: number = 90000): Observable<any> {
    this.dataCollectionService.setEnterTime(param.paymentCode);
    return this.post<any>(`${this.depositUrl}/currency`, param, time, (error, apiUrl, body, method) => {
      if (error instanceof TimeoutError) {
        this.toast.show({ message: this.localeService.getValue('dep_fail_re_t'), type: 'fail', title: '' });
        return of(null);
      }
      return this.handleError(error, apiUrl, body, method);
    }).pipe(
      tap(x => {
        this.dataCollectionService.gtmPush('deposit_fiat', { payment_code: param.paymentCode });
        this.dataCollectionService.addPoint({
          eventId: 30027,
          actionValue1: this.dataCollectionService.getTimDiff(param.paymentCode),
          actionValue2: param.paymentCode,
        });
      }),
    );
  }

  /**
   * 法币存款 (泰国越南获取第三方)
   *
   * @param param
   * @returns
   */
  postDepositOnlinetransfer(param: PostDepositCryptoInferface): Observable<any> {
    return this.post<any>(`${this.depositUrl}/onlinetransfer`, param);
  }

  /**
   * 法币 (获取订单状态)
   *
   * @param orderId
   * @returns
   */
  getDepositOrderStateInfo(orderId: string): Observable<any> {
    return this.get<any>(`${this.depositUrl}/getorderstateinfo`, { orderId: orderId }).pipe(
      tap(x => {
        if (x?.data?.state === 'Success') {
          this.dataCollectionService.gtmPush('deposit_success');
        }
      }),
    );
  }

  /**
   * 获取购买币种链接
   *
   * @param param
   * @returns
   */
  getCurrencyPurchase(param: CurrencyPurchaseInferface): Observable<any> {
    return this.get<any>(`${this.depositUrl}/currencypurchase`, param);
  }

  /**
   * 获取法币对应所有虚拟币汇率
   *
   * @param currency 法币
   * @param category 提还是存
   * @returns
   */
  getFiatToVirtualRate(currency: string, category: 'Deposit' | 'Withdraw'): Observable<ResponseData<VirtualRate>> {
    return this.get<VirtualRate>(`${this.refDataUrl}/getfiattovirtualrate`, {
      currency,
      category,
    }).pipe(map(v => v?.data));
  }

  /**
   * 提交存法得虚
   *
   * @param params 提交参数
   * @returns
   */
  submitToCurrency(params: ToCurrency): Observable<ResponseData<ResponseToCurrency>> {
    this.dataCollectionService.setEnterTime(params.paymentCode);
    return this.post<ResponseData<ResponseToCurrency>>(`${this.depositUrl}/tocurrency`, params).pipe(
      tap(x => {
        this.dataCollectionService.gtmPush('deposit_fiat', { payment_code: params.paymentCode });
        this.dataCollectionService.addPoint({
          eventId: 30027,
          actionValue1: this.dataCollectionService.getTimDiff(params.paymentCode),
          actionValue2: params.paymentCode,
        });
      }),
    );
  }
}
