import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { getDepositListParam, TransactionOrderStatusCustom, updateRemarkParam } from '../interfaces/deposit.interface';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DepositApi extends BaseApi {
  private _url = `${environment.apiUrl}/asset/transaction`;

  /**
   * 订单状态
   * @param params 参数
   * @returns 示例数据
   */
  getOrderStatus(): Observable<TransactionOrderStatusCustom[]> {
    return this.get<TransactionOrderStatusCustom[]>(`${this._url}/getorderstatusconfig`).pipe(
      catchError(() => of([])),
      map((res) => (Array.isArray(res) ? res.filter((e) => e.categoryCode !== 'Unknown') : [])),
      map((res) => {
        res.forEach((e) => {
          e.langText = this.langService.isLocal ? e.categoryDescription : e.categoryCode;
        });

        return res;
      })
    );
  }

  /**
   * 存款记录列表
   * @param param
   * @returns
   */
  getDepositrecord(param: getDepositListParam) {
    return this.get<any>(`${this._url}/depositrecord`, param);
  }

  /**
   * 存款详情
   * @param id
   * @returns
   */
  getDepositrecorddetail(id: number) {
    return this.get<any>(`${this._url}/depositrecorddetail`, { id });
  }

  /**
   * 修改备注
   * @param param
   * @returns
   */
  updateWithdrawRecordRemark(param: updateRemarkParam) {
    return this.post<any>(`${this._url}/updatewithdrawrecordremark`, param);
  }
}
