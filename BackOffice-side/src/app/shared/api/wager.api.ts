import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { CancelBetParams, EventIdItem, SportParams } from 'src/app/shared/interfaces/wager';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class WagerApi extends BaseApi {
  private _url = `${environment.apiUrl}/asset/wager`;

  /**
   * 获取体育交易记录 - 列表
   */
  getSportList(params: SportParams): Observable<any> {
    const sendData = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== '') {
        sendData[key] = params[key];
      }
    });
    return this.get<any>(`${this._url}/sportwager`, sendData);
  }

  /**
   * 获取体育交易记录 - 详情
   */
  getSportDetail(wagerNumber: string): Observable<any | any[]> {
    return this.get<any>(`${this._url}/sportwagerdetail`, { wagerNumber }).pipe(
      map((res) => (res?.length ? res : undefined))
    );
  }

  /**
   * 重送交易记录
   */
  resendSport(orderNum: string): Observable<any> {
    return this.get<any>(`${this._url}/wagercheck`, { orderNum });
  }

  /**
   * 交易记录 - 取消注单
   */
  cancelBet(params: CancelBetParams): Observable<boolean> {
    return this.post<boolean>(`${this._url}/cancelwagerapply`, params).pipe(map((res: any) => res === true));
  }

  /**
   * 获取电子游戏记录 - 列表
   */
  getSlotGameList(params: SportParams): Observable<any> {
    const sendData = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== '') {
        sendData[key] = params[key];
      }
    });
    return this.get<any>(`${this._url}/slotgamewager`, sendData);
  }

  /**
   * 获取电子游戏记录 - 详情
   */
  getSlotGameDetail(wagerNumber: string): Observable<any> {
    return this.get<any>(`${this._url}/getslotgamewagerdetail`, {
      wagerNumber,
    });
  }

  /**
   * 获取棋牌游戏记录 - 列表
   */
  getChessList(params: SportParams): Observable<any> {
    const sendData = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== '') {
        sendData[key] = params[key];
      }
    });
    return this.get<any>(`${this._url}/chesswager`, sendData);
  }

  /**
   * 获取棋牌游戏记录 - 详情
   */
  getChessDetail(wagerNumber: string): Observable<any> {
    return this.get<any>(`${this._url}/chesswagerdetail`, { wagerNumber });
  }

  /**
   * 获取彩票游戏记录 - 列表
   */
  getLotteryList(params: SportParams): Observable<any> {
    const sendData = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== '') {
        sendData[key] = params[key];
      }
    });
    return this.get<any>(`${this._url}/lotterywager`, sendData);
  }

  /**
   * 获取彩票游戏记录 - 详情
   */
  getLotteryDetail(wagerNumber: string): Observable<any> {
    return this.get<any>(`${this._url}/lotterywagerdetail`, { wagerNumber });
  }

  /**
   * 获取真人娱乐游戏记录 - 列表
   */
  getLivecasinoList(params: SportParams): Observable<any> {
    const sendData = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== '') {
        sendData[key] = params[key];
      }
    });
    return this.get<any>(`${this._url}/livecasinowager`, sendData);
  }

  /**
   * 获取真人娱乐游戏记录 - 详情
   */
  getLivecasinoDetail(wagerNumber: string): Observable<any> {
    return this.get<any>(`${this._url}/livecasinowagerdetail`, { wagerNumber });
  }

  /**
   * 获取 游戏城、真人娱乐场、彩票、棋牌 - 赛事ID
   */
  getEventIdList(params): Observable<EventIdItem[]> {
    return this.get<any>(`${this._url}/getgameselect`, params);
  }
}
