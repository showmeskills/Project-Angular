import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseData } from '../interfaces/response.interface';
import { ModifyDepositLimit } from '../interfaces/responsible.interface';
import { BaseApi } from './base.api';
@Injectable({
  providedIn: 'root',
})
export class ResponsibleApi extends BaseApi {
  /**
   * 用户存款限额
   *
   * @returns //
   */
  getDepositLimit(): Observable<ModifyDepositLimit | null> {
    const url = `${environment.apiUrl}/v1/member/selfrestraint/getdepositlimit`;
    return this.get<ResponseData<ModifyDepositLimit>>(url).pipe(map(x => x?.data || null));
  }

  /**
   * 更新用户存款限额
   *
   * @param dailyLimit
   * @param weeklyLimit
   * @param monthlyLimit
   * @returns //
   */
  postModifyDepositLimit(
    dailyLimit: number | null,
    weeklyLimit: number | null,
    monthlyLimit: number | null,
  ): Observable<ResponseData<ModifyDepositLimit>> {
    const url = `${environment.apiUrl}/v1/member/selfrestraint/modifydepositlimit`;
    return this.post<ResponseData<ModifyDepositLimit>>(url, {
      dailyLimit,
      weeklyLimit,
      monthlyLimit,
    });
  }

  /**
   * 删除用户存款限额预设
   *
   * @param cancelType
   * @returns //Daily, Weekly, Monthly
   */
  cancelDepositLimitPreset(cancelType: string): Observable<ModifyDepositLimit | null> {
    const url = `${environment.apiUrl}/v1/member/selfrestraint/canceldepositlimitpreset`;
    return this.post<ResponseData<ModifyDepositLimit>>(url, {
      cancelType,
    }).pipe(map(v => v?.data || null));
  }

  /**
   * 用户自我排除设定
   *
   * @param exclusionUntil
   * @returns  "exclusionUntil": "2024-05-07T02:18:49.227Z"
   */
  setSelFexClusion(exclusionUntil: string): Observable<boolean> {
    const url = `${environment.apiUrl}/v1/member/selfrestraint/setselfexclusion`;
    return this.post<ResponseData<boolean>>(url, {
      exclusionUntil,
    }).pipe(map(v => v?.data || false));
  }
}
