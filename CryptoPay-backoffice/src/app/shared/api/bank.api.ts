import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import {
  AddBankListConfigParams,
  BankListConfigParams,
  BankMapListParams,
  BankMapParams,
  BankParams,
  UpdateBankListConfigParams,
} from 'src/app/shared/interfaces/bank';
import { HttpHeaders } from '@angular/common/http';

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
   * 获取银行列表配置
   */
  getBankListConfig(params: BankListConfigParams): Observable<any> {
    return this.get<any>(`${environment.apiUrl}/bankcode/bankcodeinfo`, params);
  }

  /**
   * 获取银行列表配置
   */
  addBankListConfig(params: AddBankListConfigParams): Observable<any> {
    return this.post<any>(`${environment.apiUrl}/bankcode/addbankcode`, params);
  }

  /**
   * 获取银行列表配置
   */
  updateBankListConfig(params: UpdateBankListConfigParams): Observable<any> {
    return this.post<any>(`${environment.apiUrl}/bankcode/updatebankcode`, params);
  }

  /**
   * 获取银行列表配置
   */
  delBankListConfig(id: number): Observable<boolean> {
    return this.delete<any>(`${environment.apiUrl}/BankCode/DeleteBankCode?id=${id}`);
  }

  /**
   * 获取银行列表配置
   */
  getBankMapList(params: BankMapListParams): Observable<any> {
    return this.get<any>(`${environment.apiUrl}/BankCodeMapping/GetBankCodeMapping`, params);
  }

  /**
   * 获取银行映射列表
   */
  delBankMap(id: number): Observable<boolean> {
    return this.delete<any>(`${environment.apiUrl}/BankCodeMapping/DeleteBankCodeMapping?id=${id}`);
  }

  /**
   * 新增银行映射
   */
  addBankMap(params: BankMapParams[]): Observable<boolean> {
    return this.post<any>(`${environment.apiUrl}/BankCodeMapping/AddBankCodeMappingList`, params);
  }

  /**
   * 新增银行映射
   */
  updateBankMap(params: BankMapParams[]): Observable<boolean> {
    return this.post<any>(`${environment.apiUrl}/BankCodeMapping/UpdateBankCodeMapping`, params);
  }

  /**
   * 新增银行映射
   */
  downloadBankMapExcel(): Observable<boolean> {
    return this.get<any>(
      `${environment.apiUrl}/bankcodemapping/templatedownload`,
      {},
      {
        responseType: 'blob',
      }
    ).pipe(
      map((res) => {
        const dataType = res.type;
        const aDom = document.createElement('a');

        aDom.href = window.URL.createObjectURL(new Blob([res], { type: dataType }));
        aDom.setAttribute('download', `bankMapExcel - ${Date.now()}.xlsx`);
        aDom.click();

        return true;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * 新增银行映射
   */
  parseBankMapByExcel({ channelId, currencyType, paymentMethodId }, file: File, config: any): Observable<boolean> {
    const form = new FormData();
    form.append('file', file);

    return this.post<any>(
      `${environment.apiUrl}/BankCodeMapping/UploadAndDataAnalysis?channelId=${channelId}&currencyType=${currencyType}&paymentMethodId=${paymentMethodId}`,
      form,
      {
        headers: new HttpHeaders({
          lang: this.langService.currentLang?.toLowerCase(),
          Authorization: `Bearer ${this.localStorageService.token}`,
        }),
        ...config,
      }
    );
  }

  /**
   * 获取会员银行卡列表
   */
  getMemberBankList(uid: string | number): Observable<any> {
    return this.get<any>(`${this._url}/getmemberbankcardlist`, { uid });
  }
}
