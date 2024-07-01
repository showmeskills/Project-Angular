import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { GameApi } from 'src/app/shared/apis/game.api';
import { GameOrderApi } from 'src/app/shared/apis/gameorder.api';
import { ProviderInterface } from 'src/app/shared/interfaces/game.interface';
import {
  CasinoDealRecord,
  CasinoDealRecordDetail,
  ChessDealRecord,
  ChessDealRecordDetail,
  DealRecordParams,
  LotteryDealRecord,
  LotteryDealRecordDetail,
  RecentTransactionsData,
  RecentorderDealRecordParams,
  SportDealRecord,
  SportDealRecordDetail,
  StatusSelect,
  WagerDaysTotalData,
} from 'src/app/shared/interfaces/gameorder.interface';
import { ResponseListData } from 'src/app/shared/interfaces/response.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';

export const GAMETYPE_MAP: any = {
  sport: 'SportsBook',
  lottery: 'Lottery',
  casino: 'Casino',
  poker: 'Chess',
};

export const PROVIDER_ALL = {
  // 用于场馆的 增加 '全部' 下拉
  providerId: '',
  providerName: '',
  webLogo: '',
  h5Logo: '',
  appLogo: '',
  status: 'Online',
  gameCount: 0,
};

@Injectable({
  providedIn: 'root',
})
export class DealRecordService {
  constructor(private gameOrderApi: GameOrderApi, private gameApi: GameApi, private localeService: LocaleService) {}

  statusSelect: StatusSelect[] = [];
  /**用于状态的 增加 '全部' 下拉 */
  STATUS_ALL = {
    code: '',
    description: this.localeService.getValue('all'),
  };

  //获取状态下拉
  public getStatusSelect(ident: any): Observable<StatusSelect[]> {
    return this.gameOrderApi.getStatusSelect(GAMETYPE_MAP[ident]).pipe(
      map(v => v?.data || []),
      tap(v => (this.statusSelect = v))
    );
  }

  //获取场馆下拉
  public getProviderListByCategory(ident: string): Observable<ProviderInterface[]> {
    return this.gameApi.getProviderList(GAMETYPE_MAP[ident]).pipe(map(v => v?.data || []));
  }

  // 状态字段对应文字和样式
  public getStatusShowInfo(status: string) {
    const item = this.statusSelect?.find(x => x?.code === status);
    switch (item?.code) {
      case 'CashOut':
      case 'Settlement':
        return { text: item?.description || '', className: 'well' };
      default:
        return { text: item?.description || '', className: 'bad' };
    }
  }

  //获取【体育】交易列表
  public getsportlist(params: DealRecordParams): Observable<ResponseListData<SportDealRecord[]>['data']> {
    return this.gameOrderApi.getsportlist(params).pipe(map(v => v?.data));
  }

  //获取【体育】交易详情
  public getsportdetail(wagerNumber: string): Observable<SportDealRecordDetail[]> {
    return this.gameOrderApi.getsportdetail(wagerNumber).pipe(map(v => v?.data));
  }

  //获取【娱乐城】交易列表
  public getcasinolist(params: DealRecordParams): Observable<ResponseListData<CasinoDealRecord[]>['data']> {
    return this.gameOrderApi.getcasinolist(params).pipe(map(v => v?.data));
  }

  //获取【娱乐城】交易详情
  public getcasinodetail(wagerNumber: string): Observable<CasinoDealRecordDetail> {
    return this.gameOrderApi.getcasinodetail(wagerNumber).pipe(map(v => v?.data));
  }

  //获取【棋牌】交易列表
  public getchesslist(params: DealRecordParams): Observable<ResponseListData<ChessDealRecord[]>['data']> {
    return this.gameOrderApi.getchesslist(params).pipe(map(v => v?.data));
  }

  //获取【棋牌】交易详情
  public getchessdetail(wagerNumber: string): Observable<ChessDealRecordDetail> {
    return this.gameOrderApi.getchessdetail(wagerNumber).pipe(map(v => v?.data));
  }

  //获取【彩票】交易列表
  public getlotterylist(params: DealRecordParams): Observable<ResponseListData<LotteryDealRecord[]>['data']> {
    return this.gameOrderApi.getlotterylist(params).pipe(map(v => v?.data));
  }

  //获取【彩票】交易详情
  public getlotterydetail(wagerNumber: string): Observable<LotteryDealRecordDetail> {
    return this.gameOrderApi.getlotterydetail(wagerNumber).pipe(map(v => v?.data));
  }

  //获取【最近交易】
  public getRecentorder(
    params: RecentorderDealRecordParams
  ): Observable<ResponseListData<RecentTransactionsData[]>['data']> {
    return this.gameOrderApi.getRecentorder(params).pipe(map(v => v?.data));
  }

  /**
   * 获取 会员注单日期汇总
   *
   * @param ident 路由ident,将会转换成 gameType
   * @param wagerStatus 状态
   * @param beginDate 开始时间
   * @param endDate 结束时间
   * @returns
   */
  public getWagerDaytotal(
    ident: string,
    wagerStatus: string,
    beginDate: number,
    endDate: number
  ): Observable<WagerDaysTotalData> {
    return this.gameOrderApi
      .getWagerDaytotal(GAMETYPE_MAP[ident], wagerStatus, beginDate, endDate)
      .pipe(map(v => v?.data));
  }

  /**
   * 统一注单列表
   *
   * @param ident 路由ident,将会转换成 gameType
   * @param wagerStatus 状态
   * @param beginTime 开始时间
   * @param endTime 结束时间
   * @param page 页码
   * @param pageSize 每页大小
   * @returns
   */
  public getWagerList(
    ident: string,
    wagerStatus: string,
    beginTime: number,
    endTime: number,
    page: number,
    pageSize: number
  ): Observable<
    ResponseListData<CasinoDealRecord[] | SportDealRecord[] | ChessDealRecord[] | LotteryDealRecord[]>['data']
  > {
    return this.gameOrderApi
      .getWagerList(GAMETYPE_MAP[ident], wagerStatus, beginTime, endTime, page, pageSize)
      .pipe(map(v => v?.data));
  }
}
