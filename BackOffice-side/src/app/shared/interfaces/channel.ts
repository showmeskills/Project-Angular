import { CodeName } from 'src/app/shared/interfaces/base.interface';

/**
 * 渠道
 */
export interface Channel {
  channelCode: string;
  channelName: string;
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
export interface PaymentMethod {
  code: string;
  isDigital: boolean;
  localName: string;
  enName: string;
}

/** 子渠道资金流水类型 */
export type FlowType = CodeName;

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
