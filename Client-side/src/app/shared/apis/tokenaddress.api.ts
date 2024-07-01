import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseData } from '../interfaces/response.interface';
import {
  AddAddressParam,
  AddEwAddressParam,
  BatchdeleteParam,
  EwPaymentlist,
  GetAddParam,
  InOutWhitelistParam,
  TokenAddress,
} from '../interfaces/tokenaddress.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class TokenAddressApi extends BaseApi {
  get url() {
    return `${environment.apiUrl}/v1/asset/tokenaddress/`;
  }
  get memberUrl() {
    return `${environment.apiUrl}/v1/member/account/`;
  }

  /**
   * 添加数字货币地址
   *
   * @param param
   * @returns //
   */
  addTokenaddress(param: AddAddressParam): Observable<ResponseData<boolean>> {
    return this.post(this.url + 'addtokenaddress', param);
  }

  /**
   * 添加电子钱包地址
   *
   * @param param
   * @returns //
   */
  addEwalletaddress(param: AddEwAddressParam): Observable<ResponseData<boolean>> {
    return this.post(this.url + 'addewalletaddress', param);
  }

  /**
   * 获取数字货币地址
   * return TokenAddress
   *
   * @param param
   * @returns //
   */
  getTokenadd(param: GetAddParam): Observable<ResponseData<TokenAddress[]>> {
    return this.get(this.url + 'gettokenaddress', param);
  }

  /**
   * 检查是否开启了白名单
   *
   * @returns //
   */
  checkWhiteliststatus(): Observable<ResponseData<boolean>> {
    return this.get(this.memberUrl + 'checkwhiteliststatus');
  }

  /**
   * key 2fa验证返回的key
   * 开启/关闭提现白名单
   *
   * @param key
   * @returns //
   */
  updateWhiteliststatus(key: string): Observable<ResponseData<boolean>> {
    return this.post(this.memberUrl + 'updatewhiteliststatus', { key });
  }

  /**
   * 批量加入白名单/移出白名单(支持单个)
   *
   * @param param
   * @returns //
   */
  inOutWhitelist(param: InOutWhitelistParam): Observable<ResponseData<boolean>> {
    return this.post(this.url + 'batchupdatewhitelist', param);
  }

  /**
   * 批量删除加密货币地址(支持单个)
   *
   * @param param
   * @returns //
   */
  deleteAddress(param: BatchdeleteParam): Observable<ResponseData<boolean>> {
    return this.post(this.url + 'batchdelete', param);
  }

  /**
   * 获取电子钱包支付方式
   *
   * @returns //
   */
  getewalletpaymentlist(): Observable<ResponseData<EwPaymentlist[]>> {
    return this.getByCaches<ResponseData<EwPaymentlist[]>>(
      `${environment.apiUrl}/v1/asset/refdata/getewalletpaymentlist`
    );
  }
}
