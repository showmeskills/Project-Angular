import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { LogParams, OperationLogItem, OperationTypeItem } from 'src/app/shared/interfaces/log';
import { catchError } from 'rxjs/operators';
import { PageResponse } from 'src/app/shared/interfaces/base.interface';

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
  getOperationLogList(param: LogParams): Observable<PageResponse<OperationLogItem>> {
    return this.get<any>(`${this._url}/getoperationloglist`, param);
  }
}
