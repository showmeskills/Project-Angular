import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseData } from '../interfaces/response.interface';
import {
  FullAuditRequest,
  RequestDocumentCallBack,
  RiskAssessmentRequest,
  RiskAuditFormRes,
  RiskAuditParam,
  RiskAuth,
  RiskForm,
  UploadCustomizeParams,
  UploadIdParams,
  UploadPaymentParams,
  UploadPoaParams,
  UploadSowParams,
  WealthSourceRequest,
} from '../interfaces/risk-control.interface';
import { BaseApi } from './base.api';
@Injectable({
  providedIn: 'root',
})
export class RiskControlApi extends BaseApi {
  private get riskUrl(): string {
    return `${environment.apiUrl}/v1/riskform/riskform`;
  }

  /**
   * 查询用户是否有待完成的风控表单
   *
   * @returns
   */
  getRiskFrom(): Observable<ResponseData<RiskForm[]>> {
    return this.get(`${this.riskUrl}/querynormalriskform`);
  }

  /**
   * 查询用户是否在风控列表中
   *
   * @returns
   */
  getRiskStatus(): Observable<ResponseData<boolean>> {
    return this.get(`${this.riskUrl}/queryriskabnormalmember`);
  }

  /**
   * 查询用户认证信息
   *
   * @returns
   */
  getRiskAuth(): Observable<ResponseData<RiskAuth[]>> {
    return this.get(`${this.riskUrl}/queryauthentication`);
  }

  /**
   * 获取最近一次审核的风控表单详情
   *
   * @param params
   * @returns
   */
  getLastAuditForm(params: RiskAuditParam): Observable<ResponseData<RiskAuditFormRes>> {
    return this.get(`${this.riskUrl}/getlastauditriskform`, params);
  }

  /**
   * 提交风险评估问卷
   *
   * @param params
   * @returns
   */
  submitRiskAssessment(params: RiskAssessmentRequest): Observable<ResponseData<boolean>> {
    return this.post(`${this.riskUrl}/submitriskassessment`, params);
  }

  /**
   * 提交财富来源证明
   *
   * @param params
   * @returns
   */
  submitWealthSource(params: WealthSourceRequest): Observable<ResponseData<boolean>> {
    return this.post(`${this.riskUrl}/submitwealthsource`, params);
  }

  /**
   * 提交全套审核
   *
   * @param params
   * @returns
   */
  submitFullAudit(params: FullAuditRequest): Observable<ResponseData<boolean>> {
    return this.post(`${this.riskUrl}/submitfullaudit`, params);
  }

  /**
   * 获取用户上传的文档  可以拿到我已经的材料状态; 补充材料信息
   */
  getRequestDocument(): Observable<RequestDocumentCallBack> {
    return this.get<ResponseData<RequestDocumentCallBack>>(`${this.riskUrl}/getrequestdocument`).pipe(
      map(v => v?.data || null)
    );
  }

  /**
   * 上传ID
   *
   * @param params
   */
  postUploadIdVerification(params: UploadIdParams): Observable<ResponseData<boolean>> {
    return this.post(`${this.riskUrl}/uploadidverification`, params);
  }

  /**
   * 上传POA
   *
   * @param params
   */
  postUploadPoaVerification(params: UploadPoaParams): Observable<ResponseData<boolean>> {
    return this.post(`${this.riskUrl}/uploadproofofaddress`, params);
  }

  /**
   * 上传支付方式
   *
   * @param params
   */
  postUploadPaymentMethod(params: UploadPaymentParams): Observable<ResponseData<boolean>> {
    return this.post(`${this.riskUrl}/uploadpaymentmethod`, params);
  }

  /**
   * 上传自定义文件
   *
   * @param params
   */
  postUploadCustomize(params: UploadCustomizeParams): Observable<ResponseData<boolean>> {
    return this.post(`${this.riskUrl}/uploadcustomize`, params);
  }

  /**
   * 补充财富证明
   *
   * @param params
   */
  postUploadSow(params: UploadSowParams): Observable<ResponseData<boolean>> {
    return this.post(`${this.riskUrl}/uploadsow`, params);
  }
}
