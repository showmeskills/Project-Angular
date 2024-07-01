import { AdjustmentTypeSelect, CommonSelect } from 'src/app/shared/interfaces/select.interface';
import { Page } from 'src/app/shared/interfaces/page';
import { PaymentTypeEnum } from 'src/app/shared/interfaces/transaction';

/**
 * 出款申请类型
 */
export enum WithdrawalTypeEnum {
  Unknown = 'Unknown',
  Currency = 'Currency', // 法币
  Coin = 'Coin', // 加密货币、数字货币
  ManualWithdrawal = 'ManualWithdrawal', // 原：资产下发
  CurrencyExchange = 'CurrencyExchange', // 换汇
}

/**
 * 渠道
 */
export interface Channel {
  channelCode: string;
  channelName: string;
}

/** 调整原因、调整类型 */
export interface Adjustment extends CommonSelect {
  name: string;
}

/** 商户渠道资金调整返回数据 */
export interface MerchantChannelAdjustment {
  channelAccountAlias: string;
  channelAccountId: string;
  details: MerchantChannelAdjustmentCurrency[];
}

/** 商户渠道资金调整请求参数 */
export interface MerchantChannelAdjustmentParams {
  channelAccountId: string; // 子渠道ID
  currency: string; // 币种
  paymentMethodId: string; // 支付方式
  amount: string; // 调整金额
  paymentCategoryReason: string; // 调整原因、调整类型
  description: string; // 备注
}

/** 商户渠道资金调整币种数据 */
export interface MerchantChannelAdjustmentCurrency {
  currency: string;
  paymentMethods: string[];
  isDigital: boolean;
}

/** 支付方式下拉 */
export type PaymentMethod = AdjustmentTypeSelect;

/** 子渠道资金流水类型 */
export interface FlowType extends CommonSelect {
  name: string;
}

/** 资金流水列表 */
export interface FlowParams {
  channelAccountId: string;
  currency: string;
  startTime: number;
  endTime: number;
  pageIndex: number;
  pageSize: number;
}

/**
 * 付款申请 - 渠道列表
 */
export interface PayChannelList {
  bankCodes: string[];
  channelAccountAlias: string;
  channelAccountId: string;
  channelCategory: string;
  channelId: string;
  currency: string;
  isCheckBankCode: boolean;
  isEnable: boolean;
  maxAmount: number;
  minAmount: number;
  paymentMethodId: string;
}

/**
 * 主渠道所支持的币种
 */
export interface MainChannelSupportCurrency {
  channelId: string;
  supportedDepositPaymentMethods: { [p: MainChannelSupportCurrencyType]: PaymentMethodAndNetwork[] };
  supportedWithdrawalPaymentMethods: { [p: MainChannelSupportCurrencyType]: PaymentMethodAndNetwork[] };
}

/**
 * 主渠道所支持的币种类型
 */
export type MainChannelSupportCurrencyType = string;

/**
 * 支付方式/网络链
 */
export type PaymentMethodAndNetwork = string;

/**
 * 获取币种所支持的汇率以及区间
 */
export interface CurrencyRateAndRange {
  buyRateSpread: number; // 买入价差百分比
  currency: string; // 币种
  depositMax: number; // 存款区间-最大
  depositMin: number; // 存款区间-最小
  isAuto: boolean; // 是否自动获取汇率
  rate: number; // 汇率中间价
  sellRateSpread: number; // 卖出价差百分比
  withdrawMax: number; // 提款区间-最大
  withdrawMin: number; // 提款区间-最小
}

/**
 * 子渠道Item
 */
export interface SubChannelItem {
  channelAccountId: string; // 子渠道ID
  channelName: string; // 子渠道名称
  channelCategory: string; // Undefined, Currency=法币, Coin=加密货币
  channelAccountAlias: string; // 子帐号别称
  currency: string; // 币种
  blockedBalance: number; // 冻结金额
  balance: number; // 余额
  isEnable: boolean; // 是否启用
}

/**
 * 主渠道下拉Item
 */
export interface ChannelSelectItem {
  category: string;
  code: string;
  name: string;
}

/**
 * 渠道分配日志 - 请求参数
 */
export interface ChannelAssignLogParams extends Page {
  merchantId?: number | string; // 商户ID Get方式都行
  merchantUserAccount?: string; // 商户用户ID
  merchantOrderId?: number; // 商户订单号
  channelId?: string; // 主渠道
  channelAccountId?: string; // 子渠道
  category?: PaymentTypeEnum; // 类型
  paymentMethod?: string; // 支付方式
  currency?: string; // 币种
  status?: string; // 状态
  startTime?: number; // 开始时间
  endTime?: number; // 结束时间
}

/**
 * 渠道分配日志导出 - 请求参数
 */
export interface ChannelAssignLogExportParams extends ChannelAssignLogParams {
  isAll?: number; // 是否到处所有 1为所有 0为指定页 为1时将验证31天，如果没有时间，那将返回今天~31天前的数据
}

/**
 * 渠道分配日志 - 返回数据
 */
export interface ChannelAssignLog {
  merchantId: number; // 商户ID
  merchantName: string; // 商户名称
  merchantUserAccount: string; // 商户用户ID
  channelId: string; // 主渠道
  channelAccountId: string; // 子渠道
  channelAccountAlias: string; // 子渠道别称
  category: PaymentTypeEnum; // 类型
  paymentMethod: string; // 支付方式
  status: string; // 状态
  currency: string; // 币种
  orderId: string; // 订单号
  channelOrderId: string; // 渠道订单号
  merchantOrderId: string; // 商户订单号
  orderAmount: number; // 订单金额
  allocatedMessage: string; // 分配讯息、备注
  description: string; // 描述
  createTime: number; // 时间（时间戳，毫秒）
}

/**
 * 法币渠道列表 - 类目
 */
export interface FiatChannelItem {
  channelApiVersion: string;
  channelDetailCount: number;
  channelId: string;
  channelNameEn: string;
  channelNameLocal: string;
  currencyTypes: string[];
  isEnable: boolean;
  isEnableMaintenance: boolean;
  maintenanceEndTime: null | FiatChannelMaintenanceTime;
  maintenanceStartTime: null | FiatChannelMaintenanceTime;
  matchCount: number;
  matchSuccessCount: number;
  orderRecordCount: number;
  orderRecordSuccessCount: number;
  paymentMethodTypes: string;
  weekDays: null | string[];
}

/**
 * 法币渠道列表 - 类目 开始维护时间
 */
export interface FiatChannelMaintenanceTime {
  ticks: number;
  days: number;
  hours: number;
  milliseconds: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalHours: number;
  totalMilliseconds: number;
  totalMinutes: number;
  totalSeconds: number;
}
