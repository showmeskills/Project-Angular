import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import {
  AbnormalMemberItem,
  AbnormalMemberParams,
  CancelWagerAuditParams,
  DepositAppealHistoryParams,
  DepositAppealItem,
  DepositAppealParams,
  KYCReviewItem,
  KYCReviewParams,
  NegativeClearItem,
  OperationReviewItem,
  OperationReviewParams,
  RiskReviewList,
  RiskReviewParams,
  TransactionReviewItem,
} from 'src/app/shared/interfaces/monitor';
import { KYCProcessItem, KYCProcessParams, KYCReviewResponse } from '../interfaces/kyc';
import { HttpHeaders } from '@angular/common/http';
import { PageResponse } from 'src/app/shared/interfaces/base.interface';
import { BatchReviewListItem, BatchReviewListParams } from 'src/app/shared/interfaces/risk';

@Injectable({
  providedIn: 'root',
})
export class MonitorApi extends BaseApi {
  private _url = `${environment.apiUrl}/asset/appeal`;
  private _urlAdmin = `${environment.apiUrl}/admin/adminoperateaudit`;
  private _urlMember = `${environment.apiUrl}/member/negativeclear`;
  private _urlRisk = `${environment.apiUrl}/risk/riskform`;
  private _urlKyc = `${environment.apiUrl}/kyc`;

  /**
   * 获取最近申诉数据（监控使用）
   */
  getDepositAppeal(params: DepositAppealParams): Observable<PageResponse<DepositAppealItem>> {
    return this.get<any>(`${this._url}/gettxappealmonitordata`, params);
  }

  /**
   * 获取存提款申诉历史记录
   */
  getDepositAppealHistory(params: DepositAppealHistoryParams): Observable<PageResponse<DepositAppealItem>> {
    return this.get<any>(`${this._url}/getlist`, params);
  }

  /**
   * 获取 操作审核 列表数据（监控/历史记录）
   */
  getOperationReview(params: OperationReviewParams): Observable<PageResponse<OperationReviewItem>> {
    return this.get<any>(`${this._urlAdmin}/query`, params);
  }

  /**
   * 获取 操作审核 详情（监控/历史记录）
   */
  getReviewDetail(params: { orderId: string }): Observable<OperationReviewItem> {
    return this.get<any>(`${this._urlAdmin}/detail`, params);
  }

  /**
   *  操作审核&会员异常 - 审核
   */
  getAuditUpdateStatus(params: any): Observable<any> {
    return this.post<any>(`${this._urlAdmin}/updatestatus`, params);
  }

  /**
   *  获取 操作审核：负值清零 详情（监控/历史记录）
   */
  getAuditNegativeClearDetail(params: { orderId: string }): Observable<NegativeClearItem> {
    return this.get<any>(`${this._urlMember}/detail`, params);
  }

  /**
   *  操作审核: 审核 - 负值清零
   */
  updateAuditNegativeClearStatus(params: any): Observable<any> {
    return this.post<any>(`${this._urlMember}/updatenegativeclearstatus`, params);
  }

  /**
   *  获取 操作审核：会员异常 详情（监控/历史记录）
   */
  getAbnormalMember(params: AbnormalMemberParams): Observable<PageResponse<AbnormalMemberItem>> {
    return this.get<any>(`${this._urlAdmin}/queryabnormalmember`, params);
  }

  /**
   *  操作审核: 审核 - 会员异常
   */
  updateAbnormalMemberStatus(params: any): Observable<any> {
    return this.post<any>(`${this._urlAdmin}/updateabnormalmemberstatus`, params);
  }

  /**
   *  操作审核: 审核 - 调账
   */
  adjustWalletAudit(params: any): Observable<any> {
    return this.post<any>(`${this._urlAdmin}/adjustwalletaudit`, params);
  }

  /**
   *  操作审核: 审核 - 重置手机号码
   */
  resetBindMobileAudit(params: any): Observable<any> {
    return this.post<any>(`${this._urlAdmin}/resetbindmobileaudit`, params);
  }

  /**
   *  操作审核: 审核 - 取消注单
   */
  cancelWagerAudit(params: CancelWagerAuditParams): Observable<any> {
    return this.post<any>(`${this._urlAdmin}/cancelwageraudit`, params);
  }

  /**
   *  操作审核: 审核 - 发放优惠券
   */
  couponGrantAudit(params: any): Observable<any> {
    return this.post<any>(`${this._urlAdmin}/coupongrantaudit`, params);
  }

  /**
   *  操作审核: 审核 - 上架/下架 优惠券
   */
  couponUpDownAudit(params: any): Observable<any> {
    return this.post<any>(`${this._urlAdmin}/couponupdownaudit`, params);
  }

  /**
   * 法币存款申请详情
   */
  getCurrencyAppealbyId(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getcurrencyappealbyid`, params);
  }

  /**
   * 虚拟币存款申请详情
   */
  getCoinAppealbyId(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getcoinappealbyid`, params);
  }

  /**
   * 审核申诉
   */
  updateAppeal(params: any): Observable<any> {
    return this.post<any>(`${this._url}/updateappeal`, params);
  }

  /**
   *用于会员列表的风控问卷和财富来源证明的数据展示
   */
  queryAllRiskForm(params: any): Observable<any> {
    return this.get<any>(`${this._urlRisk}/queryallriskform`, params);
  }

  /**
   *分页获取风控审核记录
   */
  queryPageRiskForm(params: RiskReviewParams): Observable<PageResponse<RiskReviewList>> {
    return this.get<any>(`${this._urlRisk}/queryriskform`, params);
  }

  /**
   *审核风控表单（含欧洲高级KYC审核）
   */
  auditRiskForm(params: any): Observable<any> {
    return this.post<any>(`${this._urlRisk}/auditriskform`, params);
  }

  /**
   *获取最近的一次审核通过的表单详情
   */
  getLastRisk(params: any): Observable<any> {
    return this.get<any>(`${this._urlRisk}/getlastapprovedriskform`, params);
  }

  /**
   *创建风险评估问卷
   */
  addRiskAssessmentForm(params: any): Observable<any> {
    return this.post<any>(`${this._urlRisk}/addriskassessmentform`, params);
  }

  /**
   *创建财富来源证明
   */
  addWealthSourceForm(params: any): Observable<any> {
    return this.post<any>(`${this._urlRisk}/addwealthsourceform`, params);
  }

  /**查询是否有正在进行中的审核 */
  queryProgressRisk(params: any): Observable<any> {
    return this.get<any>(`${this._urlRisk}/queryprogressriskform`, params);
  }

  /** 身份认证 - 发送文件请求 */
  requestdocument(params: any): Observable<any> {
    return this.post<any>(`${this._urlRisk}/requestdocument`, params);
  }

  /** 身份认证:中级(欧洲) - 发起升级请求 */
  requestintermediate(uid: any): Observable<any> {
    return this.post<any>(`${this._urlRisk}/requestintermediate`, { uid });
  }

  /** 身份认证:中级(欧洲) - 获取ID和POA提交信息 */
  queryrequestdocument(uid: any): Observable<any> {
    return this.get<any>(`${this._urlRisk}/queryrequestdocument`, { uid });
  }

  /** 身份认证:高级(欧洲) - 发起验证请求 */
  requestadvanced(uid: any): Observable<any> {
    return this.post<any>(`${this._urlRisk}/requestadvanced`, { uid });
  }

  /** KYC审核详情 (欧洲：高) */
  queryauthenticate(params: any): Observable<any> {
    return this.get<any>(`${this._urlRisk}/queryauthenticate`, params);
  }

  /** 查询当前用户KYC等级 */
  getcurrentkyclevel(uid: any): Observable<any> {
    return this.get<any>(`${this._urlRisk}/getcurrentkyclevel`, { uid });
  }

  /** 身份认证 - 发送文件请求：查询可以发送的类型（欧洲） */
  getrequestdocumenttype(uid: any): Observable<any> {
    return this.get<any>(`${this._urlRisk}/getrequestdocumenttype`, { uid });
  }

  /** 身份认证 - 发送风险评估问卷(EDD)请求（欧洲） */
  sendRequestedd(uid: any): Observable<any> {
    return this.post<any>(`${this._urlRisk}/requestedd`, { uid });
  }

  /**
   * KYC审核列表 (ehton: 不含欧洲高级KYC)
   */
  postProcessNormal(params: KYCProcessParams, tenantId: any): Observable<KYCReviewResponse<KYCProcessItem>> {
    return this.post(`${this._urlKyc}/process_normal`, params, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Bearer ${this.localStorageService.token}`,
        entityId: 'all',
        clientKey: tenantId,
      }),
    });
  }

  /** KYC审核列表（durk） */
  querykycprocess(params: KYCReviewParams): Observable<PageResponse<KYCReviewItem>> {
    return this.get<any>(`${this._urlRisk}/querykycprocess`, params);
  }

  /**
   * KYC审核详情 (亚洲：初/中/高)
   * @returns Observable<any>
   */
  postProcessDetail(processId: any, tenantId: any): Observable<any> {
    return this.post(
      `${this._urlKyc}/process_detail`,
      { processId },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json;charset=utf-8',
          Authorization: `Bearer ${this.localStorageService.token}`,
          entityId: 'all',
          clientKey: tenantId,
        }),
      }
    );
  }

  /**
   * KYC审核详情 (欧洲：中)
   * @returns Observable<any>
   */
  kyc_manage_eu_approve_detail(parmas: any): Observable<any> {
    return this.post(
      `${this._urlKyc}/kyc_manage_eu_approve_detail`,
      { processId: parmas.processId, kycType: parmas.kycType },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json;charset=utf-8',
          Authorization: `Bearer ${this.localStorageService.token}`,
          entityId: parmas.uid || 'all',
          clientKey: parmas.tenantId,
        }),
      }
    );
  }

  /**
   * KYC审核（除欧洲高级KYC）
   * @returns Observable<any>
   */
  kycProcessaudit(params: any): Observable<any> {
    return this.post<any>(`${this._urlRisk}/processaudit`, params);
  }

  /**
   * KYC审核 - 中国中级认证失败，人工审核
   * @returns Observable<any>
   */
  updateintermediatekycstatus(parmas: any): Observable<any> {
    return this.post(
      `${this._urlAdmin}/updateintermediatekycstatus`,
      {
        processId: String(parmas.processId),
        processState: String(parmas.processState),
        remark: parmas.remark,
        uid: parmas.uid,
      },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json;charset=utf-8',
          Authorization: `Bearer ${this.localStorageService.token}`,
          entityId: parmas.uid || 'all',
          clientKey: parmas.tenantId,
        }),
      }
    );
  }

  /**
   * 获取批量审核列表
   * @param params {BatchReviewListParams}
   * @return Observable<PageResponse<BatchReviewListItem>>
   */
  getBatchReviewList(params: BatchReviewListParams): Observable<PageResponse<BatchReviewListItem>> {
    return this.get<any>(`${this._urlRisk}/getbatchreviewlist`, params);
  }

  /**
   * 获取 返水审核 列表数据（监控/历史记录）
   */
  getTransactionReview(params: OperationReviewParams): Observable<PageResponse<TransactionReviewItem>> {
    return this.get<any>(`${this._urlAdmin}/gettransactionaudit`, params);
  }

  /**
   * 获取 返水审核 详情（监控/历史记录）
   */
  getTransactionReviewDetail(params: { orderId: string }): Observable<TransactionReviewItem> {
    return this.get<any>(`${this._urlAdmin}/detail`, params);
  }

  /**
   *  返水审核 审批
   */
  updateAddtransactionaudit(params: any): Observable<any> {
    return this.post<any>(`${this._urlAdmin}/addtransactionaudit`, params);
  }
}
