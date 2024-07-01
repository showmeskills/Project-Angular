import { HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseData } from '../interfaces/response.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class ChatApi extends BaseApi {
  generateToken(
    uid: string,
    appId: string,
    appSecret: string,
  ): Observable<ResponseData<{ accesstoken: string; access: boolean }>> {
    return this.post(`${environment.apiUrl}/im/api/auth/generateToken`, {
      appId: appId,
      appSecret: appSecret,
      deviceType: 1,
      uid: uid,
    });
  }

  upload(file: File, token: string): Observable<HttpEvent<ResponseData<{ fid: string }>>> {
    const url = `${environment.apiUrl}/im/api/file/upload`;
    const data = new FormData();
    data.append('file', file);
    data.append('type', '1');
    data.append('token', token);
    return this.http
      .post<ResponseData<{ fid: string }>>(url, data, {
        headers: new HttpHeaders({
          'ngsw-bypass': 'true',
          'APM-Request-ID': this.hashedString,
        }),
        observe: 'events',
        reportProgress: true,
      })
      .pipe(
        catchError((error: unknown) => {
          return this.handleError(error, url, data, 'POST');
        }),
      );
  }
}
