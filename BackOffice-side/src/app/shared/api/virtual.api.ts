import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { VirtualParams } from '../interfaces/virtual';

@Injectable({
  providedIn: 'root',
})
export class VirtualApi extends BaseApi {
  private _url = `${environment.apiUrl}/asset/tokenaddress`;

  /**
   * 获取虚拟币地址加密货币列表
   */
  getList(params: VirtualParams): Observable<any> {
    return this.get<any>(`${this._url}/getlist`, params);
  }

  /**
   * 获取转账网络配置
   */
  getNetwork(): Observable<any> {
    return this.get<any>(`${this._url}/getcoinnetworkconfig`);
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
}
