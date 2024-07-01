import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { catchError, map } from 'rxjs/operators';
import {
  PSPGroup,
  PSPGroupAdd,
  PSPGroupUpdate,
  PSPRuleAddParams,
  PSPRuleItem,
  PSPRuleSortParams,
} from 'src/app/shared/interfaces/psp';

@Injectable({
  providedIn: 'root',
})
export class PSPApi extends BaseApi {
  private _url = `${environment.apiUrl}/ploy`;

  /**
   * 获取配置分组
   */
  getConfigGroupList(merchantId: number | string): Observable<PSPGroup[]> {
    return this.get<any>(`${this._url}/getploygrouplist`, { merchantId }).pipe(
      map((res) => (Array.isArray(res) ? res : []))
    );
  }

  /**
   * 新增配置分组
   */
  addConfigGroup(params: Partial<PSPGroupAdd>): Observable<boolean | Error> {
    return this.post<any>(`${this._url}/addploygroup`, params);
  }

  /**
   * 更新配置分组
   */
  updateConfigGroup(params: PSPGroupUpdate): Observable<boolean | Error> {
    return this.put<any>(`${this._url}/updateploygroup`, params);
  }

  /**
   * 排序分组
   * ps: 只需要传入 需要移动排序的分组id和排序值，其他接口会自动计算
   */
  sortConfigGroup(merchantId: number | string, id: number, sort: number): Observable<boolean | Error> {
    return this.put<any>(`${this._url}/updateploygroupsort`, { merchantId, id, sort });
  }

  /**
   * 删除分组
   */
  delConfigGroup(merchantId: number | string, id: number): Observable<boolean | Error> {
    return this.delete<any>(`${this._url}/deleteploygroup`, { merchantId: +merchantId, id });
  }

  /**
   * 获取策略根据分组
   * @param merchantId 商户id
   * @param groupId 分组id
   * @param isEnable 是否启用 默认null所有
   */
  getStrategyList(merchantId: number | string, groupId: number, isEnable?: boolean): Observable<PSPRuleItem[]> {
    return this.get<PSPRuleItem[]>(`${this._url}/getployrulelist`, {
      merchantId,
      groupId,
      isEnable,
    }).pipe(
      map((res) => (Array.isArray(res) ? res : [])),
      catchError(() => of([]))
    );
  }

  /**
   * 新增策略
   */
  addStrategy(params: PSPRuleAddParams): Observable<boolean | Error> {
    return this.post<any>(`${this._url}/addployrule`, params);
  }

  /**
   * 更新策略
   */
  updateStrategy(params: PSPRuleItem): Observable<boolean | Error> {
    return this.put<any>(`${this._url}/updateployrule`, params);
  }

  /**
   * 获取策略详情
   */
  getStrategyDetail(merchantId: number | string, groupId: number, id: number): Observable<PSPRuleItem> {
    return this.get<PSPRuleItem>(`${this._url}/getployrule`, { merchantId, groupId, id });
  }

  /**
   * 更新策略规则排序
   */
  updateStrategySort(params: PSPRuleSortParams): Observable<boolean | Error> {
    return this.put<any>(`${this._url}/updateployrulesort`, params);
  }

  /**
   * 删除策略
   */
  delStrategy(merchantId: number | string, groupId: number, id: number): Observable<boolean | Error> {
    return this.delete<any>(`${this._url}/deleteployrule`, { merchantId: +merchantId, groupId, id });
  }
}
