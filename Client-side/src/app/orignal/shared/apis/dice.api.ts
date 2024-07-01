import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Response } from '../interfaces/response.interface';
import { BaseApi } from './base.api';

export interface BetParams {
  numberId: string;
  betAmount: number;
  condition: string;
  target: number;
  currency: string;
  numberPublicKey?: string;
  deviceType?: string;
  deviceInfo?: string;
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
export class DiceApi extends BaseApi {
  /**
   * DICE游戏下注接口
   *
   * @param numberId 用户唯一表示
   * @param betAmount 玩家下注的金额
   * @param realBetRate 玩家下注时的赔率
   * @param condition above:大于、below:小于
   * @param target 用户选中的目标
   * @param currency 币种
   * @param deviceType 装置代码(用于区分用户使用装置)：web = 1、mobile = 2、ios=4、android=5
   * @param deviceInfo 用户的设备号资讯，因为app是无法透过api取得用户设备号资讯的，所以在调用api时，就要让前端传参
   * @param params
   * @returns
   */
  async toBet(params: BetParams): Promise<any> {
    const url = this.getRequestUrl('/common/lottery/diceBet');
    const response: Response = await firstValueFrom(this.post<Response>(url, params));
    return response;
  }

  /**
   * DICE游戏赔付比例
   *
   * @returns
   */
  async getMultiplier(): Promise<any> {
    const url = `${environment.orignal.newRandomUrl}/dice/multiplier`;
    const response: Response = await firstValueFrom(this.get<Response>(url));
    return response;
  }

  /**
   * DICE游戏下注记录
   *
   * @param state 0:All bets 、1:My bets 、2: Higt rollers 、3:Rare wins(默认为0)
   * @param current 页码
   * @param sourceCode 游戏代码,用于区分游戏
   * @param size 每页显示的个数
   * @param params
   * @returns
   */
  async getRecord(params: RecordParams): Promise<any> {
    const url = this.getRequestUrl('/common/lottery/record');
    const response: Response = await firstValueFrom(this.get<Response>(url, { ...params }));
    return response;
  }

  /**
   * CRASH游戏下注记录
   * 废弃
   *
   * @param current 页码
   * @param sourceCode 游戏代码,用于区分游戏
   * @param size 每页显示的个数
   * @param params
   * @returns
   */
  async getCrashRecord(params: RecordParams): Promise<any> {
    const url = this.getRequestUrl('/common/IssueNumber/issueNumberRecord');
    const response: Response = await firstValueFrom(this.get<Response>(url, { ...params }));
    return response;
  }

  /**
   * DICE游戏获取numberID
   *
   * @param type
   * @returns
   */
  async getNumberId(type: string): Promise<any> {
    // const url = this.getRequestUrl('/lottery/publicKey');
    // const response: Response = await firstValueFrom(this.get<Response>(url));
    // return response;
    const url = `${environment.orignal.newRandomUrl}/${type}/publicKey`;
    const response: Response = await firstValueFrom(this.get<Response>(url));
    return response;
  }

  /**
   * DICE游戏开奖结果记录
   *
   * @returns
   */
  async getResult(): Promise<any> {
    const url = this.getRequestUrl('/common/lottery/result');
    const response: Response = await firstValueFrom(this.get<Response>(url));
    return response;
  }

  /**
   * DICE游戏计算
   *
   * @param params
   * @param type
   * @returns
   */
  async checkData(params: CheckDataParams, type: string): Promise<any> {
    const url = `${environment.orignal.newRandomUrl}/${type}/checkRandomNum`;
    const response: Response = await firstValueFrom(this.post<Response>(url, params));
    return response;
  }
  /**
   * 获取最小和最大投注额
   *
   * @param gameCode
   * @returns
   */
  async getBetLimit(gameCode: string): Promise<any> {
    const url = this.getRequestUrl('/common/lottery/quotaLimit');
    const response: Response = await firstValueFrom(this.get<Response>(url, { gameCode }));
    return response;
  }
}
