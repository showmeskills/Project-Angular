import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { ReplenishmentParams, VirtualParams } from '../interfaces/virtual';
import { Network, NetworkSelect } from 'src/app/shared/interfaces/select.interface';

@Injectable({
  providedIn: 'root',
})
export class VirtualApi extends BaseApi {
  private _url = `${environment.apiUrl}/asset/tokenaddress`;
  private _baseUrl = `${environment.apiUrl}`;

  /**
   * 获取虚拟币地址加密货币列表
   */
  getList(params: VirtualParams): Observable<any> {
    return this.get<any>(`${this._url}/getlist`, params);
  }

  /**
   * 获取转账网络配置
   */
  getNetwork(): Observable<NetworkSelect[]> {
    return this.get<Network[]>(`${environment.apiUrl}/option/getnetworks`).pipe(
      map((e) =>
        (Array.isArray(e) ? e : ([] as Network[])).map((j) => ({
          ...j,
          name: this.langService.isLocal ? j.localName : j.enName,
        }))
      )
    );
  }

  /**
   * 更新加密货币状态
   */
  updateStatus(id: number, merchantId: string): Observable<any> {
    return this.put<any>(`${this._url}/updatestatus`, { id, merchantId });
  }

  /**
   * 更新加密货币备注
   */
  updateRemark(id: number, merchantId: string, remark: string): Observable<any> {
    return this.put<any>(`${this._url}/updateremark`, {
      id,
      merchantId,
      remark,
    });
  }

  /**
   * 获取加密货币详情
   */
  getDetail(id: number): Observable<any> {
    return this.get<any>(`${this._url}/getdetail`, { id });
  }

  /**
   * 提款虚拟货币地址绑定信息查询
   */
  getVirtualQuery(params): Observable<any> {
    return this.get<any>(`${this._url}/query`, params);
  }

  /**
   * 虚拟币补单
   */
  replenishmentOrder(params: ReplenishmentParams): Observable<any> {
    return this.post<any>(`${this._baseUrl}/order/issuetokendepositbymerchantid`, params);
  }
}
