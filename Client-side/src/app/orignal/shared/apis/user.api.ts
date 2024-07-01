import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Response } from '../interfaces/response.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class UserApi extends BaseApi {
  /**
   * DICE游戏获取numberID
   *
   * @returns
   */
  async getUser(): Promise<any> {
    const url = this.getRequestUrl('/lotteryUser/getUser');
    const response: Response = await firstValueFrom(this.get<Response>(url));
    return response;
  }
}
