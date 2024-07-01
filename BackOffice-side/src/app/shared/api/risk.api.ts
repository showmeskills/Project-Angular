import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { CodeDescription, PageResponse } from 'src/app/shared/interfaces/base.interface';
import { catchError, map, tap } from 'rxjs/operators';
import {
  BatchAdjustmentParams,
  BatchListItem,
  BatchListParams,
  BatchProhibitedParams,
  BatchRemarkInfo,
  BatchReviewParams,
  BatchSubmitResponse,
  FingerprintDetialItem,
  FingerprintItem,
  RiskControlConfig,
  RiskControlConfigParams,
  RiskLevelItem,
  UploadIdVerificationParams,
  WinnerTopByDateItem,
  WinnerTopByDateParams,
  WinnerTopByProviderItem,
  WinnerTopByProviderParams,
  WinnerTopByUserItem,
  WinnerTopByUserParams,
  WinnerTopResponse,
} from 'src/app/shared/interfaces/risk';
import { downloadExcelFile } from 'src/app/shared/models/tools.model';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RiskApi extends BaseApi {
  private _riskUrl = `${environment.apiUrl}/risk`;
  private _url = `${environment.apiUrl}/risk/config`;
  private readonly _winnerTop = `${environment.apiUrl}/asset/winnerreport`;

  /**
   * 获取 风控规则配置
   */
  getRiskAuditConfig(): Observable<any> {
    return this.get<any>(`${this._url}/getriskauditconfig`);
  }

  /**
   * 更新 风控规则配置
   */
  updateRiskAuditConfig(params: any): Observable<any> {
    return this.post<any>(`${this._url}/updateriskauditconfig`, params);
  }

  /**
   * 获取 信用积分配置
   */
  getAllScoreConfigs(): Observable<any> {
    return this.get<any>(`${this._url}/getallscoreconfigs`);
  }

  /**
   * 更新 信用积分配置
   */
  updateScoreConfig(params: any): Observable<any> {
    return this.post<any>(`${this._url}/updateallscoreconfig`, params);
  }

  /**
   * 获取 信用等级配置
   */
  getAllLevelConfigs(): Observable<any> {
    return this.get<any>(`${this._url}/getalllevelconfigs`);
  }

  /**
   * 更新 信用等级配置
   */
  updateLevelConfig(params: any): Observable<any> {
    return this.post<any>(`${this._url}/updatealllevelconfig`, params);
  }

  /**
   * 获取 审核的文件类型
   */
  getReviewFileSelect(): Observable<CodeDescription[]> {
    return this.get<any>(`${this._riskUrl}/riskform/getriskformselect`).pipe(
      map((e) => (Array.isArray(e) ? e : [])),
      catchError(() => of([]))
    );
  }

  /*****************************************************************************
   *                                待补充列表
   * 文档：https://gbd730.atlassian.net/wiki/spaces/Gaming/pages/2357231649
   ****************************************************************************/

  /**
   * 查询待补充的文件列表
   */
  querynormalriskform(params: any): Observable<any> {
    return this.get<any>(`${this._riskUrl}/riskform/querynormalriskform`, params);
  }

  /**
   * 补充 发送文件请求 - ID
   */
  uploadidverification(params: UploadIdVerificationParams): Observable<boolean> {
    return this.post<any>(`${this._riskUrl}/riskform/uploadidverification`, params);
  }

  /**
   * 补充 发送文件请求 - POA
   */
  uploadproofofaddress(params: any): Observable<any> {
    return this.post<any>(`${this._riskUrl}/riskform/uploadproofofaddress`, params);
  }

  /**
   * 补充 发送文件请求 - 支付方式
   */
  uploadpaymentmethod(params: any): Observable<any> {
    return this.post<any>(`${this._riskUrl}/riskform/uploadpaymentmethod`, params);
  }

  /**
   * 补充 发送文件请求 - 自定义
   */
  uploadcustomize(params: any): Observable<any> {
    return this.post<any>(`${this._riskUrl}/riskform/uploadcustomize`, params);
  }

  /**
   * 补充 发送文件请求 - 财富来源证明
   */
  uploadsow(params: any): Observable<any> {
    return this.post<any>(`${this._riskUrl}/riskform/uploadsow`, params);
  }

  /**
   * 补充 EDD（风险评估问卷）
   */
  submitedd(params: any): Observable<any> {
    return this.post<any>(`${this._riskUrl}/riskform/submitedd`, params);
  }

  /**
   * 补充 欧洲中级KYC - ID
   */
  intermediateidcardforeu(params: any): Observable<any> {
    return this.post<any>(`${this._riskUrl}/riskform/intermediateidcardforeu`, params);
  }

  /**
   * 补充 欧洲中级KYC - POA
   */
  intermediatepoaforeu(params: any): Observable<any> {
    return this.post<any>(`${this._riskUrl}/riskform/intermediatepoaforeu`, params);
  }

  /**
   * 补充 欧洲高级KYC
   */
  kycadvancedforeu(params: any): Observable<any> {
    return this.post<any>(`${this._riskUrl}/riskform/kycadvancedforeu`, params);
  }

  /*****************************************************************************
   *                                批量上传
   ****************************************************************************/
  /**
   * 批量上传备注excel
   * @param tenantId
   * @param file
   * @param config
   */
  uploadRemarkFile(tenantId: number | string, file: File, config: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.post<any>(`${this._riskUrl}/riskform/uploadremarkfile?tenantId=${tenantId}`, formData, {
      headers: new HttpHeaders({
        lang: this.langService.currentLang?.toLowerCase(),
        Authorization: `Bearer ${this.localStorageService.token}`,
      }),
      ...config,
    });
  }

  /**
   * 批量上传风控excel
   * @param tenantId
   * @param file
   * @param config
   */
  uploadRiskFile(tenantId: number | string, file: File, config: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.post<any>(`${this._riskUrl}/riskform/uploadriskfile?tenantId=${tenantId}`, formData, {
      headers: new HttpHeaders({
        lang: this.langService.currentLang?.toLowerCase(),
        Authorization: `Bearer ${this.localStorageService.token}`,
      }),
      ...config,
    });
  }

  /**
   * 批量上传禁用excel
   * @param tenantId
   * @param file
   * @param config
   */
  uploadProhibitedFile(tenantId: number | string, file: File, config: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.post<any>(`${this._riskUrl}/riskform/uploadprohibitedfile?tenantId=${tenantId}`, formData, {
      headers: new HttpHeaders({
        lang: this.langService.currentLang?.toLowerCase(),
        Authorization: `Bearer ${this.localStorageService.token}`,
      }),
      ...config,
    });
  }

  /**
   * 下载批量模板
   * @param type 1:批量备注，2：批量风控 3：批量禁止
   */
  downBatchTemplate(type: 1 | 2 | 3): Observable<any> {
    return this.get<any>(
      `${this._riskUrl}/riskform/downbatchtemplate`,
      { type },
      {
        headers: this.getHeaders({ 'Content-Type': '' }),
        responseType: 'blob',
      }
    ).pipe(
      map((res) => {
        if (!res) return false;

        downloadExcelFile(res, `batchTemplate_${type} ${Date.now()}.xlsx`);
        return true;
      }),
      catchError(() => of(false)),
      tap((res) => {
        res !== true && this.appService.showToastSubject.next({ msgLang: 'member.coupon.model.downloadFailed' });
      })
    );
  }

  /**
   * 提交批量备注
   * @param tenantId
   * @param batchID
   * @param info
   */
  addBatchRemark(tenantId: number | string, batchID: string, info: BatchRemarkInfo[]): Observable<BatchSubmitResponse> {
    return this.post<any>(`${this._riskUrl}/riskform/addbatchremark`, { tenantId: +tenantId, batchID, info });
  }

  /**
   * 批量禁止提交
   */
  addBatchProhibited(params: BatchProhibitedParams): Observable<BatchSubmitResponse> {
    return this.post<any>(`${this._riskUrl}/riskform/addbatchprohibited`, params);
  }

  /**
   * 提交批量风控
   * @param tenantId
   * @param batchID
   * @param info
   */
  addBatchRisk(tenantId: number | string, batchID: string, info: BatchRemarkInfo[]): Observable<BatchSubmitResponse> {
    return this.post<any>(`${this._riskUrl}/riskform/addbatchrisk`, { tenantId: +tenantId, batchID, info });
  }

  /**
   * 批量调账提交
   */
  addBatchAdjustment(params: BatchAdjustmentParams): Observable<BatchSubmitResponse> {
    return this.post<any>(`${this._riskUrl}/riskform/batchadjustment`, params);
  }

  /**
   * 批量状态列表
   */
  getBatchList(params: BatchListParams): Observable<PageResponse<BatchListItem>> {
    return this.get<any>(`${this._riskUrl}/riskform/getbatchlist`, params);
  }

  /**
   * 批量类型下拉
   */
  getBatchTypeSelect(): Observable<CodeDescription[]> {
    return this.get<any>(`${this._riskUrl}/riskform/getbatchtypeselect`, {}).pipe(catchError(() => of([])));
  }

  /**
   * 批量状态下拉
   */
  getBatchStatusSelect(): Observable<CodeDescription[]> {
    return this.get<any>(`${this._riskUrl}/riskform/getbatchstatusselect`, {}).pipe(catchError(() => of([])));
  }

  /**
   * 批量审核提交
   */
  batchReview(params: BatchReviewParams): Observable<boolean | Error> {
    return this.post<any>(`${this._riskUrl}/riskform/addbatchreview`, params);
  }

  /**
   * 批量调账审核提交
   */
  batchReviewAdjustment(params: BatchReviewParams): Observable<boolean | Error> {
    return this.post<any>(`${this._riskUrl}/riskform/batchadjustwalletaudit`, params);
  }

  /*****************************************************************************
   *                                IP监控
   * 文档：https://gbd730.atlassian.net/wiki/spaces/Gaming/pages/2406744369/IP
   ****************************************************************************/

  /**
   * IP监控 - 列表
   */
  getiplist(params): Observable<any> {
    return this.get<any>(`${this._riskUrl}/ipmonitoring/getiplist`, params);
  }

  /**
   * IP监控详情 - 列表
   */
  getuseriplist(params): Observable<any> {
    return this.get<any>(`${this._riskUrl}/ipmonitoring/getuseriplist`, params);
  }

  /**
   * 用户IP详情
   */
  getuseripdetail(params): Observable<any> {
    return this.get<any>(`${this._riskUrl}/ipmonitoring/getuseripdetail`, params);
  }

  /**
   * 最优胜的用户报表 - 会员最优胜列表
   */
  innerTopByMember(params: WinnerTopByUserParams): Observable<WinnerTopResponse<WinnerTopByUserItem>> {
    return this.get<any>(`${this._winnerTop}/winnertop`, params);
  }

  /**
   * 最优胜的厂商报表
   */
  innerTopByProvider(params: WinnerTopByProviderParams): Observable<WinnerTopResponse<WinnerTopByProviderItem>> {
    return this.get<any>(`${this._winnerTop}/providerlist`, params);
  }

  /**
   * 最优胜日期报表
   */
  innerTopByDate(params: WinnerTopByDateParams): Observable<WinnerTopResponse<WinnerTopByDateItem>> {
    return this.get<any>(`${this._winnerTop}/datelist`, params);
  }

  /** 获取风控配置 */
  getRiskControlConfig(params: { tenantId: string }): Observable<RiskControlConfig> {
    return this.get(`${this._riskUrl}/riskcontrolconfig/getriskcontrolconfig`, params);
  }

  /** 获取风控配置 */
  getRiskControlSelect(tenantId: string): Observable<RiskLevelItem[]> {
    return this.get<RiskLevelItem[]>(
      `${this._riskUrl}/riskcontrolconfig/getriskcontrolselect`,
      { tenantId },
      {
        skipThrowError: true,
      }
    ).pipe(
      map((res) => (Array.isArray(res) ? res : [])),
      catchError(() => of([] as RiskLevelItem[]))
    );
  }

  /** 提交风控配置 */
  updateRiskControlConfig(params: RiskControlConfigParams): Observable<boolean> {
    return this.post(`${this._riskUrl}/riskcontrolconfig/updateriskcontrolconfig`, params);
  }

  /**
   * 设备指纹 - 列表
   */
  getdevicefingerprintlist(params): Observable<PageResponse<FingerprintItem>> {
    return this.get<any>(`${this._riskUrl}/ipmonitoring/getdevicefingerprintlist`, params);
  }

  /**
   * 设备指纹 - 详情列表
   */
  getdevicefingerprintdetail(params): Observable<PageResponse<FingerprintDetialItem>> {
    return this.get<any>(`${this._riskUrl}/ipmonitoring/getdevicefingerprintdetail`, params);
  }
}
