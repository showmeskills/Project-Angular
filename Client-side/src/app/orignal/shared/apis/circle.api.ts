import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Response } from '../interfaces/response.interface';
import { BaseApi } from './base.api';

export interface CheckDataParams {
  numberPublicKey: string;
  numberSecretKey: string;
}

@Injectable({
  providedIn: 'root',
})
export class CircleApi extends BaseApi {
  /**
   * Circle游戏计算
   *
   * @param params
   * @returns
   */
  async checkData(params: CheckDataParams): Promise<any> {
    const url = `${environment.orignal.newRandomUrl}/circle/checkRandomNum`;
    const response: Response = await firstValueFrom(this.post<Response>(url, params));
    return response;
  }

  /**
   * Circle游戏计算
   *
   * @returns
   */
  async getNumberId(): Promise<any> {
    const url = `${environment.orignal.newRandomUrl}/circle/publicKey`;
    const response: Response = await firstValueFrom(this.get<Response>(url));
    return response;
  }
  /**
   * plinko游戏赔付比例
   *
   * @param params
   * @returns
   */
  async getMultiplier(params: any): Promise<any> {
    const url = `${environment.orignal.newRandomUrl}/common/lotteryMultiplier/multiplier`;
    const response: Response = await firstValueFrom(this.get<Response>(url, { ...params }));
    return response;
  }
  /**
   * plinko游戏赔付比例
   *
   * @param params
   * @returns
   */
  async getRecord(params: any): Promise<any> {
    const url = `${environment.orignal.newRandomUrl}/circle/record`;
    const response: Response = await firstValueFrom(this.get<Response>(url, { ...params }));
    return response;
  }
}
