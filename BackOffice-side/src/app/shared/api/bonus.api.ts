import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class BonusApi extends BaseApi {
  private _url = `${environment.apiUrl}/bonus`;
  private _gameUrl = `${environment.apiUrl}/game/select`;

  /**
   * 活动获取列表（废弃）
   */
  getActivityList_old(parma: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/activity_getList`, parma || {});
  }

  /**
   * 活动获取列表（新）
   */
  getActivityList(parma: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/overview_page`, parma || {});
  }

  /**
   * 活动获取总数
   */
  getActivityCount(parma): Observable<any> {
    return this.get<any>(`${this._url}/activity_Count`, parma);
  }

  /**
   * 查看活动金额发放情况(活动金额弹窗)
   */
  getActivityAmt(parma): Observable<any> {
    return this.get<any>(`${this._url}/activity_amt`, parma);
  }

  /**
   * 活动发放情况
   */
  getReleaseList(parma): Observable<any> {
    return this.post<any>(`${this._url}/release_page`, parma);
  }

  /**
   * 负盈利及流水返还 模板创建
   */
  getWaterNegative(parma: any): Observable<any> {
    return this.post<any>(`${this._url}/negative`, parma);
  }

  /**
   * 负盈利及流水返还 模板 数据
   */
  getWaterDetail(parma: any): Observable<any> {
    return this.get<any>(`${this._url}/detail`, parma);
  }

  /**
   * 活动模板 审核
   */
  getUpdateById(parma: any): Observable<any> {
    return this.post<any>(`${this._url}/activity_updateById`, parma);
  }

  /**
   * 下载上传名单编辑模板
   */
  downloadUploadTemplate(): Observable<any> {
    return this.get<any>(`${this._url}/file/downloadexcel`, {}, { responseType: 'blob', throwError: true }).pipe(
      map((res) => {
        const dataType = res.type;
        const aDom = document.createElement('a');

        aDom.href = window.URL.createObjectURL(new Blob([res], { type: dataType }));
        aDom.setAttribute('download', 'uploadTemplate.xlsx');
        aDom.click();

        return true;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * 导出全部发放查询数据
   */
  exportReleaseData(parmas): Observable<any> {
    return this.get<any>(`${this._url}/file/release_exportdata`, parmas, {
      responseType: 'blob',
      throwError: true,
    }).pipe(
      map((res) => {
        const dataType = res.type;
        const aDom = document.createElement('a');

        aDom.href = window.URL.createObjectURL(new Blob([res], { type: dataType }));
        aDom.setAttribute('download', 'release-all-list.xlsx');
        aDom.click();

        return true;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * 上传名单审核文件
   */
  uploadfile(file: any, activitiesNo: any, tenantId: any): Observable<any> {
    const data = new FormData();
    data.append('file', file);
    return this.post<any>(`${this._url}/import?activitiesNo=${activitiesNo}&tenantId=${tenantId}`, data, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.localStorageService.token}`,
      }),
    });
  }

  /**
   * 上传名单 - 删除
   */
  deleteImport(parma: any): Observable<any> {
    return this.post<any>(`${this._url}/delete_import`, parma);
  }

  /**
   * 上传名单 - 全体提交
   */
  submitImport(parma: any): Observable<any> {
    return this.post<any>(`${this._url}/submit_import`, parma);
  }

  /**
   * 名单审核 - 驳回
   */
  deleteAudit(parma: any): Observable<any> {
    return this.post<any>(`${this._url}/delete_audit`, parma);
  }

  /**
   * 名单审核 - 选择通过
   */
  passImportId(parma: any): Observable<any> {
    return this.post<any>(`${this._url}/import_byid`, parma);
  }

  /**
   * 名单审核 - 全体通过
   */
  passImport(parma: any): Observable<any> {
    return this.post<any>(`${this._url}/pass_import`, parma);
  }

  /**
   * 报名详情 - 页面数据
   */
  gerCustomer(parma: any): Observable<any> {
    return this.post<any>(`${this._url}/customer_page`, parma);
  }

  /**
   * 获取进行中的活动数量
   */
  getActivityProgressCountData(tenantId): Observable<any> {
    return this.get<any>(`${this._url}/getactivitycount`, { tenantId });
  }

  /**
   * 获取红利活动统计
   */
  getactivitystats(parmas): Observable<any> {
    return this.get<any>(`${this._url}/getactivitystats`, parmas);
  }

  /**
   * 积分查询接口 - 废弃
   */
  // getGrowUpPointsSum(parma: any): Observable<any> {
  //   return this.post<any>(`${this._url}/growuppoints_sum`, parma);
  // }

  /**
   * 积分统计接口 - 页面数据 - 废弃
   */
  // getGrowUpPointsList(parma: any): Observable<any> {
  //   return this.post<any>(`${this._url}/growuppoints_page`, parma);
  // }
}
