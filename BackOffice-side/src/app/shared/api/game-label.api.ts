import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class GameLabelApi extends BaseApi {
  private _url = `${environment.apiUrl}/resource/label`;

  /**
   * 查询标签管理列表
   * TODO：tenantId是必传参，在完成所有牵扯功能的测试和上线之前，进行选参调整
   */
  getList(tenantId?: any): Observable<any> {
    return this.get<any>(`${this._url}/getlist`, { tenantId });
  }

  /**
   * 查询 大厅/菜单 标签列表
   */
  getSceneslist(tenantId): Observable<any> {
    return this.get<any>(`${this._url}/getsceneslist`, { tenantId });
  }

  /**
   * 查询 单个标签
   */
  queryLabel(param): Observable<any> {
    return this.get<any>(`${this._url}/querylabel`, param);
  }

  /**
   * 新增 标签
   */
  createLabel(param): Observable<any> {
    return this.post<any>(`${this._url}/createlabel`, param);
  }

  /**
   * 更新 标签
   */
  updateLabel(param): Observable<any> {
    return this.put<any>(`${this._url}/updatelabel`, param);
  }

  /**
   * 更新场景标签
   */
  addscenesLabel(param): Observable<any> {
    return this.post<any>(`${this._url}/addsceneslabel`, param);
  }

  /**
   * 获取场景分组数据
   */
  getScenesGroupData(param): Observable<any> {
    return this.get<any>(`${this._url}/getscenesgroupdata`, param);
  }

  /**
   *  更新场景标签顺序
   */
  updateScenesLabelSort(param): Observable<any> {
    return this.put<any>(`${this._url}/updatesceneslabelsort`, param);
  }

  /**
   *  删除场景标签
   */
  delScenesLabel(param): Observable<any> {
    return this.delete<any>(`${this._url}/delsceneslabel`, undefined, { body: param });
  }

  /**
   *  新增或更新场景标签
   */
  addorUpdateScenesData(param): Observable<any> {
    return this.post<any>(`${this._url}/addorupdatescenesdata`, param);
  }

  /**
   *  新增或更新场景标签
   */
  addScenesData(param): Observable<any> {
    return this.post<any>(`${this._url}/addscenesdata`, param);
  }

  /**
   *  获取全部智能排序列表
   */
  getenableaisortdata(tenantId: any): Observable<any> {
    return this.get<any>(`${this._url}/getenableaisortdata`, { tenantId });
  }

  /**
   *  批量修改智能排序设定
   */
  updateaisortsetting(params): Observable<any> {
    return this.put<any>(`${this._url}/updateaisortsetting`, params);
  }
}
