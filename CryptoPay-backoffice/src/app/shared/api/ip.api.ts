import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { AddWhite, WhiteItem, WhiteListParams } from 'src/app/shared/interfaces/ip';
import { PageResponse } from 'src/app/shared/interfaces/base.interface';

@Injectable({
  providedIn: 'root',
})
export class IPApi extends BaseApi {
  private _urlWhite = `${environment.apiUrl}/whitelist`;

  /**
   * 查看白名单
   */
  getWhiteList(params: WhiteListParams): Observable<PageResponse<WhiteItem>> {
    return this.get(`${this._urlWhite}/getwhitelist`, params);
  }

  /**
   * 删除IP
   */
  deleteWhite(id: number | string): Observable<boolean> {
    return this.deleteQuery(`${this._urlWhite}/delete`, { id });
  }

  /**
   * 添加IP
   */
  addWhite(params: AddWhite) {
    return this.post(`${this._urlWhite}/add`, params);
  }
}
