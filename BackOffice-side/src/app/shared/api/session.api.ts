import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import {
  EditSessionTopicParams,
  IMUpload,
  MassMsgParams,
  SetSessionTopicParams,
  TopicCategory,
  TopicCategoryAll,
  TopicItem,
  SinglePageListParams,
  SinglePageListItem,
  getMsgSingleParams,
  SessionMsgBase,
  SensitiveLexiconItem,
  AllPageListParams,
  AllPageListItem,
  getMsgAllParams,
  Comm100ApiPayloads,
  Comm100List,
} from 'src/app/shared/interfaces/session';
import { JPage, JResponse } from 'src/app/shared/interfaces/base.interface';
import { catchError, map } from 'rxjs/operators';
import { downloadExcelFile } from 'src/app/shared/models/tools.model';
import { uploadOperator } from 'src/app/shared/components/upload/upload.component';
import { Upload } from 'src/app/shared/interfaces/upload';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SessionApi extends BaseApi {
  private _url = `${environment.apiUrl}/im`;
  private _imapi = `/im/api`;
  private _generalapi = `${environment.apiUrl}`;

  /**
   * 设置响应过滤器
   * @private
   */
  #_ = (() => this.setContentFilter((res: JResponse) => (res instanceof Blob ? true : +res.code === 0)))();

  /**
   * IM上传文件
   */
  IMUpload(file: File): Observable<IMUpload> {
    const url = `${this._imapi}/file/upload`;
    const data = new FormData();
    data.append('file', file);
    data.append('type', '2');
    data.append('token', this.localStorageService.token || '');

    const initUploadValue: Upload<JResponse<{ fid: string }> | undefined> = {
      state: 'PENDING',
      progress: 0,
      loaded: 0,
      total: file.size,
    };

    return this.post<any>(url, data, {
      headers: new HttpHeaders({
        'ngsw-bypass': 'true',
      }),
      skipContentFilter: true,
      observe: 'events',
      reportProgress: true,
    }).pipe(
      uploadOperator(initUploadValue),
      switchMap((res) =>
        ['DONE'].includes(res.state) && +res.body?.code! === 0 && Object.keys(res.body?.data || {}).length
          ? of({ success: true, file, upload: res, data: res.body!.data }) /*.pipe(delay(this.stateDelay))*/ // 完成或失败延迟等待样式展现后再发射值给订阅者操作
          : of({ success: false, file, upload: res, data: null })
      ),
      catchError(() =>
        of({
          success: false,
          file,
          upload: { state: 'FAILED', progress: 0 } as Upload,
          data: null,
        })
      )
    );
  }

  /**
   * 获取历史记录
   */
  getMsg(tenantId: string, params: getMsgSingleParams): Observable<JPage<SessionMsgBase>> {
    return this.post<any>(`${this._url}/msghis_single_details_page`, params, {
      headers: this.getHeaders({ tenantId }),
    });
  }

  /**
   * 批量发送消息
   */
  batchSend(tenantId: string, params: MassMsgParams): Observable<any> {
    params.asset = (params.asset || []).map((e) => {
      const res = { ...e };
      delete res.isLoaded;
      delete res['coverUrl'];
      delete res.url;

      return res;
    });
    return this.post<any>(`${this._url}/msg_batchsend_v1`, params, {
      headers: this.getHeaders({ tenantId }),
    });
  }

  /**
   * 话题类别查询
   */
  getTopicCategory(tenantId?: string): Observable<JResponse<TopicCategory[]>> {
    tenantId = tenantId || this.appService.merchantService.currentMerchantId;
    return this.post<any>(
      `${this._url}/category_query`,
      {},
      {
        headers: this.getHeaders({ tenantId }),
      }
    );
  }

  /**
   * 话题查询
   * @param categoryId
   * @param tenantId
   */
  getTopic(categoryId: string | null, tenantId?: string): Observable<JResponse<TopicItem[]>> {
    tenantId = tenantId || this.appService.merchantService.currentMerchantId;
    return this.post<any>(`${this._url}/subject_query`, categoryId ? { categoryId } : {}, {
      headers: this.getHeaders({ tenantId }),
    });
  }

  /**
   * 设置会话话题
   * @param params {SetSessionTopicParams}
   * @param tenantId
   */
  setSessionTopic(params: SetSessionTopicParams, tenantId?: string): Observable<JResponse<SetSessionTopicParams>> {
    tenantId = tenantId || this.appService.merchantService.currentMerchantId;
    return this.post<any>(`${this._url}/chat_topic_setup`, params, {
      headers: this.getHeaders({ tenantId }),
    });
  }

  /**
   * 修改会话话题
   * @param params {SetSessionTopicParams}
   * @param tenantId
   */
  editSessionTopic(params: EditSessionTopicParams, tenantId?: string): Observable<JResponse<SetSessionTopicParams>> {
    tenantId = tenantId || this.appService.merchantService.currentMerchantId;
    return this.post<any>(`${this._url}/chat_topic_modify`, params, {
      headers: this.getHeaders({ tenantId }),
    });
  }

  /**
   * 重置会话话题
   * @param topicId
   * @param uid string
   * @param tenantId
   */
  resetSessionTopic(topicId: number, uid: string, tenantId?: string): Observable<JResponse<SetSessionTopicParams>> {
    tenantId = tenantId || this.appService.merchantService.currentMerchantId;
    return this.post<any>(
      `${this._url}/chat_topic_reset`,
      { topicId, uid },
      {
        headers: this.getHeaders({ tenantId }),
      }
    );
  }

  /**
   * 单次对话记录
   */
  getSinglePageList(params: SinglePageListParams, tenantId?: string): Observable<JResponse<SinglePageListItem>> {
    tenantId = tenantId || this.appService.merchantService.currentMerchantId;
    return this.post<any>(`${this._url}/single_page_list`, params, {
      headers: this.getHeaders({ tenantId }),
    });
  }

  /**
   * 单次对话记录导出
   */
  exportSingle(topicId: number[]): Observable<any> {
    const timezone = 0 - new Date().getTimezoneOffset() / 60;
    return this.post<any>(
      `${this._url}/file/single_export`,
      { topicId, timeZone: timezone },
      {
        responseType: 'blob',
        headers: this.getHeaders({
          tenantId: this.appService.merchantService.currentMerchantId,
        }),
      }
    ).pipe(
      map((res: any) => {
        downloadExcelFile(res, `single-export - ${Date.now()}.xlsx`);
        return true;
      })
    );
  }

  /*
   * 话题级联查询
   * @param merchantId
   */
  getTopicAll(tenantId?: string): Observable<JResponse<TopicCategoryAll[]>> {
    tenantId = tenantId || this.appService.merchantService.currentMerchantId;
    return this.post<any>(
      `${this._url}/catesubj_query`,
      {},
      {
        headers: this.getHeaders({ tenantId }),
      }
    );
  }

  /**
   * 敏感词汇 - 编辑
   */
  sensitive_update(params): Observable<JResponse<boolean>> {
    return this.post<any>(
      `${this._url}/sensitive_update`,
      { sensList: params.sensList },
      {
        headers: this.getHeaders({ tenantId: params.tenantId }),
      }
    );
  }

  /**
   * 敏感词汇 - 获取
   */
  sensitive_query(tenantId): Observable<JResponse<SensitiveLexiconItem[]>> {
    return this.post<any>(
      `${this._url}/sensitive_query`,
      {},
      {
        headers: this.getHeaders({ tenantId }),
      }
    );
  }

  /**
   * 全部对话记录	POST	/api/v1/im/all_page_list
   */
  getAllPageList(params: AllPageListParams, tenantId?: string): Observable<JResponse<AllPageListItem>> {
    tenantId = tenantId || this.appService.merchantService.currentMerchantId;
    return this.post<any>(`${this._url}/all_page_list`, params, {
      headers: this.getHeaders({ tenantId }),
    });
  }

  /**
   * 全部对话记录导出	POST	/api/v1/im/file/all_export
   */
  exportAllPage(id: number[]): Observable<any> {
    const timezone = 0 - new Date().getTimezoneOffset() / 60;
    return this.post<any>(
      `${this._url}/file/all_export`,
      { id, timeZone: timezone },
      {
        responseType: 'blob',
        headers: this.getHeaders({
          tenantId: this.appService.merchantService.currentMerchantId,
        }),
      }
    ).pipe(
      map((res: any) => {
        downloadExcelFile(res, `all-export - ${Date.now()}.xlsx`);
        return true;
      })
    );
  }

  /**
   * 全部对话记录详情	POST	/api/v1/im/msghis_all_v2_details_page
   */
  getAllMsg(tenantId: string, params: getMsgAllParams): Observable<JPage<SessionMsgBase>> {
    return this.post<any>(`${this._url}/msghis_all_v2_details_page`, params, {
      headers: this.getHeaders({ tenantId }),
    });
  }

  /**获取comm100 列表 */
  getComm100List(payloads: Comm100ApiPayloads): Observable<JPage<Comm100List>> {
    return this.post<JPage<Comm100List>>(`${this._generalapi}/resourcemg/commchatlist_list`, payloads);
  }

  /**导出获取comm100 列表 */
  exportComm100List(params: Comm100ApiPayloads): Observable<boolean> {
    return this.post<any>(
      `${this._generalapi}/resourcemg/file/commchatlist_export`,
      { ...params },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.localStorageService.token}`,
          lang: this.langService.currentLang?.toLowerCase() || 'zh-cn',
        }),
        responseType: 'blob',
        throwError: true,
      }
    ).pipe(
      map((res) => {
        if (!res) return false;
        downloadExcelFile(res, `Comm100 - ${Date.now()}.xlsx`);
        return true;
      })
    );
  }
}
