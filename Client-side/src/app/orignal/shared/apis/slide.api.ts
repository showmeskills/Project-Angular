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
export class SlideApi extends BaseApi {
  /**
   * Slide游戏计算
   *
   * @param params
   * @returns
   */
  async checkData(params: CheckDataParams): Promise<any> {
    const url = `${environment.orignal.newRandomUrl}/slide/checkRandomNum`;
    const response: Response = await firstValueFrom(this.post<Response>(url, params));
    return response;
  }

  /**
   * Slide游戏计算
   *
   * @returns
   */
  async getNumberId(): Promise<any> {
    const url = `${environment.orignal.newRandomUrl}/slide/publicKey`;
    const response: Response = await firstValueFrom(this.get<Response>(url));
    return response;
  }
  /**
   * Slide游戏赔付比例
   *
   * @param params
   * @returns
   */
  async getMultiplier(): Promise<any> {
    console.log(1111);
    const url = `${environment.orignal.newRandomUrl}/slide/multiplier`;
    console.log(url);
    const response: Response = await firstValueFrom(this.get<Response>(url));
    return response;
  }
}
