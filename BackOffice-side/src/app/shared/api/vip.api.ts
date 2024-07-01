import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { map } from 'rxjs/operators';
import { SubServiceBaseResponse } from 'src/app/shared/interfaces/base.interface';
import { CheckSvipItem } from 'src/app/shared/interfaces/member.interface';

@Injectable({
  providedIn: 'root',
})
export class VipApi extends BaseApi {
  private _vipA = `${environment.apiUrl}/vipa`;
  private _vipC = `${environment.apiUrl}/vipc`;
  private _assetUrl = `${environment.apiUrl}/asset/asset`;

  /**
   * 查询VIP综合资讯
   */
  getUserDetailsList(tenantId): Observable<any> {
    return this.post<any>(`${this._vipA}/manage_user_listdetails`, {}, { headers: this.getHeaders({ tenantId }) });
  }

  /**
   * VIPA - 用户升级记录
   */
  getLevelRecordList(params): Observable<any> {
    return this.post<any>(`${this._vipA}/manage_level_record_page`, params, {
      headers: this.getHeaders({ tenantId: params.tenantId }),
    });
  }

  /**
   * 等级配置 获取
   */
  getLevelConfigList(tenantId): Observable<any> {
    return this.post<any>(`${this._vipA}/manage_level_detail_list`, {}, { headers: this.getHeaders({ tenantId }) });
  }

  /**
   * 等级配置 更新
   */
  getLevelConfigUpdate(param, tenantId): Observable<any> {
    return this.post<any>(`${this._vipA}/manage_level_batchupdateinfo`, param, {
      headers: this.getHeaders({ tenantId }),
    });
  }

  /**
   * 基础配置 获取
   */
  getBasicConfigInfo(tenantId): Observable<any> {
    return this.post<any>(`${this._vipA}/manage_template_info`, {}, { headers: this.getHeaders({ tenantId }) });
  }

  /**
   * 基础配置 更新
   */
  getBasicConfigUpdate(param, tenantId): Observable<any> {
    return this.post<any>(`${this._vipA}/manage_template_updateinfo`, param, {
      headers: this.getHeaders({ tenantId }),
    });
  }

  /**
   * 福利总览
   */
  getVipOverview(param): Observable<any> {
    return this.get<any>(`${this._assetUrl}/vipoverview`, param);
  }

  /**
   * 福利领取记录
   */
  getVipReceiveDetail(param): Observable<any> {
    return this.get<any>(`${this._assetUrl}/vipreceivedetail`, param);
  }

  /**
   * VIPA - 邀请为SVIP （商户5 除外）
   */
  inviteSuperVip(param: { uid: string }[] = [], tenantId): Observable<any> {
    return this.post<any>(`${this._vipA}/svip_batchinvitetosvip`, param, { headers: this.getHeaders({ tenantId }) });
  }

  /**
   * VIPA - 页面检查是否可成为 SVIP
   * 用于 商户1、2... 除了商户5
   * /vipa/svip/batchIsCanInviteToSvip => /vipa/svip_batchiscaninvitetosvip
   */
  checkVIPASVip(tenantId: number | string, uidList: string[]): Observable<SubServiceBaseResponse<CheckSvipItem[]>> {
    return this.post<any>(
      `${this._vipA}/svip_batchiscaninvitetosvip`,
      { uidList },
      { headers: this.getHeaders({ tenantId }) }
    );
  }

  /**
   * VIPA - 取消SVIP (除了商户5)
   */
  cancelSVIP(tenantId: number | string, uidList: string[]): Observable<any> {
    return this.post<any>(
      `${this._vipA}/svip_batchcancelsvip`,
      { uidList },
      { headers: this.getHeaders({ tenantId }) }
    );
  }

  /**
   * VIPA - VIP用户信息
   */
  getVipUserInfoVIPA(params): Observable<any> {
    return this.post<any>(
      `${this._vipA}/manage_user_info`,
      { uid: params.uid },
      { headers: this.getHeaders({ tenantId: params.tenantId }) }
    ).pipe(map((res) => (res?.code === '0000' ? res?.data : null)));
  }

  /*****************************************************************************
   *                                商户5 - VIP Model C
   * 文档：http://newvip.ap-northeast-1.elasticbeanstalk.com/doc.html#/home
   ****************************************************************************/

  /**
   * VIPC等级详情
   * /api/v1/vip/vip_report_vipuser_summarybygrouplevel => /vip/report/vipUser/summaryByGroupLevel
   */
  summarybygrouplevel(params = {}, tenantId): Observable<any> {
    return this.post<any>(`${this._vipC}/vip_report_vipuser_summarybygrouplevel`, params, {
      headers: this.getHeaders({ tenantId }),
    });
  }

  /**
   * 页面检查是否可成为 SVIP
   * 用于 商户5
   * @Author: Ethon
   * @Documentation http://newvip.ap-northeast-1.elasticbeanstalk.com/doc.html#/default/VIP-SVIP%E7%AE%A1%E7%90%86/batchIsCanInviteToSvipUsingPOST
   */
  checkVIPCSVip(tenantId: number | string, uidList: string[]): Observable<SubServiceBaseResponse<CheckSvipItem[]>> {
    return this.post(
      `${this._vipC}/vip_svip_batchiscaninvitetosvip`,
      { uidList },
      { headers: this.getHeaders({ tenantId }) }
    );
  }

  /**
   * VIPA取消SVIP:商户5
   */
  cancelSVIPC(tenantId: number | string, uidList: string[]) {
    return this.post(`${this._vipC}/vip_svip_batchcancelsvip`, { uidList }, { headers: this.getHeaders({ tenantId }) });
  }

  /**
   * VIPC - 会员详情 - 查看商户5用户的VIP数据
   */
  getVipUserInfoVIPC(params): Observable<any> {
    return this.post<any>(
      `${this._vipC}/vip_manage_user_level_progress`,
      { uid: params.uid },
      { headers: this.getHeaders({ tenantId: params.tenantId }) }
    ).pipe(map((res) => (res?.code === '0000' ? res?.data : null)));
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

  /**
   * 获取VIP等级
   * TODO 【提款审核配置】未完成，有时间再加了，先采用用需求上做成输入的形式 - freeze 2023-10-13
   */
  getVipLevel(tenantId: number | string): Observable<any> {
    return this.appService.merchantService.isFiveMerchantFn(tenantId)
      ? this.vip_manage_level_simple_list(tenantId)
      : this.getLevelConfigList(tenantId);
  }

  /**
   * VIPC - 成长值配置 获取
   * /api/v1/vip/vip_manage_points_list => /vip/manage/points/list
   */
  vip_manage_points_list(params = {}, tenantId): Observable<any> {
    return this.post<any>(`${this._vipC}/vip_manage_points_list`, params, { headers: this.getHeaders({ tenantId }) });
  }

  /**
   * VIPC - 成长值配置 批量更新
   * /api/v1/vipc/vip_manage_points_batchupdateinfo => /vip/manage/points/batchUpdateInfo
   */
  vip_manage_points_batchupdateinfo(params = {}, tenantId): Observable<any> {
    return this.post<any>(`${this._vipC}/vip_manage_points_batchupdateinfo`, params, {
      headers: this.getHeaders({ tenantId }),
    });
  }

  /**
   * VIPA - 成长值配置 获取
   * /api/v1/vipa/manage_points_list => /vipa/manage/points/list
   */
  vipa_manage_points_list(params = {}, tenantId): Observable<any> {
    return this.post<any>(`${this._vipA}/manage_points_list`, params, { headers: this.getHeaders({ tenantId }) });
  }

  /**
   * VIPA - 成长值配置 批量更新
   * /api/v1/vipa/manage_points_batchupdateinfo => /vipa/manage/points/batchUpdateInfo
   */
  vipa_manage_points_batchupdateinfo(params = {}, tenantId): Observable<any> {
    return this.post<any>(`${this._vipA}/manage_points_batchupdateinfo`, params, {
      headers: this.getHeaders({ tenantId }),
    });
  }

  /**
   * 福利配置：基础配置 - 获取
   * /api/v1/vip/vip_manage_template_info => /vip/manage/template/info
   */
  vip_manage_template_info(params = {}, tenantId): Observable<any> {
    return this.post<any>(`${this._vipC}/vip_manage_template_info`, params, { headers: this.getHeaders({ tenantId }) });
  }

  /**
   * 福利配置：基础配置 - 更新
   * /api/v1/vip/vip_manage_template_updateinfo => /vip/manage/template/updateInfo
   */
  vip_manage_template_updateinfo(params = {}, tenantId): Observable<any> {
    return this.post<any>(`${this._vipC}/vip_manage_template_updateinfo`, params, {
      headers: this.getHeaders({ tenantId }),
    });
  }

  /**
   * 福利配置：等级配置 - 获取
   * /api/v1/vip/vip_manage_level_group_listlevelbygroup => /vip/report/vipUser/summaryByGroupLevel
   */
  listlevelbygroup(params = {}, tenantId): Observable<any> {
    return this.post<any>(`${this._vipC}/vip_manage_level_group_listlevelbygroup`, params, {
      headers: this.getHeaders({ tenantId }),
    });
  }

  /**
   * 福利配置：等级配置 - 更新
   * /api/v1/vip/vip_manage_level_batchupdateinfo => /vip/manage/level/batchUpdateInfo
   */
  batchupdateinfo(params = [], tenantId): Observable<any> {
    return this.post<any>(`${this._vipC}/vip_manage_level_batchupdateinfo`, params, {
      headers: this.getHeaders({ tenantId }),
    });
  }

  /**
   * VIPC - 会员列表：批量邀请会员（商户5）
   * /api/v1/vipc/vip_svip_batchinvitetosvip => /vip/svip/batchInviteToSvip
   */
  vip_svip_batchinvitetosvip(params: { uid: string }[] = [], tenantId): Observable<any> {
    return this.post<any>(`${this._vipC}/vip_svip_batchinvitetosvip`, params, {
      headers: this.getHeaders({ tenantId }),
    });
  }

  /**
   * VIPC - 会员详情：会员成长系统 - 积分记录列表（商户5）
   * 	/api/v1/vipc/vip_manage_points_record_list => /vip/manage/points/record/list
   */
  vipc_manage_points_record_list(params): Observable<any> {
    return this.post<any>(`${this._vipC}/vip_manage_points_record_list`, params, {
      headers: this.getHeaders({ tenantId: params.tenantId }),
    });
  }

  /**
   * VIPC - 会员详情：会员成长系统 - 升级记录列表（商户5）
   * 	/api/v1/vipc/vip_manage_level_record_list => /vip/manage/level/record/list
   */
  vipc_manage_level_record_list(params): Observable<any> {
    return this.post<any>(`${this._vipC}/vip_manage_level_record_list`, params, {
      headers: this.getHeaders({ tenantId: params.tenantId }),
    });
  }

  /**
   * VIPA - 会员详情：会员成长系统 - 积分记录列表（除商户5）
   * 	/api/v1/vipa/manage_points_record_page => /vipa/manage/points/record/page
   */
  vipa_manage_points_record_page(params): Observable<any> {
    return this.post<any>(`${this._vipA}/manage_points_record_page`, params, {
      headers: this.getHeaders({ tenantId: params.tenantId }),
    });
  }

  /**
   * VIPC - 会员详情:会员成长系统 - 积分统计（商户5）
   * 	/api/v1/vipc/vip_report_summarybypoints => /vip/report/summaryByPoints
   */
  vipc_report_summarybypoints(uid, tenantId): Observable<any> {
    return this.post<any>(
      `${this._vipC}/vip_report_summarybypoints`,
      { uid },
      { headers: this.getHeaders({ tenantId }) }
    );
  }

  /**
   * VIPA - 会员详情:会员成长系统 - 积分统计（除商户5）
   * 	/api/v1/vipa/manage_points_record_sum => /vipa/manage/points/record/sum
   */
  vipa_manage_points_record_sum(uid, tenantId): Observable<any> {
    return this.post<any>(
      `${this._vipA}/manage_points_record_sum`,
      { uid },
      { headers: this.getHeaders({ tenantId }) }
    );
  }

  /**
   * GoGaming - 福利一览 获取
   */
  benefitsoverview(params: any): Observable<any> {
    return this.get<any>(`${this._assetUrl}/benefitsoverview`, params);
  }
}
