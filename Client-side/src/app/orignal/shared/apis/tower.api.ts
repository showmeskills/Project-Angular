import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Response } from '../interfaces/response.interface';
import { BaseApi } from './base.api';
export interface BetParams {
  numberId: string;
  betAmount: number;
  currency: string;
  towerCount: number;
  numberPublicKey?: string;
}

export interface RecordParams {
  state?: number;
  current?: number;
  sourceCode?: string;
  size?: number;
}

export interface CheckDataParams {
  numberPublicKey: string;
  numberSecretKey: string;
}

@Injectable({
  providedIn: 'root',
})
export class TowerApi extends BaseApi {
  /**
   * Wheel游戏计算
   *
   * @returns
   */
  async getNumberId(): Promise<any> {
    const url = `${environment.orignal.newRandomUrl}/tower/publicKey`;
    const response: Response = await firstValueFrom(this.get<Response>(url));
    return response;
  }

  /**
   * Wheel游戏计算
   *
   * @param params
   * @returns
   */
  async checkData(params: CheckDataParams): Promise<any> {
    const url = `${environment.orignal.newRandomUrl}/tower/checkRandomNum`;
    const response: Response = await firstValueFrom(this.post<Response>(url, params));
    return response;
  }
}
