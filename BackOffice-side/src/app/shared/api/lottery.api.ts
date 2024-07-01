import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { OriginalRatewinParams } from 'src/app/shared/interfaces/original.interface';
@Injectable({
  providedIn: 'root',
})
export class LotteryApi extends BaseApi {
  private _url = `${environment.apiUrl}/lottery`;
  private _urlOriginal = `${environment.apiUrl}/original`;
  private _urlNewOriginal = `${environment.apiUrl}/game`;
  /**
   * 注单列表查询
   */
  lotteryBetGetpage(tenantResources: any, params: any): Observable<any> {
    return this.post<any>(`${this._url}/lotterybet_getpage?tenantResources=${tenantResources}`, params);
  }

  /**
   * 根据彩种查盘口列表查询
   */
  lotterySetupGetlotteryBylotteryType(lotteryType: any): Observable<any> {
    return this.get<any>(`${this._url}/lotterysetup_getlotterybylotterytype?lotteryType=${lotteryType}`);
  }

  /**
   * 根据盘口名称查询所有玩法表查询
   */
  lotteryPlayGetPlayListBylotteryname(lotteryName: any): Observable<any> {
    return this.get<any>(`${this._url}/lotteryplay_getplaylistbylotteryname?LotteryName=${lotteryName}`);
  }

  /**
   * 彩种设定查询分页
   */
  lotterySetupPage(tenantResources: any, params: any): Observable<any> {
    return this.post<any>(`${this._url}/lotterysetup_page?tenantResources=${tenantResources}`, params);
  }

  /**
   * 彩种设定ID获取对象信息
   */
  lotterySetupGetById(tenantResources: any, lotterySetUpId: any): Observable<any> {
    return this.get<any>(
      `${this._url}/lotterysetup_getbyid?tenantResources=${tenantResources}&lotterySetUpId=${lotterySetUpId}`
    );
  }

  /**
   * 修改彩种设定
   */
  lotterySetupUpdate(tenantResources: any, params: any): Observable<any> {
    return this.post<any>(`${this._url}/lotterysetup_update?tenantResources=${tenantResources}`, params);
  }

  /**
   * 根据id查询玩法
   */
  getLotteryPlayById(lotteryPlayId: any): Observable<any> {
    return this.post<any>(`${this._url}/lotteryplay_getlotteryplaybyid?lotteryPlayId=${lotteryPlayId}`);
  }

  /**
   * 赔率设定表列表查询
   */
  getOddsSettingList(tenantResources: any, params: any): Observable<any> {
    return this.post<any>(`${this._url}/lotteryplay_getlist?tenantResources=${tenantResources}`, params);
  }

  /**
   * 单个更新Byid
   */
  updateLotteryPlayById(tenantResources: any, params: any): Observable<any> {
    return this.post<any>(`${this._url}/lotteryplay_updatelotteryplaybyid?tenantResources=${tenantResources}`, params);
  }

  /**
   * 一键更新某一类型玩法
   */
  updateBachLotteryPlay(tenantResources: any, params: any): Observable<any> {
    return this.post<any>(`${this._url}/lotteryplay_updatebachlotteryplay?tenantResources=${tenantResources}`, params);
  }

  /**
   * 更改赔率限定金额
   */
  updateLotteryPlayConfigById(params: any): Observable<any> {
    return this.post<any>(`${this._url}/lotteryplay_updatelotteryplayconfigbyid`, params);
  }

  /**
   * 输赢分析首页列表查询
   */
  sysLotteryIssueNumberGetList(tenantResources: any, params: any): Observable<any> {
    return this.post<any>(`${this._url}/syslotteryissuenumber_getlist?tenantResources=${tenantResources}`, params);
  }

  /**
   * 期号亏盈详情分页接口
   */
  sysLotteryIssueNumberGetPage(tenantResources: any, params: any): Observable<any> {
    return this.post<any>(`${this._url}/syslotteryissuenumber_getpage?tenantResources=${tenantResources}`, params);
  }

  /**
   * 期号亏盈总计接口
   */
  sysLotteryIssueNumberGetTotal(tenantResources: any, params: any): Observable<any> {
    return this.post<any>(`${this._url}/syslotteryissuenumber_gettotal?tenantResources=${tenantResources}`, params);
  }

  /**
   * 根据期号ID获取对象信息接口
   */
  sysLotteryIssueNumberGetInfoId(lotteryIssueNumberId: any): Observable<any> {
    return this.get<any>(`${this._url}/syslotteryissuenumber_getinfoid?lotteryIssueNumberId=${lotteryIssueNumberId}`);
  }

  /**
   * 修改开奖结果POST
   */
  sysLotteryIssueNumberUpdateIssueNumber(
    lotteryIssueNumberId: any,
    updateLotteryIssueNumberData: any
  ): Observable<any> {
    return this.get<any>(
      `${this._url}/syslotteryissuenumber_updateissuenumber?lotteryIssueNumberId=${lotteryIssueNumberId}&updateLotteryIssueNumberData=${updateLotteryIssueNumberData}`
    );
  }

  /**
   * 原创--盈亏统计接口
   */
  systemCensusGetPage(tenantResources: any, params: any): Observable<any> {
    return this.post<any>(`${this._urlOriginal}/system_census_getpage?tenantResources=${tenantResources}`, params);
  }

  /**
   * 原创--获取原创游戏游戏集
   */
  systemPlayGetLotteryName(tenantResources: any): Observable<any> {
    return this.get<any>(`${this._urlOriginal}/system_play_getlotteryname?tenantResources=${tenantResources}`);
  }

  /**
   * 原创--注单列表查询
   */
  systemLotteryBetGetPage(tenantResources: any, params: any): Observable<any> {
    return this.post<any>(`${this._urlOriginal}/system_lotterybet_getpage?tenantResources=${tenantResources}`, params);
  }

  /**
   * 原创--获取赔率信息
   */
  getOrignalOddsList(tenantResources: any, lotteryName: any): Observable<any> {
    return this.get<any>(
      `${this._urlOriginal}/system_play_getlotteryplayconfigbyname?lotteryName=${lotteryName}&tenantResources=${tenantResources}`
    );
  }

  /**
   * 原创--更改赔率限定金额
   */
  updateOrignalPlayConfigById(params: any): Observable<any> {
    return this.post<any>(`${this._urlOriginal}/system_play_updatelotteryplayconfigbyid`, params);
  }

  /**
   * 原创--新获取原创游戏游戏集
   */
  getLotteryNameSelect(params): Observable<any> {
    return this.get<any>(`${this._urlNewOriginal}/select/GetGameListSelect`, params);
  }

  /**
   * 原创--获取原创游戏 盈利率分析
   */
  getratewin(params: OriginalRatewinParams): Observable<any> {
    return this.get<any>(`${this._urlOriginal}/getratewin`, params);
  }
}
