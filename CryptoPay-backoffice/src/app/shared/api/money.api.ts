import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { map } from 'rxjs/operators';
import { CodeName } from 'src/app/shared/interfaces/base.interface';
import { downloadExcelFile } from 'src/app/shared/models/tools.model';
import { HttpHeaders } from '@angular/common/http';
import { MerchantMoneyCountItem } from 'src/app/shared/interfaces/merchants-interface';

@Injectable({
  providedIn: 'root',
})
export class MoneyApi extends BaseApi {
  private _url = `${environment.apiUrl}`;

  /**
   * 获取商户资产列表
   * @param params 参数
   * @returns 示例数据
   */
  getMerchantStat(params: any): Observable<any> {
    params.MerchantId = params.MerchantId || undefined;
    params.Currency = params.Currency || undefined;

    return this.get<any>(`${this._url}/merchantaccount/getaccountstat`, params);
  }

  /**
   * 获取商户资金流水列表
   * @param params 参数
   * @returns 示例数据
   */
  getMerchantFlow(params: any): Observable<any> {
    return this.get<any>(`${this._url}/merchantaccount/getaccountflow`, params);
  }

  /**
   * 商户资金调整
   * @param params 参数
   */
  merchantaccount_fundingadjustment(params: any): Observable<any> {
    return this.post<any>(`${this._url}/merchantaccount/fundingadjustment`, params);
  }

  /**
   * 导出商户资金流水
   */
  merchantaccount_exportaccountflow(params?: any) {
    return this.get<any>(`${this._url}/merchantaccount/exportaccountflow`, params, {
      headers: new HttpHeaders({
        lang: this.langService.currentLang?.toLowerCase(),
        Authorization: `Bearer ${this.localStorageService.token}`,
      }),
      responseType: 'blob',
    }).pipe(
      map((res) => {
        if (!res) return false;

        downloadExcelFile(res, `merchantFlow - ${Date.now()}.xlsx`);

        return true;
      })
    );
  }

  /**
   * 获取商户资金流水类型
   */
  option_getmerchantaccountflowchangetype(params?: CodeName[]) {
    return this.get<CodeName[]>(`${this._url}/option/getmerchantaccountflowchangetype`, params);
  }

  /**
   * 获取商户资金调账类型
   */
  option_getmerchantadjustment(params?: any) {
    return this.get<any>(`${this._url}/option/getmerchantadjustment`, params);
  }

  /**
   * 获取商户资产统计列表
   */
  merchantaccount_getaccountflowstat(params: {
    merchantId: number;
    currency: string;
    currentTime: number;
  }): Observable<MerchantMoneyCountItem[]> {
    return this.get<any>(`${this._url}/merchantaccount/getaccountflowstat`, params);
  }
}
