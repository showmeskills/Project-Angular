import { Injectable } from '@angular/core';
import { BaseApi } from './base.api';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map, pluck } from 'rxjs/operators';
import { GetGameRecordListParams, GetMemberListParams, Team } from 'src/app/shared/interfaces/agent';
import { toDateStamp13Pad } from 'src/app/shared/models/tools.model';

@Injectable({
  providedIn: 'root',
})
export class AgentApi extends BaseApi {
  private _url = `${environment.apiUrl}/agent`;
  private _budget = `${environment.apiUrl}/asset/budgetquota`;

  /**
   * 获取当前代理下线金额
   */
  lineamount(teamId: number): Observable<any> {
    return this.get<any>(`${this._url}/lineamount`, { teamId });
  }

  /**
   * 代理列表
   * @param params 参数
   */
  agentList(params: any): Observable<any> {
    return this.get<any>(`${this._url}/proxyuser_list_all`, params);
  }

  /**
   * 审核列表
   * @param params 参数
   *
   * 2.代理审核相关-待审核列表
   * 平台对接地址: /api/v1/agent/proxy_audit_list_review
   * 对应接口地址: /proxy/audit/list/review
   */
  proxy_audit_list_review(params: any): Observable<any> {
    return this.get<any>(`${this._url}/proxy_audit_list_review`, params);
  }

  /**
   * 佣金审核列表
   * @param params 参数
   *
   * 3.后台管理-代理管理-佣金审核列表-佣金审核列表
   * 平台对接地址: /api/v1/agent/auditcommission_page
   * 对应接口地址: /auditcommission/page
   */
  auditList(params: any): Observable<any> {
    return this.get<any>(`${this._url}/auditcommission_page`, params);
  }

  /**
   * 代理转移
   * @param params 参数
   */
  transfer(params: any): Observable<any> {
    return this.post<any>(`${this._url}/proxyuser_transfer_save`, params);
  }

  /**
   * 渠道经理分配
   * @param params 参数
   *
   * 6.代理审核相关-分配渠道经理
   * 平台对接地址: /api/v1/agent/proxy_audit_transfer
   * 对应接口地址: /proxy/audit/transfer
   */
  auditTransfer(params: any): Observable<any> {
    return this.post<any>(`${this._url}/proxy_audit_transfer`, params);
  }

  /**
   * 审核 批准/拒绝
   * @param params 参数
   *
   * 5.代理审核相关-审核
   * 平台对接地址: /api/v1/agent/proxy_audit_save
   * 对应接口地址: /proxy/audit/save
   */
  proxy_audit_save(params: any): Observable<any> {
    return this.post<any>(`${this._url}/proxy_audit_save`, params, {
      headers: this.getHeaders({ UserID: this.localStorageService.userInfo.id }),
    });
  }

  /**
   * 仪表盘联盟计划排名
   * @param params 参数
   * 10.代理管理 - 仪表盘-联盟计划排名列表
   * 平台对接地址: /api/v1/agent/dashboard_alliance_top
   * 对应接口地址: /dashBoard/alliance/top
   */
  dashboardAllianceRank(params: any): Observable<any> {
    return this.get<any>(`${this._url}/dashboard_alliance_top`, params);
  }

  /**
   * 仪表盘渠道经理排名
   * @param params 参数
   */
  dashboardManagerRank(params: any): Observable<any> {
    return this.get<any>(`${this._url}/dashBoard_manager_top`, params);
  }

  /**
   * 4.代理审核相关-待审核代理详情
   * 平台对接地址: /api/v1/agent/proxy_audit_details
   * 对应接口地址: /proxy/audit/details
   */
  proxy_audit_details(params: any): Observable<any> {
    return this.get<any>(`${this._url}/proxy_audit_details`, params);
  }

  /**
   * 7.代理申请相关-渠道经理下的申请资料列表
   * 平台对接地址: /api/v1/agent/proxydata_listAll
   * 对应接口地址: /proxyData/listAll
   */
  proxydata_listAll(params: any): Observable<any> {
    return this.get<any>(`${this._url}/proxydata_listAll`, params);
  }

  /**
   * 8.代理管理-代理转移查询列表
   * 平台对接地址: /api/v1/agent/proxyuser_transfer_list
   * 对应接口地址: /proxyUser/transfer/list
   */
  proxyuser_transfer_list(params: any): Observable<any> {
    return this.get<any>(`${this._url}/proxyuser_transfer_list`, params);
  }

  /**
   * 11.代理管理 - 仪表盘-最新首存
   * 平台对接地址: /api/v1/agent/dashBoard_first_deposit
   * 对应接口地址: /dashBoard/first/deposit
   */
  dashBoard_first_deposit(params: any): Observable<any> {
    return this.get<any>(`${this._url}/dashBoard_first_deposit`, params);
  }

  /**
   * 12.代理管理 - 仪表盘-获取下级用户id
   * 平台对接地址: /api/v1/agent//dashBoard_getProxyLine
   * 对应接口地址: /dashBoard/getProxyLine
   */
  dashBoard_getProxyLine(params: any): Observable<any> {
    return this.get<any>(`${this._url}/dashBoard_getProxyLine`, params);
  }

  /**
   * 13.代理管理 - 仪表盘-表头数据展示
   * 平台对接地址: /api/v1/agent//dashBoard_head_info
   * 对应接口地址: /dashBoard/head/info
   */
  dashBoard_head_info(params: any): Observable<any> {
    return this.get<any>(`${this._url}/dashBoard_head_info`, params);
  }

  /**
   * 14.代理管理 - 仪表盘-仪表盘详情
   * 平台对接地址: /api/v1/agent/dashBoard_info
   * 对应接口地址: /dashBoard/info
   */
  dashBoard_info(params: any): Observable<any> {
    return this.get<any>(`${this._url}/dashBoard_info`, params);
  }

  /**
   * 16.代理管理 - 仪表盘-历史月份代理数据
   * 平台对接地址: /api/v1/agent/dashBoard_month_proxy
   * 对应接口地址: /dashBoard/month/proxy
   */
  dashBoard_month_proxy(params: any): Observable<any> {
    return this.get<any>(`${this._url}/dashBoard_month_proxy`, params);
  }

  /**
   * 17.代理管理 - 仪表盘-交易历史
   * 平台对接地址: /api/v1/agent/dashBoard_transaction_history
   * 对应接口地址: /dashBoard/transaction/history
   */
  dashBoard_transaction_history(params: any): Observable<any> {
    return this.get<any>(`${this._url}/dashBoard_transaction_history`, params);
  }

  /**
   * 18.代理管理 - 仪表盘-数据走势
   * 平台对接地址: /api/v1/agent/dashBoard_trend
   * 对应接口地址: /dashBoard/trend
   */
  dashBoard_trend(params: any): Observable<any> {
    return this.get<any>(`${this._url}/dashBoard_trend`, params);
  }

  /**
   * 19.代理管理-代理详情-左侧卡片
   * 平台对接地址: /api/v1/agent/details_card
   * 对应接口地址: /details/card
   */
  details_card(params: any): Observable<any> {
    return this.get<any>(`${this._url}/details_card`, params).pipe(
      map((res) => {
        if (res?.data?.approveTime) {
          res.data.approveTime = +String(res.data.approveTime).padEnd(13, '0');
        }

        return res;
      })
    );
  }

  /**
   * 20.代理管理-代理详情-佣金列表
   * 平台对接地址: /api/v1/agent/details_commission
   * 对应接口地址: /details/commission
   */
  details_commission(params: any): Observable<any> {
    return this.get<any>(`${this._url}/details_commission`, params);
  }

  /**
   * 21.代理管理-代理详情-最新首存/最新注册
   * 平台对接地址: /api/v1/agent/details_deposit
   * 对应接口地址: /details/deposit
   */
  details_deposit(params: any): Observable<any> {
    return this.get<any>(`${this._url}/details_deposit`, params).pipe(
      map((res) => {
        res?.data?.records?.forEach((e) => {
          e.createTime = +String(e.createTime).padEnd(13, '0') || 0;
          e.depositTime = +String(e.depositTime).padEnd(13, '0') || 0;
        });

        return res;
      })
    );
  }

  /**
   * 22.代理管理-代理详情-下线列表
   * 平台对接地址: /api/v1/agent/details_member
   * 对应接口地址: /details/member
   */
  details_member(params: any): Observable<any> {
    // return this.get<any>(`${this._url}/details_member`, params);
    return this.get<any>(`${this._url}/details/member`, params);
  }

  /**
   * 23.代理管理-代理详情-编辑
   * 平台对接地址: /api/v1/agent/details_save
   * 对应接口地址: /details/save
   */
  details_save(params: any): Observable<any> {
    return this.post<any>(`${this._url}/details_save`, params);
  }

  /**
   * 24.代理管理-代理详情-用户最近交易列表
   * 平台对接地址: /api/v1/agent/details_transaction
   * 对应接口地址: /details/transaction
   */
  details_transaction(params: any): Observable<any> {
    return this.get<any>(`${this._url}/details_transaction`, params);
  }

  /**
   * 25.代理管理-代理详情-转账记录
   * 平台对接地址: /api/v1/agent/details_transfer
   * 对应接口地址: /details/transfer
   */
  details_transfer(params: any): Observable<any> {
    return this.get<any>(`${this._url}/details_transfer`, params).pipe(
      map((res) => {
        res?.data?.records?.forEach((e) => {
          e.transactionDate = +String(e.transactionDate).padEnd(13, '0') || 0;
        });

        return res;
      })
    );
  }

  /**
   * 26.后台管理-代理管理-佣金审核列表-审核月佣金
   * 平台对接地址: /api/v1/agent/auditcommission_audit
   * 对应接口地址: /auditCommission/audit
   */
  auditcommission_audit(params: any[]): Observable<any> {
    // 0:未审核 1:渠道经理审核通过 2:总经理审核通过 -1:审核不通过
    return this.post<any>(
      `${this._url}/auditcommission_audit`,
      params.map((e) => ({
        ...e,
        auditName: this.localStorageService.userInfo.userName,
      }))
    );
  }

  /**
   * 27.后台管理-代理管理-佣金审核列表-月佣金详情
   * 平台对接地址: /api/v1/agent/auditcommission_info
   * 对应接口地址: /auditCommission/info
   */
  auditcommission_info(monthId: any): Observable<any> {
    return this.get<any>(`${this._url}/auditcommission_info`, { monthId }).pipe(
      map((e) => {
        if (!e) return { data: {} };

        const data = e.data || {};

        data.auditCommissionInfo = (data.auditCommissionInfo || []).map((j) => {
          const transaction = JSON.parse(j.transactionCurrency || '{}');
          j.transactionCurrency = Object.keys(transaction).map((k) => ({
            currency: k,
            value: transaction[k],
          }));

          const amount = JSON.parse(j.commissionCurrency || '{}');
          j.commissionCurrency = Object.keys(amount).map((k) => ({
            currency: k,
            value: amount[k],
          }));
          return j;
        });

        const amount = JSON.parse(data.currencyAmount || '{}');
        data.currencyAmount = Object.keys(amount).map((k) => ({
          currency: k,
          value: amount[k],
        }));

        const transactionTotal = JSON.parse(data.transactionTotalCurrency || '{}');
        data.transactionTotalCurrency = Object.keys(transactionTotal).map((k) => ({
          currency: k,
          value: transactionTotal[k],
        }));

        if (data?.auditTime) {
          e.data.auditTime = toDateStamp13Pad(e.data.auditTime);
        }

        return e;
      })
    );
  }

  /**
   * 28.联盟计划-配置-佣金配置查询
   * 平台对接地址: /api/v1/agent/config_commission_query
   * 对应接口地址: /config/commission/query
   */
  config_commission_query(merchant: any): Observable<any> {
    return this.get<any>(`${this._url}/config_commission_query`, {
      merchant,
      type: 2,
    }).pipe(
      map((res) => {
        const data = res?.data || {};

        if (!res?.data) {
          res = { data: {} };
        }

        res.data = {
          baseProportion: (+data.baseProportion * 1e6) / 1e4 || undefined,
          discountMax: (+data.discountMax * 1e6) / 1e4 || undefined,
          cycleMax: +data.cycleMax || undefined,
        };
        return res;
      })
    );
  }

  /**
   * 29.联盟计划-配置-佣金配置保存
   * 平台对接地址: /api/v1/agent/config_commission_save
   * 对应接口地址: /config/commission/save
   */
  config_commission_save(params: any): Observable<any> {
    return this.post<any>(`${this._url}/config_commission_save`, params);
  }

  /**
   * 30.联盟计划-配置-分享页配置查询
   * 平台对接地址: /api/v1/agent/config_share_query
   * 对应接口地址: /config/share/query
   */
  config_share_query(params: any): Observable<any> {
    return this.get<any>(`${this._url}/config_share_query`, params);
  }

  /**
   * 31.联盟计划-配置-分享页配置保存
   * 平台对接地址: /api/v1/agent/config_share_save
   * 对应接口地址: /config/share/save
   */
  config_share_save(params: any): Observable<any> {
    return this.post<any>(`${this._url}/config_share_save`, params);
  }

  /**
   * 32.联盟计划-配置-佣金任务查询
   * 平台对接地址: /api/v1/agent/config_task_query
   * 对应接口地址: /config/task/query
   */
  config_task_query(params: any): Observable<any> {
    return this.get<any>(`${this._url}/config_task_query`, params);
  }

  /**
   * 33.联盟计划-配置-佣金任务修改
   * 平台对接地址: /api/v1/agent/config_task_save
   * 对应接口地址: /config/task/save
   */
  config_task_save(params: any): Observable<any> {
    return this.post<any>(`${this._url}/config_task_save`, params);
  }

  /**
   * 34.后台管理-团队管理-获取团队管理下拉框数据
   * 平台对接地址: /api/v1/agent/group_getgrouplist
   * 对应接口地址: /group/getgrouplist
   */
  group_getgrouplist(tenantId: string): Observable<Team[]> {
    return this.get<any>(`${this._url}/group_getgrouplist`, { tenantId }).pipe(
      pluck<{ data: Team[] }, 'data'>('data'),
      map((e) => (Array.isArray(e) ? e : [])),
      catchError(() => of([]))
    );
  }

  /**
   * 35.后台管理-团队管理-根据团队id获取渠道经理集合
   * 平台对接地址: /api/v1/agent/group_getgrouprelationlist
   * 对应接口地址: /group/getgrouprelationlist
   */
  group_getgrouprelationlist(params: any): Observable<any> {
    return this.get<any>(`${this._url}/group_getgrouprelationlist`, params);
  }

  /**
   * 36.后台管理-团队管理-当前登录的人员获取团队id
   * 平台对接地址: /api/v1/agent/group_getgroupid
   * 对应接口地址: /group/getGroupId
   */
  group_getgroupid(tenantId: any): Observable<any> {
    return this.get<any>(`${this._url}/group_getgroupid`, { tenantId });
  }

  /**
   * 37.后台管理-团队管理-进行查询下线渠道经理
   * 平台对接地址: /api/v1/agent/group_getrelationbyuser
   * 对应接口地址: /group/getRelationByUser
   */
  group_getrelationbyuser(team): Observable<any> {
    return this.get<any>(`${this._url}/group_getrelationbyuser`, { team });
    // .pipe(
    // map((res) => {
    //   if (Array.isArray(res?.data)) {
    //     res.data = res.data.filter((e) => {
    //       return e.userId !== this.localStorageService.userInfo.id;
    //     });
    //   }
    //
    //   return res;
    // })
    // );
  }

  /**
   * 38.代理管理 - 仪表盘-推荐好友排名列表
   * 平台对接地址: /api/v1/agent/dashboard_invite_top
   * 对应接口地址: /dashBoard/invite/top
   */
  dashboard_invite_top(params: any): Observable<any> {
    return this.get<any>(`${this._url}/dashboard_invite_top`, params);
  }

  /**
   *  39.联盟计划-配置-查询语言
   平台对接地址: /api/v1/agent/config_language_query
   对应接口地址: /config/language/query
   */
  config_language_query(params: any): Observable<any> {
    return this.get<any>(`${this._url}/config_language_query`, params);
  }

  /**
   *  40.联盟计划-配置-语言保存
   平台对接地址: /api/v1/agent/config_language_save
   对应接口地址: /config/language/save
   */
  config_language_save(params: any): Observable<any> {
    return this.post<any>(`${this._url}/config_language_save`, params);
  }

  /**
   * 41.代理的基本情况
      平台对接地址: /api/v1/agent/details_basic
     对应接口地址: /details/basic
   */
  details_basic(params: any): Observable<any> {
    return this.get<any>(`${this._url}/details_basic`, params);
  }

  /**
   * 42.代理审核相关-申请的基础资料
   平台对接地址: /api/v1/agent/proxy_audit_basic
   对应接口地址: /proxy/audit/basic
   */
  proxy_audit_basic(id: any): Observable<any> {
    return this.get<any>(`${this._url}/proxy_audit_basic`, { id });
  }

  /********************************************************************
   *                             预算管理
   ********************************************************************/
  /**
   * 根据商户获取所有团队额度
   */
  getgroupquotalist(tenantId): Observable<any> {
    return this.get<any>(`${this._budget}/getgroupquotalist`, { tenantId });
  }

  /**
   * 获取当前商户下所有团队额度
   */
  getcurrentgroupquotalist(): Observable<any> {
    return this.get<any>(`${this._budget}/getcurrentgroupquotalist`);
  }

  /**
   * 获取团队及所属用户额度
   */
  getgroupuserquotalist(groupId: any): Observable<any> {
    return this.get<any>(`${this._budget}/getgroupuserquotalist`, { groupId });
  }

  /**
   * 设置团队列表额度
   */
  setgrouparrayquota(params: any): Observable<any> {
    return this.post<any>(`${this._budget}/setgrouparrayquota`, params);
  }

  /**
   * 设置团队用户列表额度
   */
  setgroupuserarrayquota(params: any): Observable<any> {
    return this.post<any>(`${this._budget}/setgroupuserarrayquota`, params);
  }

  /**
   * 根据当前用户获取团队列表(总经理)
   */
  getgrouplist(): Observable<any> {
    return this.get<any>(`${this._budget}/getgrouplist`);
  }

  /**
   * 推荐奖励查询
   */
  config_top_query(params: any): Observable<any> {
    return this.get<any>(`${this._url}/config_top_query`, params).pipe(
      map((res) => (Array.isArray(res?.data) ? res : { data: [] }))
    );
  }

  /**
   * 推荐奖励保存
   */
  config_top_save(params: any): Observable<any> {
    return this.post<any>(`${this._url}/config_top_save`, params);
  }

  /**
   * A043    修改为USDT佣金发放    POST    /api/v1/agent/details_updateusdt
   */
  details_updateusdt(status: number, uid: string): Observable<any> {
    return this.post<any>(`${this._url}/details_updateusdt`, { status, uid });
  }

  /**
   * 会员管理
   */
  getMemberManagerList(params: GetMemberListParams): Observable<any> {
    return this.get<any>(`${this._url}/userstatlist`, params);
  }

  /**
   * 游戏记录
   */
  getGameRecord(params: GetGameRecordListParams): Observable<any> {
    return this.get<any>(`${this._url}/transactionlist`, params);
  }

  /**
   * 首存概括
   */
  getFirstDepositOver(params: any): Observable<any> {
    return this.get<any>(`${this._url}/ftdlist`, params);
  }

  /**
   * 推荐好友- 最新注册 （商户1/2）
   */
  getregisterpage(parmas: any = {}): Observable<any> {
    return this.get<any>(`${this._url}/dashboard_getregisterpage`, parmas);
  }

  /**
   * 推荐好友- 最新首存 （商户1/2）
   */
  getftdlistpage(parmas: any = {}): Observable<any> {
    return this.get<any>(`${this._url}/dashboard_getftdlistpage`, parmas);
  }

  /**
   * 代理转移 - 列表 （商户2）
   */
  user_transform_list(parmas): Observable<any> {
    return this.post<any>(`${this._url}/user_transform_list`, parmas);
  }

  /**
   * 代理转移 - 转移 （商户2）
   */
  user_transform(parmas): Observable<any> {
    return this.post<any>(`${this._url}/user_transform`, parmas);
  }
}
