import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  AddBankCardPost,
  BankCard,
  BatchdeleteParam,
  DeleteParam,
  SystemBankCard,
  VerifyInfoParams,
  VerifyInfoResponse,
} from '../interfaces/bank-card.interface';
import { ResponseData } from '../interfaces/response.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class BankCardApi extends BaseApi {
  private get url(): string {
    return `${environment.apiUrl}/v1/asset/bankcard`;
  }

  /**
   * 添加银行卡
   *
   * @param param
   * @returns
   */
  addBankCard(param: AddBankCardPost): Observable<ResponseData<boolean>> {
    param.cardNum = String(param.cardNum).replace(/ /g, '');
    return this.post(`${this.url}/addbankcard`, param);
  }

  /**
   * 获取银行卡
   *
   * @returns
   */
  getBankCard(): Observable<ResponseData<BankCard[]>> {
    return this.get(`${this.url}/getbankcard`);
  }

  /**
   * 设为预设银行卡
   *
   * @param cardId
   * @returns
   */
  setDefaultCard(cardId: number): Observable<ResponseData<boolean>> {
    const url = `${environment.apiUrl}/v1/asset/bankcard/updatedefault`;
    return this.post(url, { id: cardId });
  }

  /**
   * 获取系统支持银行资讯
   *
   * @param currency
   * @returns
   */
  getSystemBank(currency: string): Observable<ResponseData<SystemBankCard[]>> {
    return this.get(`${this.url}/getsystembank`, { currency: currency });
  }

  /**
   * 获取存款支付方式支持的银行卡
   *
   * @param paymentCode
   * @param currency
   * @returns
   */
  getDepositBank(paymentCode: string, currency: string): Observable<ResponseData<SystemBankCard[]>> {
    return this.get(`${this.url}/getdepositbankcard`, { paymentCode: paymentCode, currency: currency });
  }

  /**
   * 删除银行卡
   *
   * @param cardId
   * @param key
   * @param param
   * @returns
   */
  deleteCard(param: DeleteParam): Observable<ResponseData<boolean>> {
    return this.post(`${this.url}/deletebankcard`, param);
  }

  /**
   * 批量删除银行卡
   *
   * @param cardId
   * @param key
   * @param param
   * @returns
   */
  batchDeleteCard(param: BatchdeleteParam) {
    return this.post(`${this.url}/batchdeletebankcard`, param);
  }

  /**
   * 获取银行卡校验信息
   *
   * @param params currencyType, cardNum
   * @returns
   */
  getBankCardVerifyInfo(params: VerifyInfoParams): Observable<ResponseData<VerifyInfoResponse>> {
    params.cardNum = String(params.cardNum).replace(/ /g, '');
    return this.post(`${this.url}/getbankcardverifyinfo`, params);
  }
}
