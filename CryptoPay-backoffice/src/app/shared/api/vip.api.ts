import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class VipApi extends BaseApi {
  private _vipA = `${environment.apiUrl}/vipa`;
  private _vipC = `${environment.apiUrl}/vipc`;

  /**
   * 等级配置 获取
   */
  getLevelConfigList(tenantId): Observable<any> {
    return this.post<any>(`${this._vipA}/manage_level_detail_list`, {}, { headers: this.getHeaders({ tenantId }) });
  }

  /**
   *  VIPA/VIPC -  VIP等级列表（含成长值）
   * /api/v1/vip/vip_manage_level_simple_list => /vip/manage/level/simple/list
   */
  vip_manage_level_simple_list(tenantId): Observable<any /*JResponse<VIPAItem[]>*/> {
    return this.post<any>(
      `${this._vipC}/vip_manage_level_simple_list`,
      {},
      { headers: this.getHeaders({ tenantId: String(tenantId) }) }
    );
  }
}
