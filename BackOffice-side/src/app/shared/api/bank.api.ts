import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { BankParams } from 'src/app/shared/interfaces/bank';

@Injectable({
  providedIn: 'root',
})
export class BankApi extends BaseApi {
  private _url = `${environment.apiUrl}/asset/bankcard`;

  /**
   * 获取银行卡列表
   */
  getList(params: BankParams): Observable<any> {
    return this.get<any>(`${this._url}/getbankcardlist`, params);
  }

  /**
   * 更新银行卡状态
   */
  updateStatus(id: number): Observable<any> {
    return this.post<any>(`${this._url}/updatestatus`, { id });
  }

  /**
   * 更新银行卡备注
   */
  updateRemark(id: number, adminRemark: string): Observable<any> {
    return this.post<any>(`${this._url}/updateremark`, { id, adminRemark });
  }

  /**
   * 获取银行卡详情
   */
  getDetail(bankCardId: number): Observable<any> {
    return this.get<any>(`${this._url}/getdetail`, { bankCardId });
  }

  /**
   * 提款银行卡绑定信息查询
   */
  getBankQuery(params: any): Observable<any> {
    return this.get<any>(`${this._url}/query`, params);
  }

  /**
   * 获取会员银行卡列表
   */
  getMemberBankList(uid: string | number): Observable<any> {
    return this.get<any>(`${this._url}/getmemberbankcardlist`, { uid });
  }
}
