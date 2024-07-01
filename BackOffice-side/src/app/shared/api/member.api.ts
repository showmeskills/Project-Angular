import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { HttpHeaders } from '@angular/common/http';
import { updateChannelCodeParams } from 'src/app/shared/interfaces/system.interface';
import {
  AssetCourseListParams,
  GrantList,
  IMemberBehavior,
  IMemberOverview,
  // UserDisableParams,
  AddCommunicateParams,
  MemberListParams,
  NonStickyItem,
  ClientSourceSelect,
  MemberStatusSelect,
  MemberItem,
  MemberExportParams,
  MemberExportResponse,
  MemberOverview,
  MemberStatistics,
  AccountInfo,
  IpSessionsItem,
  BadDataItem,
} from '../interfaces/member.interface';
import moment from 'moment';
import { catchError, map } from 'rxjs/operators';
import { PageResponse } from 'src/app/shared/interfaces/base.interface';
import { downloadExcelFile } from 'src/app/shared/models/tools.model';

@Injectable({
  providedIn: 'root',
})
export class MemberApi extends BaseApi {
  private _url = `${environment.apiUrl}/member`;

  /**
   * 会员列表
   * @param params 参数
   * @returns 示例数据
   */
  getMemberList(params: MemberListParams): Observable<PageResponse<MemberItem>> {
    return this.get<any>(`${this._url}/getmemberlist`, params);
  }

  /**
   * 获取会员统计数据
   * @returns Observable<any>
   */
  getStat(params: { uid: string | number; beginTime?: number; endTime?: number }): Observable<MemberStatistics> {
    const sendData = {
      ...params,
      beginTime: params.beginTime ? moment(+params.beginTime).format('YYYY-MM-DD') : params.beginTime,
      endTime: params.endTime ? moment(+params.endTime).format('YYYY-MM-DD') : params.endTime,
    };

    return this.get<any>(`${this._url}/getmemberstat`, sendData);
  }

  /**
   * 会员状态下拉列表
   * @returns Observable<any>
   */
  getMemberStatusSelect(): Observable<MemberStatusSelect[]> {
    return this.get<any>(`${this._url}/getmemberstatuslist`).pipe(
      map((e) => (Array.isArray(e) ? e : [])),
      catchError(() => of([]))
    );
  }

  /**
   * 会员来源下拉列表
   * @returns Observable<any>
   */
  getMemberSourceSelect(): Observable<ClientSourceSelect[]> {
    return this.get<any>(`${this._url}/getsourcelist`).pipe(
      map((e) => (Array.isArray(e) ? e : [])),
      catchError(() => of([]))
    );
  }

  /**
   * 会员活体验证
   * @returns Observable<any>
   */
  postMemberSpecial(params: any, Guid: string, tenantId: string): Observable<any> {
    return this.post<any>(`${environment.apiUrl}/kyc/special_url`, params, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Bearer ${this.localStorageService.token}`,
        entityId: Guid,
        clientKey: tenantId,
      }),
    });
  }

  /**
   * 查询会员总览
   * @params memberId is requried
   * @returns Observable<any>
   */
  getMemberOverView(params: IMemberOverview): Observable<MemberOverview> {
    return this.get<any>(`${environment.apiUrl}/member/getmemberoverview`, params);
  }

  /**
   * 设置测试会员
   * @params memberId is requried
   * @returns Observable<any>
   */
  setMemberTest(id: number, flag: number): Observable<boolean> {
    return this.get<any>(`${environment.apiUrl}/member/setmembertest`, { id, flag }).pipe(
      catchError(() => {
        return of(false);
      })
    );
  }

  /**
   * 设置监视列表
   * @params uid is requried and isWatch
   * @returns Observable<any>
   */
  setWatch(uid: string, isWatch: boolean): Observable<boolean> {
    return this.post<any>(`${this._url}/setwatch`, { uid, isWatch }).pipe(
      catchError(() => {
        return of(false);
      })
    );
  }

  /**
   * 获取会员活动
   * @params uid is required pageIndex and pageSize
   * @return Observable<any>
   */
  getMemberBehavior(params: IMemberBehavior): Observable<any> {
    return this.get<any>(`${environment.apiUrl}/member/memberbehavior/getlist`, params);
  }

  /**
   * 身份认证详情 - 欧洲KYC降级
   */
  downgrade(params: any): Observable<any> {
    return this.post<any>(`${this._url}/downgrade`, params);
  }

  /**
   * 获取会员设备指纹
   */
  getLoginDevice(params: any): Observable<any> {
    return this.get<any>(`${environment.apiUrl}/member/memberbehavior/getlogindevice`, params);
  }

  /** @getQueryTypeList 会员活动弹窗接口*/
  getQueryTypeList(): Observable<any> {
    return this.get<any>(`${environment.apiUrl}/member/memberbehavior/getquerytypelist`);
  }

  /**@onAddCommunicate 会员活动添加备注 */
  onAddCommunicate(params: AddCommunicateParams): Observable<any> {
    return this.post<any>(`${environment.apiUrl}/member/memberbehavior/addcommunicate`, params);
  }

  /**
   *  会员详情：会员活动 - 删除备注
   */
  deletecomment(params): Observable<any> {
    return this.post<any>(`${this._url}/memberbehavior/deletecomment`, params);
  }

  /**
   *  会员详情：意见箱 - 列表
   */
  getrccomment(params): Observable<any> {
    return this.get<any>(`${this._url}/memberbehavior/getrccomment`, params);
  }

  /**
   * 查询资金账户下拉列表
   */
  getAssetourSestatusList(): Observable<any> {
    return this.get(`${environment.apiUrl}/member/getassetcoursestatuslist`);
  }

  /**
   * 获取订单类型下拉列表
   */
  getOrderCategorySelect(): Observable<any> {
    return this.get(`${environment.apiUrl}/member/ordercategoryselect`);
  }

  /**
   * 资金历程 - 获取用户钱包下的所有币种
   */
  getGameWalletList(params: any): Observable<any> {
    return this.get(`${environment.apiUrl}/member/gamewalletlist`, params);
  }

  /**
   * 资金历程 - 抵扣券下拉
   */
  getCouponSelect(params: any): Observable<any> {
    return this.get(`${environment.apiUrl}/member/getcouponselect`, params);
  }

  /**
   * 资金历程 - 获取列表
   */
  getAsssetCourseList(params: AssetCourseListParams): Observable<any> {
    return this.get(`${environment.apiUrl}/member/assetcourselist`, params);
  }

  /**
   * 资金历程 - 获取主账户余额详情
   */
  getAssetCourseWallet(params: any): Observable<any> {
    return this.get(`${this._url}/assetcoursewallet`, params);
  }

  /**
   * 转账记录 > 余额统计
   */
  getWagerstat(params: any): Observable<any> {
    params.StartTime = params.StartTime ? moment(+params.StartTime).format('YYYY-MM-DD') : params.StartTime;
    params.EndTime = params.EndTime ? moment(+params.EndTime).format('YYYY-MM-DD') : params.EndTime;

    return this.get(`${this._url}/getwagerstat`, params);
  }

  /**
   * 转账记录 > 交易详情
   */
  getTransferHistoryList(params: any): Observable<any> {
    return this.get(`${this._url}/gettransferhistorylist`, params);
  }

  /**
   * 交易内容下拉列表
   */
  getTransferTypeSelect(): Observable<any> {
    return this.get(`${this._url}/transfertypeselect`);
  }

  /**
   * 查询会员交易概览
   * @returns Observable<any>
   */
  getUserTransactionoverview(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getusertransactionoverview`, params);
  }

  /**
   * 会员交易概览 - 胜率/取消 警报
   * @returns Observable<any>
   */
  getMemberProviderTop(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getmemberprovidertop`, params);
  }

  /**
   * 会员交易概览 - 会员所有钱包
   * @returns Observable<any>
   */
  getMemberallWallet(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getmemberallwallet`, params);
  }

  /**
   * 会员交易概览 - 供应商统计列表
   * @returns Observable<any>
   */
  getMemberProviderStatList(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getmemberproviderstatlist`, params);
  }

  /**
   * 会员交易概览 - 获取会员游戏类别统计
   * @returns Observable<any>
   */
  getMemberGameCategoryStat(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getmembergamecategorystat`, params);
  }

  /**
   * 卡劵余额
   * @params uid
   */
  getBonusBalance(params: { uid: string; status: number }): Observable<any> {
    return this.get<any>(`${this._url}/getbonusbalance`, params);
  }

  /**
   * 卡劵余额 红利详情
   * @params GrantList 参数
   */
  getBonusGrantList(params: GrantList): Observable<any> {
    return this.get<any>(`${this._url}/getbonusgrantlist`, params);
  }

  /**
   * 禁用会员登录游戏 - 废弃
   */
  // loginDisabled(params: any): Observable<any> {
  //   return this.post<any>(`${this._url}/prohibitionlogin`, params);
  // }

  /**
   * 开启会员登录游戏 - 废弃
   */
  // loginEnable(params: { uid: string } | Object): Observable<any> {
  //   return this.post<any>(`${this._url}/enablelogin`, params);
  // }

  /**
   * 禁用游戏 - 废弃
   */
  // gameDisabled(params: any): Observable<any> {
  //   return this.post<any>(`${this._url}/prohibitiongame`, params);
  // }

  /**
   * 禁用/开启 - 登陆，游戏，支付方式
   */
  prohibitionAll(params: any): Observable<any> {
    return this.post<any>(`${this._url}/prohibition`, params);
  }

  /**
   * 回收游戏钱包余额
   */
  recycleGameWallet(params: any): Observable<any> {
    return this.post<any>(`${this._url}/recoverygamewallet`, params);
  }

  /**
   * 手机查询
   */
  memberDepositMobile(params: any): Observable<any> {
    return this.get<any>(`${this._url}/memberdepositmobile/query`, params);
  }

  /**
   * 获取会员绑定数字货币地址
   */
  getVirtualAddress(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getbindtokenaddress`, params);
  }

  /**
   * 获取会员绑定数字货币地址
   */
  getVirtualAddressUse(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getusedtokenaddress`, params);
  }

  /**
   * 查询会员列表 （新增优惠券使用）
   */
  getMemberMiniList(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getmemberminilist`, params);
  }

  /**
   * 会员渠道列表 （新增优惠券使用）
   */
  getMemberRelationList(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getmemberrelationlist`, params);
  }

  /**
   * 会员各币种存款总额
   */
  getMemberdepositTotal(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getmembertransactiontotal`, params);
  }

  /**
   * 会员存款列表
   */
  getMemberDepositList(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getmembertransactionlist`, params);
  }

  /**
   * 获取抵用金列表
   */
  getCouponList(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getcouponlist`, params);
  }

  /**
   * 禁用会支付方式
   */
  payDisabled(params: any): Observable<any> {
    return this.post<any>(`${this._url}/prohibitionuserpayment`, params);
  }

  /**
   * 获取会员提款手续费变更记录
   */
  getMemberHandlingFeeChangeList(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getmemberhandlingfeechangelist`, params);
  }

  /**
   * 获取冻结明细
   */
  getFreezeList(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getfreezelist`, params);
  }

  /**
   * 冻结明细 - 取消划转
   */
  cancelTransfer(params: any): Observable<any> {
    return this.post<any>(`${this._url}/canceltransfer`, params);
  }

  /**
   * 获取用户身份认证信息
   */
  getAuthentications(params: any): Observable<any> {
    return this.get<any>(`${environment.apiUrl}/member/memberextrainfo/getauthentications`, params);
  }

  /**
   * 身份认证 - 获取基本信息
   */
  getmemberbasicinfo(uid: any): Observable<any> {
    return this.get<any>(`${this._url}/getmemberbasicinfo`, { uid });
  }

  /**
   * 身份认证 - 更新基本信息
   */
  updatememberbasicinfo(parmas: any): Observable<any> {
    return this.post<any>(`${this._url}/updatememberbasicinfo`, parmas);
  }

  /**
   * 身份认证 - 欧洲KYC降级
   */
  kycEuropeDowngrade(params: any): Observable<any> {
    return this.post<any>(`${this._url}/downgrade`, params);
  }

  /**
   * 通过UID查询用户邮箱/手机
   */
  getmembersimpleinfo(uid: any): Observable<any> {
    return this.get<any>(`${this._url}/getmembersimpleinfo`, { uid });
  }

  /**
   * 非粘性用户奖金 - 手动取消激活
   * @param params.bonusCode {string} 红利编号
   */
  cancelNonStickyBonus(params: { tenantId: number; mid: number; bonusCode: string }): Observable<boolean> {
    return this.post<any>(`${this._url}/giveupnonstickybonus`, params);
  }

  /**
   * 更新会员注册推荐码
   */
  updateCreateChannel(parmas: updateChannelCodeParams): Observable<boolean> {
    return this.post<any>(`${this._url}/updatecreatechannel`, parmas);
  }

  /**
   * 检测会员是否绑定到MA
   */
  checkMaUidList(params: { beginTime: string; endTime: string }): Observable<string[]> {
    return this.post<any>(`${this._url}/checkmauidlist`, params);
  }

  /**
   *  会员总览非粘性奖金
   */
  getNonStickyInfo(params: { uid: string; status: string }): Observable<NonStickyItem> {
    return this.get<any>(`${this._url}/getmembernonstickyinfo`, params);
  }

  /**
   *  会员总览 - freeSpin详情：统计
   */
  getmemberfreespinbonusstat(uid: string): Observable<any> {
    return this.get<any>(`${this._url}/getmemberfreespinbonusstat`, { uid });
  }

  /**
   *  会员总览 - freeSpin详情：列表
   */
  getmemberfreespinlist(params: { uid: string; status: number }): Observable<any> {
    return this.get<any>(`${this._url}/getmemberfreespinlist`, params);
  }

  /**
   *  会员总览 - freeSpin详情：奖金详情
   */
  getfreespindetail(id): Observable<any> {
    return this.get<any>(`${this._url}/getfreespindetail`, { id });
  }

  /**
   *  获取会员报表数据
   */
  getStatement(params: MemberExportParams): Observable<MemberExportResponse[]> {
    return this.get<any>(`${this._url}/getaccountstatement`, params).pipe(
      map((res) => (Array.isArray(res) ? res : []))
    );
  }

  /**
   *  风控管理 - 获取资金流向分析列表
   */
  getassetflowlist(params): Observable<any> {
    return this.get<any>(`${this._url}/getassetflowlist`, params);
  }

  /**
   *  风控管理：资金流向分析 - 获取资金流向类型
   */
  getassetflowtypelist(): Observable<any> {
    return this.get<any>(`${this._url}/getassetflowtypelist`);
  }

  /**
   * 会员详情：剩余手续费 - 清零手续费
   */
  manuaclearhandlingfee(uid: string, tenantId: number): Observable<boolean> {
    return this.post<any>(`${this._url}/manuaclearhandlingfee`, { uid, tenantId });
  }

  /** 获取被禁用的活动 编号 */
  getForbidActivityCodes(): Observable<Array<{ activityCode: string; displayName: string }>> {
    return this.get<any>(`${this._url}/getforbidactivitycodes`);
  }

  /**
   *  会员详情：通讯记录 - 获取列表
   */
  getmessageboardlist(params): Observable<any> {
    return this.get<any>(`${this._url}/getmessageboardlist`, params);
  }

  /**
   *  会员详情：通讯记录 - 新增
   */
  addsmessageboard(params): Observable<any> {
    return this.post<any>(`${this._url}/addsmessageboard`, params);
  }

  /**
   *  会员详情：通讯记录 - 编辑
   */
  updatemessageboard(params): Observable<any> {
    return this.post<any>(`${this._url}/updatemessageboard`, params);
  }

  /**
   *  会员详情：通讯记录 - 删除
   */
  deletemessageboard(params): Observable<any> {
    return this.post<any>(`${this._url}/deletemessageboard`, params);
  }

  /**
   *  风控管理：异常会员详情 - IP/设备指纹 列表
   */
  getmemberfingerprint(params): Observable<any> {
    return this.get<any>(`${this._url}/getmemberfingerprint`, params);
  }

  /**
   * 批量获取用户信息
   * @param tenantId 商户ID
   * @param source 来源  1=后台账号 2=前端会员
   * @param ids 用户ID
   */
  getBatchUserInfo(tenantId: string | number, source: number, ids: Array<string | number>): Observable<AccountInfo[]> {
    if (!ids || !ids.length) return of([]);
    return this.get<any>(`${this._url}/getmembermessage`, { tenantId, source, ids }).pipe(
      catchError(() => of([])),
      map((e) => (Array.isArray(e) ? e : []))
    );
  }

  /** 获取开启的经历账号列表 */
  getAccountManagerList(params: { tenantId: string }): Observable<Array<{ id: string; name: string }>> {
    return this.get(`${this._url}/getaccountmanager`, params);
  }

  /** 设置会员当前的账户整理 */
  onSetAccountManager(params: { tenantId: string; uid: string[]; accountId: string }): Observable<boolean> {
    return this.post(`${this._url}/setaccountmanager`, params);
  }

  /** 移除当前会员 账户经理 */
  onRemoveAccountManager(params: { tenantId: string; uid: string; accountId: string }): Observable<boolean> {
    return this.post(`${this._url}/removeaccountmanager`, params);
  }

  /** 会员列表：在线消息禁用名单 - 列表数据 */
  getMessageBanList(params): Observable<any> {
    return this.get(`${environment.apiUrl}/im/blacklist`, params, {
      headers: this.getHeaders({ tenantId: params.tenantId }),
    });
  }

  /** 会员列表：在线消息禁用名单 - 删除 禁用名单 */
  deleteMessageBanList(params): Observable<any> {
    return this.post(`${environment.apiUrl}/im/black_remove`, params, {
      headers: this.getHeaders({ tenantId: params.tenantId }),
    });
  }

  /** 会员列表：在线消息禁用名单 - 新增 禁用名单 */
  addMessageBanList(params): Observable<any> {
    return this.post(`${environment.apiUrl}/im/black_add`, params, {
      headers: this.getHeaders({ tenantId: params.tenantId }),
    });
  }

  /** 会员列表：在线消息白名单 - 列表数据 */
  getMessageWhiteList(params): Observable<any> {
    return this.post(`${environment.apiUrl}/im/white_page_list`, params, {
      headers: this.getHeaders({ tenantId: params.tenantId }),
    });
  }

  /** 会员列表：在线消息白名单 - 删除 白名单 */
  deleteMessageWhiteList(params): Observable<any> {
    return this.post(`${environment.apiUrl}/im/white_remove`, params, {
      headers: this.getHeaders({ tenantId: params.tenantId }),
    });
  }

  /** 会员列表：在线消息白名单 - 新增 白名单 */
  addMessageWhiteList(params): Observable<any> {
    return this.post(`${environment.apiUrl}/im/white_add`, params, {
      headers: this.getHeaders({ tenantId: params.tenantId }),
    });
  }

  /**
   * 会员列表：在线消息禁用名单 - 禁用名单 模板下载
   * @templateNaming 模板名称
   */
  messageBanList_download(templateNaming: string): Observable<any> {
    return this.get<any>(
      `${environment.apiUrl}/im/downuidtemplate`,
      {},
      { responseType: 'blob', throwError: true }
    ).pipe(
      map((res) => {
        downloadExcelFile(res, `${templateNaming}.xlsx`, res.type);

        return true;
      }),
      catchError(() => of(false))
    );
  }

  /** 会员列表：在线消息禁用名单 - 禁用名单模板上传 */
  messageBanList_import(file, tenantId): Observable<any> {
    const data = new FormData();
    data.append('file', file);
    return this.post<any>(`${environment.apiUrl}/im/uploaduidfile?tenantId=${tenantId}`, data, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.localStorageService.token}`,
      }),
    });
  }

  /** 获取开启的经历账号列表 */
  getipsessions(params: any): Observable<PageResponse<IpSessionsItem>> {
    return this.get(`${this._url}/getipsessions`, params);
  }

  /** 不良数据：规则 - 新增 */
  addbaddataconfig(params): Observable<any> {
    return this.post(`${this._url}/addbaddataconfig`, params);
  }

  /** 不良数据：规则 - 删除 */
  deletebaddataconfig(params): Observable<any> {
    return this.post(`${this._url}/deletebaddataconfig`, params);
  }

  /** 不良数据：规则 - 列表 */
  querybaddataconfig(params): Observable<PageResponse<BadDataItem>> {
    return this.get(`${this._url}/querybaddataconfig`, params);
  }

  /** 不良数据：规则 - 详情 */
  querymemberbaddatadetail(params): Observable<any> {
    return this.get(`${this._url}/querymemberbaddatadetail`, params);
  }

  /** 不良数据：会员 - 新增 */
  addmemberbaddata(params): Observable<any> {
    return this.post(`${this._url}/addmemberbaddata`, params);
  }

  /** 不良数据：会员 - 删除 */
  deletememberbaddata(params): Observable<any> {
    return this.post(`${this._url}/deletememberbaddata`, params);
  }
}
