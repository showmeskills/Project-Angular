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
export class StairsApi extends BaseApi {
  /**
   * Stairs游戏计算
   *
   * @param params
   * @returns
   */
  async checkData(params: CheckDataParams): Promise<any> {
    const url = `${environment.orignal.newRandomUrl}/stairs/checkRandomNum`;
    const response: Response = await firstValueFrom(this.post<Response>(url, params));
    return response;
  }

  /**
   * Stairs游戏计算
   *
   * @returns
   */
  async getNumberId(): Promise<any> {
    const url = `${environment.orignal.newRandomUrl}/stairs/publicKey`;
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
}
