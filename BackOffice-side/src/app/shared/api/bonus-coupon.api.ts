import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { VoucherItem, VoucherParams } from 'src/app/shared/interfaces/bonus';
import { JPage } from 'src/app/shared/interfaces/base.interface';

@Injectable({
  providedIn: 'root',
})
export class BonusCouponApi extends BaseApi {
  private _url = `${environment.apiUrl}/bonus`;

  /**
   * 优惠券 列表
   */
  getCouponList(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/template_page`, parmas || {});
  }

  /**
   * 优惠券 数量统计
   */
  getCouponSum(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/template_sum`, parmas || {});
  }

  /**
   * 优惠卷 兑换记录
   */
  getCouponRecordList(parmas: VoucherParams): Observable<JPage<VoucherItem>> {
    return this.post<any>(`${this._url}/releasedetail_page`, parmas || {});
  }

  /**
   * 优惠卷 状态变更（审核/下架）
   */
  getCouponCos(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/template_cos`, parmas || {});
  }

  /**
   * 优惠卷 新增
   */
  getCouponAdd(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/template_add`, parmas || {});
  }

  /**
   * 优惠卷 编辑
   */
  getCouponEdit(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/template_update`, parmas || {});
  }

  /**
   * 下载发券名单编辑模板
   */
  downloadUploadTemplate(): Observable<any> {
    return this.get<any>(
      `${this._url}/file/releasedetail_downloadexcel`,
      {},
      { responseType: 'blob', throwError: true }
    ).pipe(
      map((res) => {
        const dataType = res.type;
        const aDom = document.createElement('a');

        aDom.href = window.URL.createObjectURL(new Blob([res], { type: dataType }));
        aDom.setAttribute('download', 'uploadReleaseDetaiTemplate.xlsx');
        aDom.click();

        return true;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * 上传 发券名单 文件
   */
  uploadfile(file: any): Observable<any> {
    const data = new FormData();
    data.append('file', file);
    return this.post<any>(`${this._url}/releasedetail_import`, data, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.localStorageService.token}`,
      }),
    });
  }

  /**
   * 优惠卷 会员发送
   */
  getCouponSend(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/releasedetail_add`, parmas || {});
  }

  /**
   * 优惠卷 代理发送
   */
  getCouponAgencySend(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/releasedetail_agencyadd`, parmas || {});
  }

  /**
   *  查询单个优惠券
   */
  getQueryOne(parmas: any = {}): Observable<any> {
    return this.post<any>(`${this._url}/template_queryone`, parmas || {});
  }
}
