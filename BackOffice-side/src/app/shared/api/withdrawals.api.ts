import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { TransactionListResponse, TransactionParams } from 'src/app/shared/interfaces/transaction';
import { PageResponse } from 'src/app/shared/interfaces/base.interface';
import {
  WithdrawalConfigGroup,
  WithdrawalConfigGroupSortItemParams,
  WithdrawalStrategyParams,
  WithdrawalStrategyResponse,
} from 'src/app/shared/interfaces/withdrawals';
import { catchError, map, tap } from 'rxjs/operators';

// import { getDepositListParam } from '../interfaces/deposit.interface';

@Injectable({
  providedIn: 'root',
})
export class WithdrawalsApi extends BaseApi {
  private _url = `${environment.apiUrl}/asset/transaction`;
  private _conf = `${environment.apiUrl}/risk/withdrawalconfig`;

  /**
   * 订单状态
   * @returns 示例数据
   */
  getOrderStatus(): Observable<any> {
    return this.get<any>(`${this._url}/getorderstatusconfig`);
  }

  /**
   * 出款记录列表
   * @param param
   * @returns
   */
  getWithdrawRecord(param: TransactionParams): Observable<PageResponse<TransactionListResponse>> {
    return this.get<any>(`${this._url}/getlist`, param);
  }

  /**
   * 取款详情
   * @param id
   * @param isRecord {boolean} 是否是记录查看操作
   * @returns
   */
  getWithdrawDetail(id, isRecord?: boolean) {
    return this.get<any>(`${this._url}/getwithdrawdetail`, { id }).pipe(
      tap(() => isRecord && this.withdrawViewDetailRecord(id).subscribe())
    );
  }

  /**
   * 出款详情进行记录“查看”的动作数据 （需要捕捉错误，不然其他流会中断）
   * @returns
   * @param txId 订单id
   */
  withdrawViewDetailRecord(txId: number) {
    return this.post<any>(`${this._url}/withdrawview`, { txId }).pipe(catchError(() => of(false)));
  }

  /**
   * 出款审批
   * @returns
   * @param txId 订单id
   * @param pass 审核是否通过
   * @param remark 备注
   */
  withdrawReview(txId: number, pass: boolean | null, remark?: string | null) {
    return this.post<any>(`${this._url}/auditwithdrawtx`, { txId, pass, remark });
  }

  /**
   * 出款审批 - 二审
   * @returns
   * @param txId 订单id
   * @param pass 审核是否通过
   * @param remark 备注
   */
  withdrawReview2(txId: number, pass: boolean | null, remark?: string | null) {
    return this.post<any>(`${this._url}/auditwithdrawtx2`, { txId, pass, remark });
  }
  /* 提款API结束 */

  /**************************************************************************************
   * 提款审核配置API
   **************************************************************************************/
  /**
   * 获取提款审核配置分组
   */
  getConfigGroupList(tenantId: number | string): Observable<WithdrawalConfigGroup[]> {
    return this.get<any>(`${this._conf}/getgroups`, { tenantId }).pipe(map((res) => (Array.isArray(res) ? res : [])));
  }

  /**
   * 新增提款审核配置分组
   */
  addConfigGroup(params: Partial<WithdrawalConfigGroup>): Observable<boolean | Error> {
    return this.post<any>(`${this._conf}/addgroup`, params);
  }

  /**
   * 更新提款审核配置分组
   */
  updateConfigGroup(params: WithdrawalConfigGroup): Observable<boolean | Error> {
    return this.post<any>(`${this._conf}/updategroup`, params);
  }

  /**
   * 排序分组
   */
  sortConfigGroup(
    tenantId: number | string,
    exchangeGroupItems: WithdrawalConfigGroupSortItemParams[]
  ): Observable<boolean | Error> {
    return this.post<any>(`${this._conf}/exchangegroup`, { tenantId, exchangeGroupItems });
  }

  /**
   * 删除分组
   */
  delConfigGroup(tenantId: number, groupId: number): Observable<boolean | Error> {
    return this.post<any>(`${this._conf}/delgroup`, { tenantId, groupId });
  }

  /**
   * 获取策略根据分组
   */
  getStrategyList(tenantId: number | string, groupId: number): Observable<WithdrawalStrategyResponse[]> {
    return this.get<WithdrawalStrategyResponse[]>(`${this._conf}/withdrawalconfigoutput`, { tenantId, groupId }).pipe(
      map((res) => (Array.isArray(res) ? res : [])),
      catchError(() => of([]))
    );
  }

  /**
   * 更新策略
   */
  updateStrategy(params: WithdrawalStrategyParams): Observable<boolean | Error> {
    return this.post<any>(`${this._conf}/updatewithdrawalconfig`, params);
  }
}
