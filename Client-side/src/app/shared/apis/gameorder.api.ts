import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  BigWinnerParams,
  CasinoDealRecord,
  CasinoDealRecordDetail,
  ChessDealRecord,
  ChessDealRecordDetail,
  CommonRealTimeData,
  DealRecordParams,
  GetBigWinner,
  GetLuckiestUser,
  LotteryDealRecord,
  LotteryDealRecordDetail,
  LuckiestUserParams,
  RecentorderDealRecordParams,
  RecentTransactionsData,
  SportDealRecord,
  SportDealRecordDetail,
  StatusSelect,
  WagerDaysTotalData,
} from '../interfaces/gameorder.interface';
import { ResponseData, ResponseListData } from '../interfaces/response.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class GameOrderApi extends BaseApi {
  private get gameorderUrl(): string {
    return `${environment.apiUrl}/v1/asset/gameorder`;
  }

  /**
   * 查询订单状态下拉列表
   *
   * @param gameType
   */
  getStatusSelect(gameType: 'SportsBook' | 'Lottery' | 'Casino' | 'Chess'): Observable<ResponseData<StatusSelect[]>> {
    return this.get(`${this.gameorderUrl}/getwagerstatusselect`, { gameType });
  }

  /**
   * 查询【体育】交易记录列表
   * 返回 SportDealRecord[]
   *
   * @param params
   */
  getsportlist(params: DealRecordParams): Observable<ResponseListData<SportDealRecord[]>> {
    return this.get(`${this.gameorderUrl}/getsportlist`, params);
  }

  /**
   * 查询【体育】交易记录详情
   * wagerNumber 交易单号
   * 返回 SportDealRecordDetail[]
   *
   * @param wagerNumber
   */
  getsportdetail(wagerNumber: string): Observable<ResponseData<SportDealRecordDetail[]>> {
    return this.get(`${this.gameorderUrl}/getsportdetail`, { wagerNumber });
  }

  /**
   * 查询【娱乐城】交易记录列表
   * 返回 CasinoDealRecord[]
   *
   * @param params
   */
  getcasinolist(params: DealRecordParams): Observable<ResponseListData<CasinoDealRecord[]>> {
    return this.get(`${this.gameorderUrl}/getcasinolist`, params);
  }

  /**
   * 查询【娱乐城】交易记录详情
   * wagerNumber 交易单号
   * 返回 CasinoDealRecordDetail
   *
   * @param wagerNumber
   */
  getcasinodetail(wagerNumber: string): Observable<ResponseData<CasinoDealRecordDetail>> {
    return this.get(`${this.gameorderUrl}/getcasinodetail`, { wagerNumber });
  }

  /**
   * 查询【棋牌】交易记录列表
   * 返回 ChessDealRecord[]
   *
   * @param params
   */
  getchesslist(params: DealRecordParams): Observable<ResponseListData<ChessDealRecord[]>> {
    return this.get(`${this.gameorderUrl}/getchesslist`, params);
  }

  /**
   * 查询【棋牌】交易记录详情
   * wagerNumber 交易单号
   * 返回 ChessDealRecordDetail
   *
   * @param wagerNumber
   */
  getchessdetail(wagerNumber: string): Observable<ResponseData<ChessDealRecordDetail>> {
    return this.get(`${this.gameorderUrl}/getchessdetail`, { wagerNumber });
  }

  /**
   * 查询【彩票】交易记录列表
   * 返回 LotteryDealRecord[]
   *
   * @param params
   */
  getlotterylist(params: DealRecordParams): Observable<ResponseListData<LotteryDealRecord[]>> {
    return this.get(`${this.gameorderUrl}/getlotterylist`, params);
  }

  /**
   * 查询【彩票】交易记录详情
   * wagerNumber 交易单号
   * 返回 LotteryDealRecordDetail
   *
   * @param wagerNumber
   */
  getlotterydetail(wagerNumber: string): Observable<ResponseData<LotteryDealRecordDetail>> {
    return this.get(`${this.gameorderUrl}/getlotterydetail`, { wagerNumber });
  }

  /**
   * 查询【最近交易】记录详情
   * 返回 RecentorderDealRecord
   *
   * @param params
   */
  getRecentorder(params: RecentorderDealRecordParams): Observable<ResponseListData<RecentTransactionsData[]>> {
    return this.get(`${this.gameorderUrl}/recentorder`, params);
  }

  /**
   * 查询会员注单日期汇总 TODO: 时间还原
   *
   * @param gameType 类别
   * @param wagerStatus 状态
   * @param beginDate 开始时间
   * @param endDate 结束时间
   * @returns
   */
  getWagerDaytotal(
    gameType: 'SportsBook' | 'Lottery' | 'Casino' | 'Chess',
    wagerStatus: string,
    beginDate: number,
    endDate: number
  ): Observable<ResponseData<WagerDaysTotalData>> {
    return this.get(`${this.gameorderUrl}/getwagerdaytotal`, { gameType, wagerStatus, beginDate, endDate });
  }

  /**
   * 统一注单列表
   *
   * @param gameType 类别
   * @param wagerStatus 状态
   * @param beginTime 开始时间
   * @param endTime 结束时间
   * @param page 页码
   * @param pageSize 每页大小
   * @returns
   */
  getWagerList(
    gameType: 'SportsBook' | 'Lottery' | 'Casino' | 'Chess',
    wagerStatus: string,
    beginTime: number,
    endTime: number,
    page: number,
    pageSize: number
  ): Observable<ResponseListData<CasinoDealRecord[] | SportDealRecord[] | ChessDealRecord[] | LotteryDealRecord[]>> {
    return this.get(`${this.gameorderUrl}/getwagerlist`, { gameType, wagerStatus, beginTime, endTime, page, pageSize });
  }

  /**
   * 我的投注初始化
   *
   * @param pageSize 当前页面size
   * @param gameCategories
   * @returns
   */
  getMyBet(pageSize: number, gameCategories: string[]): Observable<Array<CommonRealTimeData>> {
    return this.get<ResponseData<Array<CommonRealTimeData>>>(`${this.gameorderUrl}/getselfrealtimebetinfo`, {
      pageSize,
      gameCategories,
    }).pipe(map(v => v?.data || []));
  }

  /**
   * 所有投注
   *
   * @param pageSize 当前页面size
   * @param gameCategories
   * @returns
   */
  getAllBets(pageSize: number, gameCategories: string[]): Observable<Array<CommonRealTimeData>> {
    return this.get<ResponseData<Array<CommonRealTimeData>>>(`${this.gameorderUrl}/getrealtimebetinfo`, {
      pageSize,
      gameCategories,
    }).pipe(map(v => v?.data || []));
  }

  /**
   * 风云榜
   *
   * @param pageSize 当前页面size
   * @param gameCategories
   * @returns
   */
  getHeroBet(pageSize: number, gameCategories: string[]): Observable<Array<CommonRealTimeData>> {
    return this.get<ResponseData<Array<CommonRealTimeData>>>(`${this.gameorderUrl}/getherobetinfo`, {
      pageSize,
      gameCategories,
    }).pipe(map(v => v?.data || []));
  }

  /**
   * 最幸运
   *
   * @param pageSize
   * @param gameCategories
   * @returns
   */
  getLuckiest(pageSize: number, gameCategories: string[]): Observable<Array<CommonRealTimeData>> {
    return this.get<ResponseData<Array<CommonRealTimeData>>>(`${this.gameorderUrl}/getluckiestbetinfo`, {
      pageSize,
      gameCategories,
    }).pipe(map(v => v?.data || []));
  }

  /**
   * 大隐家
   *
   * @param params
   * @returns
   */
  getBigWinner(params: BigWinnerParams): Observable<Array<GetBigWinner>> {
    return this.get<ResponseData<Array<GetBigWinner>>>(`${this.gameorderUrl}/getmostwinerbetinfo`, params).pipe(
      map(v => v?.data || [])
    );
  }

  /**
   * 幸运玩家
   *
   * @param params
   * @returns
   */
  getLuckiestUser(params: LuckiestUserParams): Observable<Array<GetLuckiestUser>> {
    return this.get<ResponseData<Array<GetLuckiestUser>>>(`${this.gameorderUrl}/getluckywinerbetinfo`, params).pipe(
      map(v => v?.data || [])
    );
  }
}
