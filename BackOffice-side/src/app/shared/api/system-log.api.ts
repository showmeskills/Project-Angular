import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import {
  SMSEmailTypeItem,
  SMSEmailItem,
  SMSEmailListParams,
  LogItem,
  LogParams,
  OperationTypeItem,
} from 'src/app/shared/interfaces/system.interface';
import { PageResponse } from 'src/app/shared/interfaces/base.interface';
import { catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class SystemLogApi extends BaseApi {
  private _url = `${environment.apiUrl}/admin/log`;

  /**
   * 查询操作日志类型(下拉列表)
   */
  operationTypeList(): Observable<OperationTypeItem[]> {
    return this.get<any>(`${this._url}/operationtypelist`).pipe(catchError(() => of([])));
  }

  /**
   * 查询操作日志
   */
  getOperationLogList(param: LogParams): Observable<PageResponse<LogItem>> {
    return this.get<any>(`${this._url}/getoperationloglist`, param);
  }

  /**
   * 查询opt发送日志
   */
  getOtplogList(param: SMSEmailListParams): Observable<PageResponse<SMSEmailItem>> {
    return this.get<any>(`${this._url}/getotploglist`, param);
  }

  /**
   * 查询操作类型数组
   */
  getOtpTypeList(): Observable<SMSEmailTypeItem[]> {
    return this.get<any>(`${this._url}/getotptypelist`);
  }
}
