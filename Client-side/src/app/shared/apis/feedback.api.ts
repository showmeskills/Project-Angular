import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  CreateFeedbackParams,
  FeedbackDetail,
  FeedbackOptionList,
  FeedbackRecord,
} from '../interfaces/feedback.interface';
import { ResponseData, ResponseListData } from '../interfaces/response.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class FeedbackApi extends BaseApi {
  private get url(): string {
    return `${environment.apiUrl}/v1/sitemail/userfeedback`;
  }

  /**
   * 查询用户反馈记录
   *
   * @param page 当前页
   * @param pageSize 每页大小
   * @returns FeedbackRecord[]
   */
  getFeedbackRecord(page: number, pageSize: number): Observable<ResponseListData<FeedbackRecord[]>> {
    return this.get(`${this.url}/query`, { page, pageSize });
  }

  /**
   * 查询记录详情
   *
   * @param id 要查询的记录id
   * @returns FeedbackDetail
   */
  getFeedbackDetail(id: number): Observable<ResponseData<FeedbackDetail>> {
    return this.get(`${this.url}/get`, { id });
  }

  /**
   * 新增记录
   *
   * @param params 参数
   * @returns
   */
  getCreate(params: CreateFeedbackParams): Observable<ResponseData<boolean>> {
    return this.post(`${this.url}/create`, params);
  }

  /**
   * 获取建议类型/产品类型/客户端类型列表
   *
   * @returns FeedbackOptionList
   */
  getOptionList(): Observable<ResponseData<FeedbackOptionList>> {
    return this.get(`${this.url}/getoptionlist`);
  }
}
