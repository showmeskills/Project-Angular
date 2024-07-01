import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { HttpHeaders } from '@angular/common/http';
import { KYCProcessItem, KYCProcessParams, KYCReportParams, KYCReviewResponse } from 'src/app/shared/interfaces/kyc';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { KycService } from 'src/app/pages/kyc/kyc.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class KycApi extends BaseApi {
  private _url = `${environment.apiUrl}/kyc`;
  private _urlSettings = `${environment.apiUrl}/settings/kycsettings`;

  protected subHeader = inject(SubHeaderService);
  protected kycService = inject(KycService);

  kycPost<T = any>(url: string, params?: any, uid?: string, tenantId?: string, config?: any): Observable<T> {
    params = params || {};

    // TODO 暂时写死，Ring不让Parker新增字段（这里最好在商户新增一个配置来决定是否区分）
    // 商户1的时候需要区分大洲地区
    if (+this.subHeader.merchantCurrentId === 1) {
      params.region = this.kycService.curRegion;
    }

    return this.post(url, params, {
      ...config,
      headers: new HttpHeaders({
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Bearer ${this.localStorageService.token}`,
        entityId: uid || 'all',
        clientKey: this.subHeader.merchantCurrentId || tenantId,
        ...(config?.headers || {}),
      }),
    });
  }

  /**
   * 第三方调用统计
   * @returns Observable<any>
   */
  postReportCallthird(params: any): Observable<any> {
    return this.kycPost<any>(`${this._url}/report_callthird`, params);
  }

  /**
   * 国家分析
   * @returns Observable<any>
   */
  postReportCountrysum(params: any): Observable<any> {
    return this.kycPost(`${this._url}/report_countrysum`, params).pipe(map((e) => (Array.isArray(e) ? e : [])));
  }

  /**
   * 成功认证分析
   * @returns Observable<any>
   */
  postReportSucceedcount(params: any): Observable<any> {
    return this.kycPost(`${this._url}/report_succeedcount`, params).pipe(map((e) => (Array.isArray(e) ? e : [])));
  }

  /**
   * 所有认证分析 - 报表
   * @returns Observable<any>
   */
  postReportAllcount(params: Partial<KYCReportParams>): Observable<any> {
    return this.kycPost(`${this._url}/report_allcount`, params);
  }

  /**
   * 审核管理验证分页
   * @returns Observable<any>
   */
  postProcessNormal(params: KYCProcessParams): Observable<KYCReviewResponse<KYCProcessItem>> {
    return this.kycPost(`${this._url}/process_normal`, params);
  }

  /**
   * 审核管理-人工审批流程 （废弃）
   * @returns Observable<any>
   */
  postProcessAudit(params: any, uid: string): Observable<any> {
    return this.kycPost<any>(`${this._url}/process_audit`, params, uid);
  }

  /**
   * 审核管理-查询用户提交详情 日志 ID 或者 流程 ID 一次只能提交一个
   * @returns Observable<any>
   */
  postProcessDetail(params: any): Observable<any> {
    return this.kycPost(`${this._url}/process_detail`, params);
  }

  /**
   * 审核管理- 查询第三方返回详情 日志 ID 或者 流程 ID 一次只能提交一个
   * @returns Observable<any>
   */
  postProcessThirdDetail(params: any): Observable<any> {
    return this.kycPost(`${this._url}/process_third_detail`, params);
  }

  /**
   * 会员详情- KYC身份验证信息 (亚洲:初/中/高级)
   * @returns Observable<any>
   */
  postProcessEntitiesDetail(kycType: number, uid: any, tenantId?: any): Observable<any> {
    return this.kycPost(`${this._url}/kyc_manage_process_entities_detail`, { kycType }, uid, tenantId);
  }

  /**
   * 会员详情- KYC身份验证信息 (欧洲:中级)
   * @returns Observable<any>
   */
  kyc_manage_eu_approve_detail(kycType: number, uid: any, tenantId?: any): Observable<any> {
    return this.kycPost<any>(`${this._url}/kyc_manage_eu_approve_detail`, { kycType }, uid, tenantId);
  }

  /**
   * 取得KYC配置管理列表
   */
  getKycSettinglist(tenantId: string): Observable<any> {
    return this.get<any>(`${this._urlSettings}/getkycsettinglist?tenantId=${tenantId}`);
  }

  /**
   * 取得KYC配置明细
   */
  getkycsettingdetail(params: any): Observable<any> {
    return this.get<any>(`${this._urlSettings}/getkycsettingdetail`, params);
  }

  /**
   * 更新KYC配置明细
   */
  updatekycsetting(params: any): Observable<any> {
    return this.post<any>(`${this._urlSettings}/updatekycsetting`, params);
  }
}
