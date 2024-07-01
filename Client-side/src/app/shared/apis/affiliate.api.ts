import { Injectable } from '@angular/core';
import moment from 'moment';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  AgentCommissionConstInfo,
  AgentCommissionOverview,
  AgentCommissionReturn,
  AgentDivide,
  DailyProfit,
  FirstDepositList,
  GameTransList,
  GameTransParams,
  GetHistoryExportParams,
  IStatisticUsersList,
  PageParams,
  StatisticUsersList,
  UserRemoveBody,
} from '../interfaces/affiliate.interface';
import { AgentDataView } from '../interfaces/friend.interface';
import { ResponseData } from '../interfaces/response.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class AffiliateApi extends BaseApi {
  //代理联盟总览; table 数据
  getAgentDataView(): Observable<AgentDataView> {
    const url = `${environment.apiUrl}/v1/agent/agent/dataview`;
    return this.get(url).pipe(
      map((x: any) => {
        if (x?.data) {
          // 后端动不动返回null 所以这里我处理一下
          if (x.data.incomeCurrency === null) {
            x.data.incomeCurrency = {};
          }
          if (x.data.rebateCurrency === null) {
            x.data.rebateCurrency = {};
          }
          return x?.data;
        }

        return {
          sum: 0,
          venue: 0,
          pay: 0,
          bonus: 0,
          platform: 0,
          adjust: 0,
          rebate: 0,
          income: 0,
          incomeCurrency: {},
          rebateCurrency: {},
        };
      }),
    );
  }

  /**
   * 首存概括
   *
   * @param params
   * @param params.page
   * @param params.pageSize
   */
  getFirstDepositList(params: { page: number; pageSize: number }): Observable<ResponseData<FirstDepositList>> {
    const url = `${environment.apiUrl}/v1/agent/friend/ftdlist`;
    return this.get(url, params).pipe(map((x: any) => x?.data || { list: [], total: 0 }));
  }

  /**
   * 联盟游戏记录
   *
   * @param params
   */
  getGameTransList(params?: GameTransParams): Observable<ResponseData<GameTransList>> {
    const url = `${environment.apiUrl}/v1/agent/friend/transactionlist`;
    return this.get(url, params).pipe(map((x: any) => x?.data || { list: [], total: 0 }));
  }

  //联盟历史记录 暂时不对接
  getHistoryExport(params: GetHistoryExportParams) {
    const url = `${environment.apiUrl}/v1/agent/agent/historyexport`;
    return firstValueFrom(this.get(url, params));
  }

  /**
   * 会员管理 搜索
   *
   * @param params
   * @returns
   */
  getStatisticUsersList(params?: IStatisticUsersList): Observable<StatisticUsersList> {
    const url = `${environment.apiUrl}/v1/agent/friend/userstatlist`;
    return this.get(url, params).pipe(map((x: any) => x?.data || { list: [], total: 0 }));
  }

  /**
   * 会员移除
   *
   * @param params post请求参数
   * @returns
   */
  removeUser(params: UserRemoveBody): Observable<boolean> {
    const url = `${environment.apiUrl}/v1/agent/agent/userremove`;
    return this.post(url, params).pipe(map((x: any) => x?.data || false));
  }
  // 是否开始启日佣金
  getDailyStatus(): Observable<any> {
    const url = `${environment.apiUrl}/v1/agent/agent/dailystatus`;
    return this.get(url).pipe(map((x: any) => x?.data));
  }

  /**@getAgentCommissionOverview 联盟佣金 - 交易总览 */
  getAgentCommissionOverview(params: PageParams): Observable<AgentCommissionOverview> {
    const url = `${environment.apiUrl}/v1/agent/agent/agentcommissionoverview`;
    return this.get(url, params).pipe(
      map((x: any) => {
        const data = x?.data as AgentCommissionOverview;
        if (data) {
          if (data.list === null) {
            return {
              ...data,
              list: [],
            };
          } else {
            data.list = data.list.map((list: any) => {
              return {
                ...list,
                overheadSum: Number(list.cost).add(list.platform).add(list.venue),
                affiliateCurrency: list.affiliateCurrency === null ? {} : list.affiliateCurrency,
                miscellaneousTotalCurrency:
                  list.miscellaneousTotalCurrency === null ? {} : list.miscellaneousTotalCurrency,
              };
            });
            return data;
          }
        } else {
          return { total: 0, list: [] };
        }
      }),
    );
  }

  /**@getDailyProfit 联盟 日佣金返产品利润*/
  getDailyProfit(params: PageParams): Observable<DailyProfit> {
    const url = `${environment.apiUrl}/v1/agent/agent/dailyprofit`;
    return this.get(url, params).pipe(
      map((x: any) => {
        console.log(x.data);
        if (x?.data) {
          const data = x.data;
          const list = data.list.map((item: any) => {
            const profitVoList = item.profitVoList.map((volist: any) => {
              return {
                ...volist,
                date: this.generalService.toFullTimestamp(item.date),
              };
            });
            return {
              ...item,
              date: this.generalService.toFullTimestamp(item.date),
              profitVoList,
            };
          });
          return {
            ...data,
            list,
          };
        }
        return { total: 0, list: [] };
      }),
    );
  }

  /**
   * 联盟佣金 - 费用明细
   *
   * @param params 分页数据
   * @returns
   */
  getAgentCommissionConstInfo(params: PageParams): Observable<AgentCommissionConstInfo> {
    const url = `${environment.apiUrl}/v1/agent/agent/agentcommissioncostinfo`;
    return this.get(url, params).pipe(
      map((x: any) => {
        const data = x?.data as AgentCommissionConstInfo;
        if (data) {
          if (data.list === null) {
            return {
              ...data,
              list: [],
            };
          }
          const list = data.list
            .map(item => {
              return {
                ...item,
                date: Number(moment(item.date).format('x')),
              };
            })
            .sort((a, b) => Number(b.date).minus(a.date));

          return {
            ...data,
            list,
          };
        } else {
          return { total: 0, list: [] };
        }
      }),
    );
  }

  /**
   * 联盟佣金 - 佣金返还
   *
   * @param params 页码
   * @returns
   */
  getAgentCommissionReturn(params: PageParams): Observable<AgentCommissionReturn> {
    const url = `${environment.apiUrl}/v1/agent/agent/agentcommissionreturn`;
    return this.get(url, params).pipe(
      map((x: any) => {
        const data = x?.data as AgentCommissionReturn;
        if (data) {
          if (data.list === null) {
            return {
              ...data,
              list: [],
            };
          } else {
            data.list = data.list.map(list => {
              return {
                ...list,
                currencyAmount: list.currencyAmount === null ? {} : list.currencyAmount,
              };
            });
            return data;
          }
        } else {
          return { total: 0, list: [] };
        }
      }),
    );
  }

  /**
   *  联盟佣金 - 联盟分成
   *
   * @param params 页码
   * @returns
   */
  getAgentDivideInto(params: PageParams): Observable<AgentDivide> {
    const url = `${environment.apiUrl}/v1/agent/agent/agentdividedinto`;
    return this.get(url, params).pipe(
      map((x: any) => {
        const data = x?.data as AgentDivide;
        if (data) {
          if (data.list === null) {
            return {
              ...data,
              list: [],
            };
          }

          const list = data.list.map(item => {
            return {
              ...item,
              date: this.generalService.toFullTimestamp(Number(item.date)),
            };
          });

          return {
            ...data,
            list,
          };
        } else {
          return { total: 0, list: [] };
        }
      }),
    );
  }
}
