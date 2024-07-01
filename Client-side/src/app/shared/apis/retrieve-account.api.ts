import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseData } from '../interfaces/response.interface';
import {
  AppealListParams,
  DepositeByCurrencyParams,
  TopUpoOrderInforCallBack,
  TxIdExitsParams,
  UpdateCurrencyDepositeOrderCallBack,
  UpdateCurrencyDepositeOrderParams,
} from '../interfaces/retrieve-account.interface';
import { BaseApi } from './base.api';
@Injectable({
  providedIn: 'root',
})
export class RetrieveAccountApi extends BaseApi {
  //获取申诉历史
  getAppealList(params: AppealListParams): Observable<any> {
    const url = `${environment.apiUrl}/v1/asset/appeal/list`;
    return this.get(url, params).pipe(
      map(
        (x: any) =>
          x?.data || {
            total: 0,
            list: [],
          }
      )
    );
  }
  // 判断虚拟TxId 是否存在申诉
  checkTxIdExists(params: TxIdExitsParams): Observable<any> {
    const url = `${environment.apiUrl}/v1/asset/appeal/checktxidexists`;
    return this.get(url, params);
  }
  // 添加虚拟存款申诉
  depositByCoin(params: any): Observable<any> {
    const url = `${environment.apiUrl}/v1/asset/appeal/depositbycoin`;
    return this.post(url, params);
  }

  /**
   * 根据订单号获取订单信息  /v1/asset/appeal/gettxinfo
   *
   * @param orderNum
   */
  getTxinFor(orderNum: string): Observable<TopUpoOrderInforCallBack> {
    const url = `${environment.apiUrl}/v1/asset/appeal/gettxinfo`;
    return this.get(url, { orderNum });
  }

  /**
   * 法币存款申诉
   *
   * @param params
   */
  postDepositeByCurrency(params: DepositeByCurrencyParams): Observable<any> {
    const url = `${environment.apiUrl}/v1/asset/appeal/depositbycurrency`;
    return this.post(url, params);
  }

  /**
   * 更新法币存款申诉
   *
   * @param params
   */
  postUpdateCurrencyDepositeOrder(params: UpdateCurrencyDepositeOrderParams): Observable<ResponseData<boolean>> {
    const url = `${environment.apiUrl}/v1/asset/appeal/updatecurrencydepositorder`;
    return this.post(url, params);
  }

  /**
   * 根据Id获取法币存款申诉
   *
   * @param appealId
   */
  getCurrencyDepositeId(appealId: string): Observable<UpdateCurrencyDepositeOrderCallBack> {
    const url = `${environment.apiUrl}/v1/asset/appeal/getcurrencydepositbyid`;
    return this.get(url, { appealId });
  }

  // /**上传申诉图片、视频 */
  // uploadAppealFile(fileName: string): Observable<ResponseData<UIpLoadUrl>> {
  //   const url = `${environment.apiUrl}/v1/resource/upload/createuploadurl`;
  //   return this.post<ResponseData<UIpLoadUrl>>(url, {
  //     type: 'Appeal',
  //     fileName,
  //   });
  // }

  // putUrl(url: string, body: any, imgType: string) {
  //   const opitons = {
  //     headers: new HttpHeaders({
  //       'Content-Type': `${imgType}`,
  //     }),
  //   };
  //   return this.put(url, body, opitons);
  // }
}
