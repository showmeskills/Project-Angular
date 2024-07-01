import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  ActivityBaseInfo,
  BonusSetting,
  DetailWithList,
  HistoryDetail,
  HistoryList,
  LeaderBoard,
  RecentActivity,
  UserOptions,
} from '../interfaces/free-jackpot.interface';
import { ResponseData } from '../interfaces/response.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class FreeJackpotApi extends BaseApi {
  /**
   * 竞猜活动 ==》取得活动基础资讯 (活动header顶部)
   *
   * @param activityCode 活动code
   * @returns
   */
  getActivityBaseInfo(activityCode: string): Observable<ResponseData<ActivityBaseInfo>> {
    const url = `${environment.apiUrl}/v1/asset/bonus/getactivitybaseinfo`;
    return this.get(url, { activityCode });
  }

  /**
   * 竞猜活动 ==》查询活动奖励范围 (活动header中间部分)
   *
   * @param activityCode 活动code
   * @returns
   */
  getBonusSetting(activityCode: string): Observable<ResponseData<BonusSetting[]>> {
    const url = `${environment.apiUrl}/v1/asset/bonus/getbonussetting`;
    return this.get(url, { activityCode });
  }

  /**
   * 竞猜活动 ==》取得指定使用者参与且已结算的活动详细记录 （历史竞猜）
   *
   * @param activityCode 活动code
   * @returns
   */
  getHistoryDetail(activityCode: string): Observable<ResponseData<HistoryDetail[]>> {
    const url = `${environment.apiUrl}/v1/asset/bonus/gethistorydetail`;
    return this.get(url, { activityCode });
  }

  /**
   * 竞猜活动 ==》取得指定使用者的参与列表 （历时竞猜下拉框）
   *
   * @returns
   */
  getHistoryList(): Observable<ResponseData<HistoryList[]>> {
    const url = `${environment.apiUrl}/v1/asset/bonus/gethistorylist`;
    return this.get(url);
  }

  /**
   * 竞猜活动 ==》取得指定使用者是否已参与和选择项目的资讯 (当前竞猜)
   *
   * @param activityCode 活动code
   * @returns
   */
  getUserOptions(activityCode: string): Observable<ResponseData<UserOptions>> {
    const url = `${environment.apiUrl}/v1/asset/bonus/getuseroptions`;
    return this.get(url, { activityCode });
  }

  /**
   * 取得指定活动ID的排行榜
   *
   * @param activityCode 活动code
   * @param pageSize 每页数量
   * @param pageIndex 当前页码
   * @returns
   */
  getLeaderBoard(activityCode: string, pageSize: number, pageIndex: number): Observable<ResponseData<LeaderBoard>> {
    const url = `${environment.apiUrl}/v1/asset/bonus/getleaderboard`;
    return this.get(url, { activityCode, pageSize, pageIndex });
  }

  /**
   * 竞猜活动 ==》取得排行榜列表 （排行榜列表下拉框）
   *
   * @param amount 数量
   * @returns
   */
  getLeaderBoardList(amount: number): Observable<ResponseData<DetailWithList>> {
    const url = `${environment.apiUrl}/v1/asset/bonus/getleaderboardlist`;
    return this.get(url, { amount });
  }

  /**
   * 竞猜活动 ==》查询最近活动
   *
   * @returns
   */
  getRecentActivity(): Observable<ResponseData<RecentActivity>> {
    const url = `${environment.apiUrl}/v1/asset/bonus/getrecentactivity`;
    return this.get(url);
  }

  /**
   * 竞猜活动 ==》竞猜活动 ==》添加或更新使用者的选择 (提交预测)
   *
   * @param params 用户竞猜提交参数
   * @returns
   */
  setUserOptions(params: any): Observable<any> {
    const url = `${environment.apiUrl}/v1/asset/bonus/setuseroptions`;
    return this.post(url, params);
  }

  /**
   * 竞猜活动 ==》取的指定使用者的参与列表
   *
   * @param amount 数量
   * @returns
   */
  getHistoryDetailWithList(amount: number): Observable<ResponseData<DetailWithList>> {
    const url = `${environment.apiUrl}/v1/asset/bonus/gethistorydetailwithlist`;
    return this.get(url, { amount });
  }
}
