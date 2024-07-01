import { Injectable } from '@angular/core';
import { Observable, TimeoutError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseData } from '../interfaces/response.interface';
import {
  CoinFiatToCrypto,
  CoinWithdrawReq,
  CoinWithdrawReturn,
  CurrencyWithdrawReq,
  Quotalimit,
  RiskFormVerify,
} from '../interfaces/withdraw.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class WithdrawApi extends BaseApi {
  private get url(): string {
    return `${environment.apiUrl}/v1/asset/withdraw`;
  }

  /**
   * 虚拟货币提款
   *
   * @param param
   * @returns
   */
  coinWithdraw(param: CoinWithdrawReq): Observable<ResponseData<CoinWithdrawReturn>> {
    return this.post(`${this.url}/coin`, param);
  }

  /**
   * 获取币种提款限额
   *
   * @param currencyType
   * @returns
   */
  getCoinLimit(currencyType: string): Observable<ResponseData<Quotalimit>> {
    return this.get<ResponseData<Quotalimit>>(`${this.url}/getquotalimit?currencyType=${currencyType}`);
  }

  /**
   * 法币提款
   *
   * @param param
   * @returns
   */
  currencyWithdraw(param: CurrencyWithdrawReq): Observable<ResponseData<boolean>> {
    return this.post(`${this.url}/currceny`, param, undefined, (error, apiUrl, body, method) => {
      if (error instanceof TimeoutError) {
        this.toast.show({ message: this.localeService.getValue('wid_fail_re_t'), type: 'fail', title: '' });
        return of(null);
      }
      return this.handleError(error, apiUrl, body, method);
    });
  }

  /**
   * 取消法币提款订单
   *
   * @param orderNum 订单编号
   * @returns
   */
  cancelcurrency(orderNum: string): Observable<ResponseData<boolean>> {
    return this.post(`${this.url}/cancelcurrency`, { orderNum });
  }

  /**
   * 提法得虚提款
   *
   * @param params 参数
   * @returns
   */
  coinFiatToCrypto(params: CoinFiatToCrypto): Observable<ResponseData<boolean>> {
    return this.post(`${this.url}/currcencytocoin`, params);
  }

  /**
   * 检测是否可以提款成功
   *
   * @returns
   */
  riskformverify(): Observable<ResponseData<RiskFormVerify>> {
    return this.post(`${this.url}/riskformverify`);
  }
}
