import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import {
  MarketDataItem,
  MarketDataParams,
  OperaLogParams,
  VipDataItem,
  VIPDataParams,
  MemberBalanceParams,
  MemberBalanceItem,
  ActiveUserParams,
  ActiveUserItem,
  FirstDepositParams,
  FirstDepositItem,
  GameTopParams,
  GameTopItem,
  BankDataParams,
  BankDataItem,
  ProviderggrParams,
  ProviderggrItem,
  ProxyDataParams,
  BonusActivityItem,
  BonusActivityParams,
  BonusPrizeTypeSelect,
  DailyDataReport,
  DailyDataList,
  PlayerBonusDownbreakParams,
  PlayerBonusDownbreak,
  DailyStatisticsParams,
  DailyStatisticsItem,
  PspDepositParams,
  PspDepositList,
  ReportViewerItem,
  ReportCorrespondenceItem,
} from 'src/app/shared/interfaces/stat';
import { PageResponse } from 'src/app/shared/interfaces/base.interface';
import { HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { downloadExcelFile } from 'src/app/shared/models/tools.model';

@Injectable({
  providedIn: 'root',
})
export class StatApi extends BaseApi {
  private _url = `${environment.apiUrl}/admin/stat`;
  private _report = `${environment.apiUrl}/asset/report`;

  /**
   * 获取 会员注册登录统计
   */
  getMemberRegisterLoginStats(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getmemberregisterloginstats`, params);
  }

  /**
   * 获取 会员红利统计
   */
  getMemberBonusStats(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getmemberbonusstats`, params);
  }

  /**
   * 获取 会员游戏统计
   */
  getMemberWagerStats(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getmemberwagerstats`, params);
  }

  /**
   * 查询用户资金数据
   */
  getMemberFundsStats(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getmemberfundsstats`, params);
  }

  /**
   * 获取 查询用户首存数据
   */
  getMemberFirstDepositStats(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getmemberfirstdepositstats`, params);
  }

  /**
   * 获取 用户结存 数据
   */
  getMemberBalanceStats(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getmemberbalancestats`, params);
  }

  /**
   * 查询 用户资金分时 数据
   */
  getMemberTimeShareFounds(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getmembertimesharefounds`, params);
  }

  /**
   * 重新统计接口
   */
  restat(params: any): Observable<any> {
    return this.post<any>(`${this._url}/restat`, params);
  }

  /**
   * 统计指定Uid用户首存数据
   */
  firstDepositState(params: any): Observable<any> {
    return this.post<any>(`${this._url}/firstdepositstate`, params);
  }

  /**
   *  待重新统计数据 获取
   */
  getReStats(): Observable<any> {
    return this.get<any>(`${this._url}/getrestats`);
  }

  /**
   * 市场数据
   */
  getMarketData(params: MarketDataParams): Observable<PageResponse<MarketDataItem>> {
    return this.get<any>(`${this._report}/marketreport`, params);
  }

  /**
   * 市场数据cvs下载
   */
  cvsMarketData(params: MarketDataParams): Observable<boolean> {
    return this.get<any>(
      `${this._report}/marketreport`,
      { ...params, isExport: true },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.localStorageService.token}`,
          lang: this.langService.currentLang?.toLowerCase() || 'zh-cn',
        }),
        responseType: 'blob',
        throwError: true,
      }
    ).pipe(
      map((res) => {
        if (!res) return false;
        downloadExcelFile(res, `marketData - ${Date.now()}.xlsx`);
        return true;
      })
    );
  }

  /**
   * 提款日志
   */
  getOperaLogData(params: OperaLogParams): Observable<PageResponse<MarketDataItem>> {
    return this.get<any>(`${this._report}/operationreport`, params);
  }

  /**
   * 提款日志cvs下载
   */
  cvsOperaLogData(params: OperaLogParams): Observable<boolean> {
    return this.get<any>(
      `${this._report}/operationreport`,
      { ...params, isExport: true },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.localStorageService.token}`,
          lang: this.langService.currentLang?.toLowerCase() || 'zh-cn',
        }),
        responseType: 'blob',
        throwError: true,
      }
    ).pipe(
      map((res) => {
        if (!res) return false;
        downloadExcelFile(res, `operaLog - ${Date.now()}.xlsx`);
        return true;
      })
    );
  }

  /**
   * VIP数据
   */
  getVIPDataData(params: VIPDataParams): Observable<PageResponse<VipDataItem>> {
    return this.get<any>(`${this._report}/vipreport`, params);
  }

  /**
   * VIP数据cvs下载
   */
  cvsVIPDataData(params: VIPDataParams): Observable<boolean> {
    return this.get<any>(
      `${this._report}/vipreport`,
      { ...params, isExport: true },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.localStorageService.token}`,
          lang: this.langService.currentLang?.toLowerCase() || 'zh-cn',
        }),
        responseType: 'blob',
        throwError: true,
      }
    ).pipe(
      map((res) => {
        if (!res) return false;
        downloadExcelFile(res, `vipData - ${Date.now()}.xlsx`);
        return true;
      })
    );
  }

  /**
   * 会员余额数据
   */
  getmemberBalanceData(params: MemberBalanceParams): Observable<PageResponse<MemberBalanceItem>> {
    return this.get<any>(`${this._report}/userbalancereport`, params);
  }

  /**
   * 会员余额cvs下载
   */
  cvsMemberBalancData(params: MemberBalanceParams): Observable<boolean> {
    return this.get<any>(
      `${this._report}/userbalancereport`,
      { ...params, isExport: true },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.localStorageService.token}`,
          lang: this.langService.currentLang?.toLowerCase() || 'zh-cn',
        }),
        responseType: 'blob',
        throwError: true,
      }
    ).pipe(
      map((res) => {
        if (!res) return false;
        downloadExcelFile(res, `userbalance - ${Date.now()}.xlsx`);
        return true;
      })
    );
  }

  /**
   * 活跃用户
   */
  getActiveUserData(params: ActiveUserParams): Observable<PageResponse<ActiveUserItem>> {
    return this.get<any>(`${this._report}/activeuserreport`, params);
  }

  /**
   * 活跃用户cvs下载
   */
  cvsActiveUserData(params: ActiveUserParams): Observable<boolean> {
    return this.get<any>(
      `${this._report}/activeuserreport`,
      { ...params, isExport: true },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.localStorageService.token}`,
          lang: this.langService.currentLang?.toLowerCase() || 'zh-cn',
        }),
        responseType: 'blob',
        throwError: true,
      }
    ).pipe(
      map((res) => {
        if (!res) return false;
        downloadExcelFile(res, `activeUser - ${Date.now()}.xlsx`);
        return true;
      })
    );
  }

  /**
   * 首存数据
   */
  getFirstDepositData(params: FirstDepositParams): Observable<PageResponse<FirstDepositItem>> {
    return this.get<any>(`${this._report}/firstdepositreport`, params);
  }

  /**
   * 首存数据cvs下载
   */
  cvsFirstDepositData(params: FirstDepositParams): Observable<boolean> {
    return this.get<any>(
      `${this._report}/firstdepositreport`,
      { ...params, isExport: true },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.localStorageService.token}`,
          lang: this.langService.currentLang?.toLowerCase() || 'zh-cn',
        }),
        responseType: 'blob',
        throwError: true,
      }
    ).pipe(
      map((res) => {
        if (!res) return false;
        downloadExcelFile(res, `firstDeposit - ${Date.now()}.xlsx`);
        return true;
      })
    );
  }

  /**
   * 游戏排行100
   */
  getGameToptData(params: GameTopParams): Observable<Array<GameTopItem>> {
    return this.get<any>(`${this._report}/gameTopreport`, params);
  }

  /**
   * 游戏排行100cvs下载
   */
  cvsGameTopData(params: GameTopParams): Observable<boolean> {
    return this.get<any>(
      `${this._report}/gameTopreport`,
      { ...params, isExport: true },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.localStorageService.token}`,
          lang: this.langService.currentLang?.toLowerCase() || 'zh-cn',
        }),
        responseType: 'blob',
        throwError: true,
      }
    ).pipe(
      map((res) => {
        if (!res) return false;
        downloadExcelFile(res, `gameTop - ${Date.now()}.xlsx`);
        return true;
      })
    );
  }

  /**
   * 银行卡新增数据
   */
  getBankDatatData(params: BankDataParams): Observable<Array<BankDataItem>> {
    return this.get<any>(`${this._report}/bankreport`, params);
  }

  /**
   * 银行卡新增数据cvs下载
   */
  cvsBankDataData(params: BankDataParams): Observable<boolean> {
    return this.get<any>(
      `${this._report}/bankreport`,
      { ...params, isExport: true },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.localStorageService.token}`,
          lang: this.langService.currentLang?.toLowerCase() || 'zh-cn',
        }),
        responseType: 'blob',
        throwError: true,
      }
    ).pipe(
      map((res) => {
        if (!res) return false;
        downloadExcelFile(res, `bankData - ${Date.now()}.xlsx`);
        return true;
      })
    );
  }

  /**
   * 游戏厂商GGR数据
   */
  getProviderggrData(params: ProviderggrParams): Observable<PageResponse<ProviderggrItem>> {
    return this.get<any>(`${this._report}/providerggrreport`, params);
  }

  /**
   * 游戏厂商GGR数据cvs下载
   */
  cvsProviderggrData(params: ProviderggrParams): Observable<boolean> {
    return this.get<any>(
      `${this._report}/providerggrreport`,
      { ...params, isExport: true },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.localStorageService.token}`,
          lang: this.langService.currentLang?.toLowerCase() || 'zh-cn',
        }),
        responseType: 'blob',
        throwError: true,
      }
    ).pipe(
      map((res) => {
        if (!res) return false;
        downloadExcelFile(res, `providerggr - ${Date.now()}.xlsx`);
        return true;
      })
    );
  }

  /**
   * 代理数据
   */
  getProxyDataData(params: ProxyDataParams): Observable<any> {
    // return this.get<any>(`${environment.apiUrl}/agent/commission_query`, params);
    return this.post<any>(`${environment.apiUrl}/agent/commission_query`, params);
  }

  /**
   * 代理数据cvs下载
   *
   */
  cvsProxyDataData(params: ProxyDataParams): Observable<boolean> {
    return this.get<any>(
      `${environment.apiUrl}/agent/file/commission_export`,
      { ...params },
      {
        // headers: new HttpHeaders({
        //   'Accept': "*/*",
        //   'Request-Origion': "Knife4j",
        //   'Content-Type': 'application/x-www-form-urlencoded',
        //   'accessKey': '1234'
        // }),
        responseType: 'blob',
        throwError: true,
      }
    ).pipe(
      map((res) => {
        if (!res) return false;
        downloadExcelFile(res, `proxyData - ${Date.now()}.xls`);
        return true;
      })
    );
  }

  /**
   * 红利数据
   */
  getBonusActivityData(params: BonusActivityParams): Observable<BonusActivityItem[]> {
    return this.get<any>(`${this._report}/bonusactivityreport`, params);
  }

  /**
   * 红利类别选择框
   */
  getBonusTypeSelect(): Observable<BonusPrizeTypeSelect[]> {
    return this.get<any>(`${this._report}/bonustypeselect`);
  }

  /**
   *  奖品类别选择框
   */
  getPrizeTypeSelect(): Observable<BonusPrizeTypeSelect[]> {
    return this.get<any>(`${this._report}/prizetypeselect`);
  }

  /**
   * 红利数据cvs下载
   */
  cvsBonusActivityData(params: BonusActivityParams): Observable<boolean> {
    return this.get<any>(
      `${this._report}/bonusactivityreport`,
      { ...params, isExport: true },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.localStorageService.token}`,
          lang: this.langService.currentLang?.toLowerCase() || 'zh-cn',
        }),
        responseType: 'blob',
        throwError: true,
      }
    ).pipe(
      map((res) => {
        if (!res) return false;
        downloadExcelFile(res, `BonusActivity - ${Date.now()}.xlsx`);
        return true;
      })
    );
  }

  /**
   * 每日数据
   * @param params
   * @returns
   */
  getDailyDataReport(params: DailyDataReport): Observable<{ list: Array<DailyDataList>; total: number }> {
    return this.get<any>(`${this._report}/dailydatareport`, params);
  }

  /**
   * 每日数据导出
   */
  exportDailyDataReport(params: DailyDataReport): Observable<boolean> {
    return this.get<any>(
      `${this._report}/dailydatareport`,
      { ...params, isExport: true },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.localStorageService.token}`,
          lang: this.langService.currentLang?.toLowerCase() || 'zh-cn',
        }),
        responseType: 'blob',
        throwError: true,
      }
    ).pipe(
      map((res) => {
        if (!res) return false;
        downloadExcelFile(res, `DailyDataReport - ${Date.now()}.xlsx`);
        return true;
      })
    );
  }

  /**
   * 会员红利详情
   */
  getPalyerBonusBreakdown(
    params: PlayerBonusDownbreakParams
  ): Observable<{ list: PlayerBonusDownbreak[]; total: number }> {
    return this.get<any>(`${this._report}/userbonusactivity`, params);
  }

  /**
   * 每日数据导出
   */
  exportPlayerBonusBreakdown(params: PlayerBonusDownbreakParams): Observable<boolean> {
    return this.get<any>(
      `${this._report}/userbonusactivity`,
      { ...params, isExport: true },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.localStorageService.token}`,
          lang: this.langService.currentLang?.toLowerCase() || 'zh-cn',
        }),
        responseType: 'blob',
        throwError: true,
      }
    ).pipe(
      map((res) => {
        if (!res) return false;
        downloadExcelFile(res, `Player Bonus Breakdown - ${Date.now()}.xlsx`);
        return true;
      })
    );
  }

  /**
   * 每日统计数据
   */
  getDailyStatisticsData(params: DailyStatisticsParams): Observable<PageResponse<DailyStatisticsItem>> {
    return this.get<any>(`${this._report}/dailystatisticsdatareport`, params);
  }

  /**
   * 每日统计数据cvs下载
   */
  cvsDailyStatisticsData(params: DailyStatisticsParams): Observable<boolean> {
    return this.get<any>(
      `${this._report}/dailystatisticsdatareport`,
      { ...params, isExport: true },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.localStorageService.token}`,
          lang: this.langService.currentLang?.toLowerCase() || 'zh-cn',
        }),
        responseType: 'blob',
        throwError: true,
      }
    ).pipe(
      map((res) => {
        if (!res) return false;
        downloadExcelFile(res, `DailyStatistics - ${Date.now()}.xlsx`);
        return true;
      })
    );
  }

  /**
   * 获取PSP 存款统计
   * @param params
   * @returns
   */
  getPspDeposit(params: PspDepositParams): Observable<{ list: Array<PspDepositList>; total: number }> {
    return this.get<any>(`${this._report}/depositcompletiontimestatisticsreport`, params);
  }

  /**
   * PSP完成日期统计导出
   */
  exportPspDeposit(params: PspDepositParams): Observable<boolean> {
    return this.get<any>(
      `${this._report}/depositcompletiontimestatisticsreport`,
      { ...params, isExport: true },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.localStorageService.token}`,
          lang: this.langService.currentLang?.toLowerCase() || 'zh-cn',
        }),
        responseType: 'blob',
        throwError: true,
      }
    ).pipe(
      map((res) => {
        if (!res) return false;
        downloadExcelFile(res, `PSP Deposit Completion Time Statistics - ${Date.now()}.xlsx`);
        return true;
      })
    );
  }

  /**
   * 报告查看 - 获取列表数据
   */
  getmemberview(params): Observable<{ list: Array<ReportViewerItem>; total: number }> {
    return this.get<any>(`${this._url}/getmemberview`, params);
  }

  /**
   * 报告查看 - 获取导出数据
   */
  getmemberviewexport(params): Observable<{ list: Array<ReportViewerItem>; total: number }> {
    return this.get<any>(`${this._url}/memberviewexport`, params);
  }

  /**
   * 报告查看：通讯记录 - 获取列表数据
   */
  getmessageboardinforeport(params): Observable<{ list: Array<ReportCorrespondenceItem>; total: number }> {
    return this.get<any>(`${this._url}/getmessageboardinforeport`, params);
  }
}
