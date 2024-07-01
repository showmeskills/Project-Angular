import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  NewUserActivity,
  TournamentList,
  TournamentRankList,
  WheelCondition,
  WheelHistory,
  WheelInfo,
  WheelPrize,
} from '../interfaces/activity.interface';
import { ResponseData } from '../interfaces/response.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class ActivityApi extends BaseApi {
  /**
   * 转动轮盘
   *
   * @param activityCode 活动id
   * @returns
   */
  turntablerun(activityCode: string): Observable<ResponseData<WheelPrize>> {
    const url = `${environment.apiUrl}/v1/resource/activity/turntablerun`;
    return this.post(url, { activityCode });
  }

  /**
   * 获取活动资讯
   *
   * @returns
   */
  getturntableinformation(): Observable<ResponseData<WheelInfo[]>> {
    const url = `${environment.apiUrl}/v1/resource/activity/getmoreturntableinformation`;
    return this.get(url);
  }

  /**
   * 取得剩余次数、距离下次抽奖的条件
   *
   * @param activityCode 活动id
   * @returns
   */
  getturntablegaptospin(activityCode: string): Observable<ResponseData<WheelCondition>> {
    const url = `${environment.apiUrl}/v1/resource/activity/getturntablegaptospin`;
    return this.get(url, { activityCode });
  }

  /**
   * 获取大转盘中奖历史（所有人）
   *
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param pageIndex 当前页码
   * @param pageSize 每页条数
   * @returns
   */
  getturntableprizehistory(
    startTime: number,
    endTime: number,
    pageIndex: number,
    pageSize: number,
  ): Observable<ResponseData<WheelHistory>> {
    const url = `${environment.apiUrl}/v1/resource/activity/getturntableprizehistory`;
    return this.get(url, { startTime, endTime, pageIndex, pageSize });
  }

  /**
   * 获取大转盘转动历史（用户自己）
   *
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param pageIndex 当前页码
   * @param pageSize 每页条数
   * @returns
   */
  getturntablspinhistory(
    startTime: number,
    endTime: number,
    pageIndex: number,
    pageSize: number,
  ): Observable<ResponseData<WheelHistory>> {
    const url = `${environment.apiUrl}/v1/resource/activity/getturntablspinhistory`;
    return this.get(url, { startTime, endTime, pageIndex, pageSize });
  }

  /**
   * 查询用户可申请的新用户红利
   *
   * @returns
   */
  getnewuseractivityapply(): Observable<ResponseData<NewUserActivity[]>> {
    const url = `${environment.apiUrl}/v1/resource/activity/getnewuseractivityapply`;
    return this.get(url);
  }

  /**
   * 用户申请新用户红利
   *
   * @param prizeCode 奖品编号
   * @param tmpCode 活动编号
   * @param tmpType 模板类型 rank-竞赛模板 newuser-新人模板 deposit-首存送 guess-竞猜 spin-轮盘
   * @returns
   */
  newuseractivityapply(prizeCode: string, tmpCode: string, tmpType: string): Observable<ResponseData<boolean>> {
    const url = `${environment.apiUrl}/v1/resource/activity/newuseractivityapply`;
    return this.post(url, { prizeCode, tmpCode, tmpType });
  }

  /**
   * 获取 tournament 列表
   *
   * @param params
   * @param params.startDto
   * @param params.startDto.current
   * @param params.startDto.orderDirection
   * @param params.startDto.size
   * @param params.endDto
   * @param params.endDto.current
   * @param params.endDto.orderDirection
   * @param params.endDto.size
   * @param params.preDto
   * @param params.preDto.current
   * @param params.preDto.orderDirection
   * @param params.preDto.size
   * @returns
   */
  getTournamentList(params: {
    startDto: {
      current: number;
      orderDirection: 'desc' | 'asc';
      size: number;
    };
    endDto: {
      current: number;
      orderDirection: 'desc' | 'asc';
      size: number;
    };
    preDto: {
      current: number;
      orderDirection: 'desc' | 'asc';
      size: number;
    };
  }): Observable<TournamentList> {
    const url = `${environment.apiUrl}/v1/resource/activity/getnewranklist`;
    return this.post<ResponseData<TournamentList>>(url, params).pipe(
      map(
        v =>
          v?.data || {
            endList: null,
            startList: null,
            perList: null,
          },
      ),
    );
  }

  /**
   * tournament 报名
   *
   * @param params
   * @param params.tmpCode
   * @returns
   */
  onTournamentApply(params: { tmpCode: string }): Observable<boolean> {
    const url = `${environment.apiUrl}/v1/resource/activity/newrankactivityapply`;
    return this.post<ResponseData<boolean>>(url, params).pipe(map(v => v?.data || false));
  }

  /**
   * 获取 tournament 排名
   *
   * @param params
   * @param params.gameTypeDto 活动内页传
   * @param params.gameTypeDto.gameCategory
   * @param params.gameTypeDto.gameCode
   * @param params.gameTypeDto.gameProvider
   * @param params.tmpCodes 竞赛活动主页传
   * @param params.current
   * @param params.size
   * @returns
   */
  tournamentRankList(params: {
    gameTypeDto?: {
      gameCategory: string;
      gameCode: string;
      gameProvider: string;
    };
    tmpCodes?: string[];
    current?: number;
    size?: number;
  }): Observable<TournamentRankList[]> {
    const url = `${environment.apiUrl}/v1/resource/activity/getnewrankresult`;

    // return of([
    //   {
    //     nowTime: 1700796671659,
    //     numberVos: [
    //       {
    //         rankNum: 1,
    //         amount: 1000.0,
    //         currency: 'CNY',
    //         prizeType: 1,
    //         prizeFullName: '现金券100CNY',
    //         prizeShortName: '现金券100CNY',
    //       },
    //       {
    //         rankNum: 2,
    //         amount: 1000.0,
    //         currency: 'CNY',
    //         prizeType: 1,
    //         prizeFullName: '现金券100CNY',
    //         prizeShortName: '现金券100CNY',
    //       },
    //       {
    //         rankNum: 3,
    //         amount: 100.0,
    //         currency: 'USDT',
    //         prizeType: 1,
    //         prizeFullName: '中文100U',
    //         prizeShortName: '中文100U描述',
    //       },
    //       {
    //         rankNum: 4,
    //         amount: 100.0,
    //         currency: 'USDT',
    //         prizeType: 1,
    //         prizeFullName: '中文100U',
    //         prizeShortName: '中文100U描述',
    //       },
    //       {
    //         rankNum: 5,
    //         amount: 50.0,
    //         currency: 'USDT',
    //         prizeType: 1,
    //         prizeFullName: 'Blake Test',
    //         prizeShortName: 'Blake Test',
    //       },
    //       {
    //         rankNum: 6,
    //         amount: 50.0,
    //         currency: 'USDT',
    //         prizeType: 1,
    //         prizeFullName: 'Blake Test',
    //         prizeShortName: 'Blake Test',
    //       },
    //       {
    //         rankNum: 7,
    //         amount: 10.0,
    //         currency: 'USDT',
    //         prizeType: 1,
    //         prizeFullName: '风控现金券',
    //         prizeShortName: '风控现金券',
    //       },
    //       {
    //         rankNum: 8,
    //         amount: 10.0,
    //         currency: 'USDT',
    //         prizeType: 1,
    //         prizeFullName: '风控现金券',
    //         prizeShortName: '风控现金券',
    //       },
    //       {
    //         rankNum: 9,
    //         amount: 100.0,
    //         currency: 'CNY',
    //         prizeType: 1,
    //         prizeFullName: '测试CNY',
    //         prizeShortName: '测试CNY',
    //       },
    //       {
    //         rankNum: 10,
    //         amount: 100.0,
    //         currency: 'CNY',
    //         prizeType: 1,
    //         prizeFullName: '测试CNY',
    //         prizeShortName: '测试CNY',
    //       },
    //     ],
    //     pageTable: {
    //       current: 1,
    //       pages: 2,
    //       records: [
    //         {
    //           prizeId: '877',
    //           isEqualPosition: false,
    //           rankNumber: 1,
    //           rankScore: 1626,
    //           tenantWinOrLost: -241,
    //           uid: '01000265',
    //           userName: 'conan0033',
    //           uidActiveFlow: 1626,
    //           uidBetMoney: 1626,
    //           uidWinOrLost: 241,
    //           amount: 1000.0,
    //           currency: 'CNY',
    //           prizeType: 1,
    //           prizeFullName: '现金券100CNY',
    //           prizeShortName: '现金券100CNY',
    //         },
    //         {
    //           prizeId: '877',
    //           isEqualPosition: false,
    //           rankNumber: 2,
    //           rankScore: 151,
    //           tenantWinOrLost: -21,
    //           uid: '01004968',
    //           userName: '01004968',
    //           uidActiveFlow: 151,
    //           uidBetMoney: 151,
    //           uidWinOrLost: 21,
    //           amount: 1000.0,
    //           currency: 'CNY',
    //           prizeType: 1,
    //           prizeFullName: '现金券100CNY',
    //           prizeShortName: '现金券100CNY',
    //         },
    //         {
    //           prizeId: '742',
    //           isEqualPosition: false,
    //           rankNumber: 3,
    //           rankScore: 127,
    //           tenantWinOrLost: 81,
    //           uid: '01004970',
    //           userName: '01004970',
    //           uidActiveFlow: 127,
    //           uidBetMoney: 127,
    //           uidWinOrLost: -81,
    //           amount: 100.0,
    //           currency: 'USDT',
    //           prizeType: 1,
    //           prizeFullName: '中文100U',
    //           prizeShortName: '中文100U描述',
    //         },
    //         {
    //           prizeId: '742',
    //           isEqualPosition: false,
    //           rankNumber: 4,
    //           rankScore: 77,
    //           tenantWinOrLost: 17,
    //           uid: '01005211',
    //           userName: '01005211',
    //           uidActiveFlow: 77,
    //           uidBetMoney: 77,
    //           uidWinOrLost: -17,
    //           amount: 100.0,
    //           currency: 'USDT',
    //           prizeType: 1,
    //           prizeFullName: '中文100U',
    //           prizeShortName: '中文100U描述',
    //         },
    //         {
    //           prizeId: '814',
    //           isEqualPosition: false,
    //           rankNumber: 5,
    //           rankScore: 59,
    //           tenantWinOrLost: 4,
    //           uid: '01004969',
    //           userName: '01004969',
    //           uidActiveFlow: 59,
    //           uidBetMoney: 59,
    //           uidWinOrLost: -4,
    //           amount: 50.0,
    //           currency: 'USDT',
    //           prizeType: 1,
    //           prizeFullName: 'Blake Test',
    //           prizeShortName: 'Blake Test',
    //         },
    //         {
    //           prizeId: '814',
    //           isEqualPosition: false,
    //           rankNumber: 6,
    //           rankScore: 31,
    //           tenantWinOrLost: 10,
    //           uid: '01004971',
    //           userName: '01004971',
    //           uidActiveFlow: 31,
    //           uidBetMoney: 31,
    //           uidWinOrLost: -10,
    //           amount: 50.0,
    //           currency: 'USDT',
    //           prizeType: 1,
    //           prizeFullName: 'Blake Test',
    //           prizeShortName: 'Blake Test',
    //         },
    //         {
    //           prizeId: '740',
    //           isEqualPosition: false,
    //           rankNumber: 7,
    //           rankScore: 19,
    //           tenantWinOrLost: 12,
    //           uid: '01005229',
    //           userName: '01005229',
    //           uidActiveFlow: 19,
    //           uidBetMoney: 19,
    //           uidWinOrLost: -12,
    //           amount: 10.0,
    //           currency: 'USDT',
    //           prizeType: 1,
    //           prizeFullName: '风控现金券',
    //           prizeShortName: '风控现金券',
    //         },
    //         {
    //           prizeId: '740',
    //           isEqualPosition: false,
    //           rankNumber: 8,
    //           rankScore: 14,
    //           tenantWinOrLost: 14,
    //           uid: '01005230',
    //           userName: '01005230',
    //           uidActiveFlow: 14,
    //           uidBetMoney: 14,
    //           uidWinOrLost: -14,
    //           amount: 10.0,
    //           currency: 'USDT',
    //           prizeType: 1,
    //           prizeFullName: '风控现金券',
    //           prizeShortName: '风控现金券',
    //         },
    //         {
    //           prizeId: '826',
    //           isEqualPosition: false,
    //           rankNumber: 9,
    //           rankScore: 11,
    //           tenantWinOrLost: 11,
    //           uid: '01005226',
    //           userName: '01005226',
    //           uidActiveFlow: 11,
    //           uidBetMoney: 11,
    //           uidWinOrLost: -11,
    //           amount: 100.0,
    //           currency: 'CNY',
    //           prizeType: 1,
    //           prizeFullName: '测试CNY',
    //           prizeShortName: '测试CNY',
    //         },
    //         {
    //           prizeId: '826',
    //           isEqualPosition: false,
    //           rankNumber: 10,
    //           rankScore: 8,
    //           tenantWinOrLost: 8,
    //           uid: '01005231',
    //           userName: '01005231',
    //           uidActiveFlow: 8,
    //           uidBetMoney: 8,
    //           uidWinOrLost: -8,
    //           amount: 100.0,
    //           currency: 'CNY',
    //           prizeType: 1,
    //           prizeFullName: '测试CNY',
    //           prizeShortName: '测试CNY',
    //         },
    //       ],
    //       size: 10,
    //       total: 18,
    //     },
    //     provider: 'SlotGame',
    //     rankType: 1,
    //     currentUserRank: {
    //       prizeId: '877',
    //       isEqualPosition: false,
    //       rankNumber: 20,
    //       rankScore: 1626,
    //       tenantWinOrLost: -241,
    //       uid: '01000264',
    //       userName: '01000264',
    //       uidActiveFlow: 1626,
    //       uidBetMoney: 1626,
    //       uidWinOrLost: 241,
    //       amount: 1000.0,
    //       currency: 'CNY',
    //       prizeType: 1,
    //       prizeFullName: '现金券100CNY',
    //       prizeShortName: '现金券100CNY',
    //     },
    //     tmpCode: '1942512672117125',
    //     activityName: '正在进行的',
    //     activitySubName: '正在进行的',
    //     activitySlogan: null,
    //     activityContent: '<p>正在进行的</p>',
    //     activityThumbnails:
    //       'https://d16j89jl5zb4v5.cloudfront.net/GameProvider/23/06/23/638363235633876195/file/638363235633868439.png',
    //     gameLists: [
    //       {
    //         providerCatId: 'bgaming-5',
    //         id: 1386108524348357,
    //         providerId: 'bgaming',
    //         providerName: 'BGaming',
    //         gameId: 'softswiss:AllLuckyClover5',
    //         gameName: '所有幸运四叶草 5',
    //         webLogo:
    //           'https://d16j89jl5zb4v5.cloudfront.net/Games/23/41/10/638089441147511679/zh-cn/softswiss:AllLuckyClover5web.jpg',
    //         status: 'Online',
    //         isTry: false,
    //         isFavorite: false,
    //         bankerAdvantage: 3.0,
    //         isFullScreen: false,
    //         category: 'SlotGame',
    //         webRedirectUrl: '',
    //         appRedirectUrl: '',
    //         gameOpenMethod: null,
    //       },
    //       {
    //         providerCatId: 'bgaming-5',
    //         id: 1386108524348357,
    //         providerId: 'bgaming',
    //         providerName: 'BGaming',
    //         gameId: 'softswiss:AllLuckyClover5',
    //         gameName: '所有幸运四叶草 5',
    //         webLogo:
    //           'https://d16j89jl5zb4v5.cloudfront.net/Games/23/41/10/638089441147511679/zh-cn/softswiss:AllLuckyClover5web.jpg',
    //         status: 'Online',
    //         isTry: false,
    //         isFavorite: false,
    //         bankerAdvantage: 3.0,
    //         isFullScreen: false,
    //         category: 'SlotGame',
    //         webRedirectUrl: '',
    //         appRedirectUrl: '',
    //         gameOpenMethod: null,
    //       },
    //       {
    //         providerCatId: 'bgaming-5',
    //         id: 1386108524348357,
    //         providerId: 'bgaming',
    //         providerName: 'BGaming',
    //         gameId: 'softswiss:AllLuckyClover5',
    //         gameName: '所有幸运四叶草 5',
    //         webLogo:
    //           'https://d16j89jl5zb4v5.cloudfront.net/Games/23/41/10/638089441147511679/zh-cn/softswiss:AllLuckyClover5web.jpg',
    //         status: 'Online',
    //         isTry: false,
    //         isFavorite: false,
    //         bankerAdvantage: 3.0,
    //         isFullScreen: false,
    //         category: 'SlotGame',
    //         webRedirectUrl: '',
    //         appRedirectUrl: '',
    //         gameOpenMethod: null,
    //       },
    //       {
    //         providerCatId: 'bgaming-5',
    //         id: 1387651080163141,
    //         providerId: 'bgaming',
    //         providerName: 'BGaming',
    //         gameId: 'softswiss:AllLuckyClover',
    //         gameName: '所有幸运四叶草',
    //         webLogo:
    //           'https://d16j89jl5zb4v5.cloudfront.net/Games/22/28/27/638024669274421088/zh-cn/softswiss:AllLuckyCloverweb.jpg',
    //         status: 'Online',
    //         isTry: false,
    //         isFavorite: false,
    //         bankerAdvantage: 3.0,
    //         isFullScreen: false,
    //         category: 'SlotGame',
    //         webRedirectUrl: '',
    //         appRedirectUrl: '',
    //         gameOpenMethod: null,
    //       },
    //       {
    //         providerCatId: 'bgaming-5',
    //         id: 1387651080163141,
    //         providerId: 'bgaming',
    //         providerName: 'BGaming',
    //         gameId: 'softswiss:AllLuckyClover',
    //         gameName: '所有幸运四叶草',
    //         webLogo:
    //           'https://d16j89jl5zb4v5.cloudfront.net/Games/22/28/27/638024669274421088/zh-cn/softswiss:AllLuckyCloverweb.jpg',
    //         status: 'Online',
    //         isTry: false,
    //         isFavorite: false,
    //         bankerAdvantage: 3.0,
    //         isFullScreen: false,
    //         category: 'SlotGame',
    //         webRedirectUrl: '',
    //         appRedirectUrl: '',
    //         gameOpenMethod: null,
    //       },
    //       {
    //         providerCatId: 'bgaming-5',
    //         id: 1387651080163141,
    //         providerId: 'bgaming',
    //         providerName: 'BGaming',
    //         gameId: 'softswiss:AllLuckyClover',
    //         gameName: '所有幸运四叶草',
    //         webLogo:
    //           'https://d16j89jl5zb4v5.cloudfront.net/Games/22/28/27/638024669274421088/zh-cn/softswiss:AllLuckyCloverweb.jpg',
    //         status: 'Online',
    //         isTry: false,
    //         isFavorite: false,
    //         bankerAdvantage: 3.0,
    //         isFullScreen: false,
    //         category: 'SlotGame',
    //         webRedirectUrl: '',
    //         appRedirectUrl: '',
    //         gameOpenMethod: null,
    //       },
    //       {
    //         providerCatId: 'bgaming-5',
    //         id: 1387651089026885,
    //         providerId: 'bgaming',
    //         providerName: 'BGaming',
    //         gameId: 'softswiss:AllLuckyClover100',
    //         gameName: '所有幸运四叶草 100',
    //         webLogo:
    //           'https://d16j89jl5zb4v5.cloudfront.net/Games/22/28/27/638024669280336709/zh-cn/softswiss:AllLuckyClover100web.jpg',
    //         status: 'Online',
    //         isTry: false,
    //         isFavorite: false,
    //         bankerAdvantage: 3.0,
    //         isFullScreen: false,
    //         category: 'SlotGame',
    //         webRedirectUrl: '',
    //         appRedirectUrl: '',
    //         gameOpenMethod: null,
    //       },
    //       {
    //         providerCatId: 'bgaming-5',
    //         id: 1387651089026885,
    //         providerId: 'bgaming',
    //         providerName: 'BGaming',
    //         gameId: 'softswiss:AllLuckyClover100',
    //         gameName: '所有幸运四叶草 100',
    //         webLogo:
    //           'https://d16j89jl5zb4v5.cloudfront.net/Games/22/28/27/638024669280336709/zh-cn/softswiss:AllLuckyClover100web.jpg',
    //         status: 'Online',
    //         isTry: false,
    //         isFavorite: false,
    //         bankerAdvantage: 3.0,
    //         isFullScreen: false,
    //         category: 'SlotGame',
    //         webRedirectUrl: '',
    //         appRedirectUrl: '',
    //         gameOpenMethod: null,
    //       },
    //       {
    //         providerCatId: 'bgaming-5',
    //         id: 1387651089026885,
    //         providerId: 'bgaming',
    //         providerName: 'BGaming',
    //         gameId: 'softswiss:AllLuckyClover100',
    //         gameName: '所有幸运四叶草 100',
    //         webLogo:
    //           'https://d16j89jl5zb4v5.cloudfront.net/Games/22/28/27/638024669280336709/zh-cn/softswiss:AllLuckyClover100web.jpg',
    //         status: 'Online',
    //         isTry: false,
    //         isFavorite: false,
    //         bankerAdvantage: 3.0,
    //         isFullScreen: false,
    //         category: 'SlotGame',
    //         webRedirectUrl: '',
    //         appRedirectUrl: '',
    //         gameOpenMethod: null,
    //       },
    //       {
    //         providerCatId: 'bgaming-5',
    //         id: 1387651097775941,
    //         providerId: 'bgaming',
    //         providerName: 'BGaming',
    //         gameId: 'softswiss:AllLuckyClover20',
    //         gameName: '所有幸运四叶草 20',
    //         webLogo:
    //           'https://d16j89jl5zb4v5.cloudfront.net/Games/22/28/27/638024669277395220/zh-cn/softswiss:AllLuckyClover20web.jpg',
    //         status: 'Online',
    //         isTry: false,
    //         isFavorite: false,
    //         bankerAdvantage: 3.0,
    //         isFullScreen: false,
    //         category: 'SlotGame',
    //         webRedirectUrl: '',
    //         appRedirectUrl: '',
    //         gameOpenMethod: null,
    //       },
    //       {
    //         providerCatId: 'bgaming-5',
    //         id: 1387651097775941,
    //         providerId: 'bgaming',
    //         providerName: 'BGaming',
    //         gameId: 'softswiss:AllLuckyClover20',
    //         gameName: '所有幸运四叶草 20',
    //         webLogo:
    //           'https://d16j89jl5zb4v5.cloudfront.net/Games/22/28/27/638024669277395220/zh-cn/softswiss:AllLuckyClover20web.jpg',
    //         status: 'Online',
    //         isTry: false,
    //         isFavorite: false,
    //         bankerAdvantage: 3.0,
    //         isFullScreen: false,
    //         category: 'SlotGame',
    //         webRedirectUrl: '',
    //         appRedirectUrl: '',
    //         gameOpenMethod: null,
    //       },
    //       {
    //         providerCatId: 'bgaming-5',
    //         id: 1387651097775941,
    //         providerId: 'bgaming',
    //         providerName: 'BGaming',
    //         gameId: 'softswiss:AllLuckyClover20',
    //         gameName: '所有幸运四叶草 20',
    //         webLogo:
    //           'https://d16j89jl5zb4v5.cloudfront.net/Games/22/28/27/638024669277395220/zh-cn/softswiss:AllLuckyClover20web.jpg',
    //         status: 'Online',
    //         isTry: false,
    //         isFavorite: false,
    //         bankerAdvantage: 3.0,
    //         isFullScreen: false,
    //         category: 'SlotGame',
    //         webRedirectUrl: '',
    //         appRedirectUrl: '',
    //         gameOpenMethod: null,
    //       },
    //       {
    //         providerCatId: 'bgaming-5',
    //         id: 1387651106377541,
    //         providerId: 'bgaming',
    //         providerName: 'BGaming',
    //         gameId: 'softswiss:AllLuckyClover40',
    //         gameName: '所有幸运四叶草 40',
    //         webLogo:
    //           'https://d16j89jl5zb4v5.cloudfront.net/Games/22/28/27/638024669278863823/zh-cn/softswiss:AllLuckyClover40web.jpg',
    //         status: 'Online',
    //         isTry: false,
    //         isFavorite: false,
    //         bankerAdvantage: 3.0,
    //         isFullScreen: false,
    //         category: 'SlotGame',
    //         webRedirectUrl: '',
    //         appRedirectUrl: '',
    //         gameOpenMethod: null,
    //       },
    //       {
    //         providerCatId: 'bgaming-5',
    //         id: 1387651106377541,
    //         providerId: 'bgaming',
    //         providerName: 'BGaming',
    //         gameId: 'softswiss:AllLuckyClover40',
    //         gameName: '所有幸运四叶草 40',
    //         webLogo:
    //           'https://d16j89jl5zb4v5.cloudfront.net/Games/22/28/27/638024669278863823/zh-cn/softswiss:AllLuckyClover40web.jpg',
    //         status: 'Online',
    //         isTry: false,
    //         isFavorite: false,
    //         bankerAdvantage: 3.0,
    //         isFullScreen: false,
    //         category: 'SlotGame',
    //         webRedirectUrl: '',
    //         appRedirectUrl: '',
    //         gameOpenMethod: null,
    //       },
    //       {
    //         providerCatId: 'bgaming-5',
    //         id: 1387651106377541,
    //         providerId: 'bgaming',
    //         providerName: 'BGaming',
    //         gameId: 'softswiss:AllLuckyClover40',
    //         gameName: '所有幸运四叶草 40',
    //         webLogo:
    //           'https://d16j89jl5zb4v5.cloudfront.net/Games/22/28/27/638024669278863823/zh-cn/softswiss:AllLuckyClover40web.jpg',
    //         status: 'Online',
    //         isTry: false,
    //         isFavorite: false,
    //         bankerAdvantage: 3.0,
    //         isFullScreen: false,
    //         category: 'SlotGame',
    //         webRedirectUrl: '',
    //         appRedirectUrl: '',
    //         gameOpenMethod: null,
    //       },
    //     ],
    //     tmpEndTime: 1701360010000,
    //     tmpStartTime: 1700496010000,
    //   },
    // ]).pipe(map(v => v || [])) as any;

    return this.post<ResponseData<TournamentRankList[]>>(url, params).pipe(map(v => v?.data || []));
  }

  /**
   * tournament 详情页面 是否可以报名
   *
   * @param params
   * @param params.tmpCodes
   * @returns
   */
  onNewRankCheckApply(params: { tmpCodes: string[] }): Observable<{ canJoin: boolean; tmpCode: string }[]> {
    const url = `${environment.apiUrl}/v1/resource/activity/newrankcheckapply`;

    return this.post<ResponseData<{ canJoin: boolean; tmpCode: string }[]>>(url, params).pipe(map(v => v?.data || []));
  }
}
