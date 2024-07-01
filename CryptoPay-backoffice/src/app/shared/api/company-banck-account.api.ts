import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ICreateComBankAccountParams, IComBanckAccountParams } from '../interfaces/company-banck-account';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class CompanyBankAccountApi extends BaseApi {
  private _url = `${environment.apiUrl}/companybankaccount`;

  //获取公司账资讯询列表
  getCompanyBankAccountList(params: IComBanckAccountParams): Observable<any> {
    return this.get<any>(`${this._url}/getcompanybankaccountlist`, params);
  }

  //取得公司帳戶資訊
  getCompanyBankAccount(id: number): Observable<any> {
    return this.get<any>(`${this._url}/getcompanybankaccount`, { id });
  }

  //新增公司账户资讯
  createCompanyBankAccount(params: ICreateComBankAccountParams): Observable<any> {
    return this.post<any>(`${this._url}/createcompanybankaccount`, params);
  }

  //更新指定的公司账户项目
  updateCompanyBankAccount(params: ICreateComBankAccountParams): Observable<any> {
    return this.put<any>(`${this._url}/updatecompanybankaccountinfo`, params);
  }
}
