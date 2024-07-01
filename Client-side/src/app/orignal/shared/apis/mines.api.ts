import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Response } from '../interfaces/response.interface';
import { BaseApi } from './base.api';

export interface BetParams {
  numberId: string;
  betAmount: number;
  currency: string;
  minesCount: number;
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
export class MinesApi extends BaseApi {
  /**
   * 该用户当前是否有mines注单
   *
   * @returns
   */
  async getCurrentBet(): Promise<any> {
    const url = this.getRequestUrl('/common/lottery/minesCurrent');
    const response: Response = await firstValueFrom(this.post<Response>(url, {}));
    return response;
  }

  /**
   * MINES游戏下注接口
   *
   * @param numberId 用户唯一表示
   * @param numberPublicKey 用户自定义公钥
   * @param betAmount 玩家下注的金额
   * @param minesCount 地雷总数
   * @param currency 币种
   * @param params
   * @returns
   */
  async toBet(params: BetParams): Promise<any> {
    const url = this.getRequestUrl('/common/lottery/minesBet ');
    const response: Response = await firstValueFrom(this.post<Response>(url, params));
    return response;
  }

  /**
   * MINES游戏开奖
   *
   * @param index 开奖坐标
   * @returns
   */
  async toOpen(index: Array<number>): Promise<any> {
    const url = this.getRequestUrl('/common/lottery/minesLottery');
    const response: Response = await firstValueFrom(this.post<Response>(url, { index }));
    return response;
  }

  /**
   * MINES游戏结算
   *
   * @returns
   */
  async toResult(): Promise<any> {
    const url = this.getRequestUrl('/common/lottery/minesSettlement');
    const response: Response = await firstValueFrom(this.post<Response>(url, {}));
    return response;
  }

  /**
   * MINES游戏赔付比例
   *
   * @param bomb
   * @param diamond
   * @returns
   */
  async getMultiplier(bomb: number, diamond: number): Promise<any> {
    const url = this.getRequestUrl('/common/lottery/multiplier');
    const response: Response = await firstValueFrom(this.get<Response>(url, { bomb, diamond }));
    return response;
  }

  /**
   * MINES游戏获取numberID
   *
   * @returns
   */
  async getNumberId(): Promise<any> {
    const url = this.getRequestUrl('/common/lottery/publicKey');
    const response: Response = await firstValueFrom(this.get<Response>(url));
    return response;
  }

  /**
   * MINES游戏计算
   *
   * @param params
   * @param type
   * @returns
   */
  async checkData(params: CheckDataParams): Promise<any> {
    const url = `${environment.orignal.newRandomUrl}/mines/checkRandomNum`;
    const response: Response = await firstValueFrom(this.post<Response>(url, params));
    return response;
  }
}
