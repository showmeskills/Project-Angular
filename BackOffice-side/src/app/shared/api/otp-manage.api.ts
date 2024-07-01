import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { CodeDescription, PageResponse } from 'src/app/shared/interfaces/base.interface';
import { OTPItem } from 'src/app/shared/interfaces/system.interface';

@Injectable({
  providedIn: 'root',
})
export class OtpManageApi extends BaseApi {
  private _url = `${environment.apiUrl}/resource/otpmanage`;

  /**
   * 服务商下拉列表
   */
  getIpsSelect(): Observable<CodeDescription[]> {
    return this.get<any>(`${this._url}/getipsselect`);
  }

  /**
   * 查询OTP列表
   */
  getList(params): Observable<PageResponse<OTPItem>> {
    return this.get<any>(`${this._url}/getlist`, params);
  }
}
