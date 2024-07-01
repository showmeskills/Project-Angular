import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class QuizActivityApi extends BaseApi {
  private _url = `${environment.apiUrl}/newbonus`;

  /**
   * 竞猜活动 列表
   */
  getActivities(params: any = {}): Observable<any> {
    const sendData = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== '') {
        sendData[key] = params[key];
      }
    });
    return this.get<any>(`${this._url}/prediction_list`, sendData);
  }

  /**
   * 竞猜活动模板 新增
   */
  competitionCreate(params: any = {}): Observable<any> {
    const sendData = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== '') {
        sendData[key] = params[key];
      }
    });
    return this.post<any>(`${this._url}/prediction_setting`, sendData);
  }

  /**
   * 竞猜活动模板  /编辑
   */
  competitionPut(params: any = {}): Observable<any> {
    return this.put<any>(`${this._url}/prediction_setting`, params);
  }

  /**
   * 获取结算信息
   */
  gameMatches(id): Observable<any> {
    return this.get<any>(`${this._url}/settlements_gameMatches/${id}`);
  }

  /**
   * 获取编辑信息
   */
  predictionEdit(id): Observable<any> {
    return this.get<any>(`${this._url}/prediction_edit/${id}`);
  }

  /**
   * 结算竞猜活动
   */
  activitySettle(params: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/settlements_settle`, params);
  }

  /**
   * 更新活动状态（手工开启、停止）
   */
  activitySetStatus(parmas: any = {}): Observable<any> {
    return this.put<any>(`${this._url}/prediction_setStatus`, parmas);
  }

  /**
   * 竞猜活动-查看数据（汇总）
   */
  getPredictionMaster(parmas: any = {}): Observable<any> {
    return this.get<any>(`${this._url}/prediction_master`, parmas);
  }

  /**
   *竞猜活动-查看数据-获取前N名会员信息
   */
  getPredictionRankInfo(top = 5): Observable<any> {
    return this.get<any>(`${this._url}/prediction_rankInfo/${top}`);
  }

  /**
   * 竞猜活动-查看单个活动数据（明细）
   */
  getPredictionDetail(parmas: any = {}): Observable<any> {
    return this.get<any>(`${this._url}/prediction_detail`, parmas);
  }

  /**
   * 获得上传地址域名
   */
  getUploadHost() {
    return this.get<any>(`${environment.apiUrl}/resource/upload/getuploadhost`);
  }
}
