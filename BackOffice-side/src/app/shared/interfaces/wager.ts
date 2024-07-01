import { BaseInterface } from './base.interface';
import { EventEmitter } from '@angular/core';

/**
 * 体育列表请求参数
 */
export interface SportParams extends BaseInterface {
  TenantId: number | string;
  UID?: string;
  WagerNumber?: string; // 交易单号
  GameProvider?: string; // 游戏厂商
  TransactionType?: boolean; // 交易类型
  CreateTimeStart?: number; // 交易时间(
  CreateTimeEnd?: number;
  SettleTimeStart?: number; // 结算时间
  SettleTimeEnd?: number;
  Page: number;
  PageSize: number;
}

/**
 * 交易记录 - 下注详情组件更新配置
 */
export interface WagerDetailUpdateConfig {
  /**
   * 是否重新拉取数据
   */
  reload: boolean;
}

/**
 * 交易记录 - 下注详情组件
 */
export declare interface WagerDetailComponent<T = any> {
  /**
   * 更新下注详情或更新下注交易记录列表
   */
  update: EventEmitter<WagerDetailUpdateConfig>;

  /**
   * 详情数据
   */
  detailData: T;
}

/**
 * 交易记录 - 申请取消注单请求参数
 */
export interface CancelBetParams {
  uid: string; // 用户Uid
  wagerNumber: string; // 交易单号
  thirdPartOrderNumber: string; // 第三方订单号
  gameProvider: string; // 游戏厂商
  gameCategory: string; // 游戏类型
  currency: string; // 币别
  principal: number; // 下注金额 交易本金
  bonus: number; // 抵用金
  betTime: number; // 交易时间
  attachmentList: string[]; // 附件(jpg, png, gif, bmp，pdf 5mb以内)
  remark: string; // 备注信息
}

/**
 * 注单取消申请展示类型
 */
export interface CancelBetApply extends BaseInterface {
  uid: string; // 用户Uid
  orderNumber: string; // 第三方订单号
  gameCategory: string; // 游戏类型
  wagerNumber: string; // 交易单号
  gameProvider: string; // 游戏厂商
  betTime: number; // 交易时间
  principal: number; // 下注金额 交易本金
  bonus: number; // 抵用金
  currency: string; // 币别

  imgList?: string[]; // 附件(jpg, png, gif, bmp，pdf 5mb以内)
  remark?: string; // 备注信息
}

/**
 * 注单取消申请回显字段
 */
export interface CancelBetApplyData extends BaseInterface {
  attachmentList: string[]; // 附件(jpg, png, gif, bmp，pdf 5mb以内)
  betTime: number; // 交易时间
  bonus: number; // 抵用金
  currency: string; // 币别
  gameCategory: string; // 游戏类型
  gameProvider: string; // 游戏厂商
  principal: number; // 下注金额 交易本金
  remark: string; // 备注信息
  thirdPartOrderNumber: string; // 第三方订单号
  uid: string; // 用户Uid
  wagerNumber: string; // 交易单号
}

/**
 * 交易记录 - 赛事ID类目
 */
export interface EventIdItem {
  id: number | string;
  gameId: string;
  gameName: string;
}

/**
 * 交易记录 - 体育列表类目
 */
export interface ReportSportItem {
  sportCode: string;
  tournamentName: string;
  eventName: string;
  betoptionName: string;
  betContent: string;
  handicap: string;
  detailOdds: string;
  uid: string;
  wagerNumber: string;
  orderNumber: string;
  gameProvider: string;
  currency: string;
  betAmount: number;
  principal: number;
  bonus: number;
  payoutAmount: number;
  status: string;
  odds: string;
  betTime: number;
  gameCode: string | null;
  gameResult: string;
  gameCategory: string;
  isNonStickyBet: boolean;
  nonStickyBetAmount: number;
}

/**
 * 交易记录 - 体育列表详情类目
 */
export interface ReportSportDetailItem {
  sportCode: string;
  tournamentName: string;
  eventName: string;
  betoptionName: string;
  betContent: string;
  detailOdds: string;
  handicap: string;
  uid: string;
  wagerNumber: string;
  orderNumber: string;
  gameCategory: string;
  gameProvider: string;
  gameName: string | null;
  currency: string;
  betAmount: number;
  principal: number;
  bonus: number;
  rate: number;
  payoutAmount: number;
  rebateAmount: number;
  refundAmount: number;
  activeFlow: number;
  status: string;
  transactionType: string;
  betTime: number;
  settleTime: number;
  vehicle: string | null;
  version: string | null;
  odds: string;
  gameResult: string;
  isResend: boolean;
  isNonStickyBet: boolean;
  nonStickyBetAmount: number;
}
