import { BasePage, PageResponse } from './base.interface';
import { PaymentType, PaymentTypeEnum } from 'src/app/shared/interfaces/transaction';
import { FormControl, FormGroup } from '@angular/forms';
import { PageIndex } from 'src/app/shared/interfaces/page';

/**
 * 获取商户列表请求参数
 */
export interface MerchantsListParams extends BasePage {
  id?: string; // MID
  merchantName?: string; // 商户名称
}

/**
 * 获取商户列表请求参数
 */
export interface UpdateMerchantsStatusParams {
  id: number;
  state: boolean;
}

/**
 * 商户资金统计
 */
export interface MerchantMoneyCountItem {
  merchantId: number; // 商户ID
  currency: string; // 币种
  currentTime: number; // 日期
  currentTimeStr?: string; // 日期
  depositAmount: number; // 存款金额
  depositNum: number; // 存款数
  withdrawAmount: number; // 提款金额
  withdrawNum: number; // 提款数
  payoutAmount: number; // 支出金额
  fee: number; // 手续费
  adjustmentAmount: number; // 调整金额
  exchangeAmount: number; // 兑换金额
  exchangeProfitAmount: number; // 兑换价差盈利
  profitAmountIncome: number; // 盈利收入金额
  profitAmountOutcome: number; // 盈利支出金额
  managePayoutAmount: number; // 集团支出金额
  lastBalance: number; // 最新余额
}

/**
 * 商户新增请求参数
 */
export interface AddMerchantsParams {
  merchantName: string; // 商户名称
  email: string; // 邮箱
  apiKey: string; // 秘钥 后台生成
  callbackUrl?: string | null; // 回调地址
  whitelist?: string[] | null; // 白名单
  rateCategory: 'FixedScale' | 'FloatingScale'; // 费率类型: 固定费率 | 浮动费率
  isNegative: boolean; // 是否允许负值提单
  rates: MerchantGoMoneyRate[] | null; // 商户费率
  isFiatMoneyEnable: boolean; // 启用关联子渠道币种：法币
  isVirtualMoneyEnable: boolean; // 启用关联子渠道币种：虚拟币
  isVirtualToFiatMoneyEnable: boolean; // 启用关联子渠道币种：存虚得法币
  isDepositRuleEnable: boolean; // 存款PSP规则
  isWithdrawRuleEnable: boolean; // 提款PSP规则
}

/**
 * 商户服务配置费
 */
export interface MerchantGoMoneyRate {
  chargeCategory: keyof typeof MerchantRateCurrencyType;
  currency: string;
  paymentCategory: PaymentTypeEnum;
  paymentMethodId: string;
  smallRate?: number;
  largeRate: number;
  feeMin: number;
  feeMax: number;
}

/**
 * 商户详情
 */
export interface MerchantDetail {
  apiKey: string; // 秘钥
  callbackUrl: string; // 回调地址
  email: string; // 邮箱
  id: number;
  isEnable: boolean; // 是否启用
  isNegative: boolean; // 是否允许负值提单
  isFiatMoneyEnable: boolean; // 法币
  isVirtualMoneyEnable: boolean; // 数字货币
  isVirtualToFiatMoneyEnable: boolean; // 存虚得法币
  isDepositRuleEnable: boolean; // 存款PSP规则
  isWithdrawRuleEnable: boolean; // 提款PSP规则
  merchantName: string; // 商户名称
  rateCategory: 'FixedScale' | 'FloatingScale';
  rates: MerchantGoMoneyRate[] | null; // 商户费率
  status: number; // 状态
  whitelist: string[]; // 白名单
}

/**
 * 商户类目
 */
export interface MerchantItem {
  id: number; // 商户ID
  email: string; // 邮箱
  isEnable: boolean; // 是否启用
  merchantName: string; // 商户名称
}

/**
 * 商户更新请求参数
 */
export interface UpdateMerchantsParams extends AddMerchantsParams {
  id: number;
  isEnable?: boolean;
  isDelete?: boolean;
}

/**
 * 获取商户汇率可配置的币种
 */
export interface MerchantRateCurrency {
  chargeCategory: keyof typeof MerchantRateCurrencyType;
  currencies: MerchantRateCurrencyItem[];
}

/**
 * 获取商户汇率可配置的币种 - 自定义类型
 */
export interface MerchantRateCurrencyCustom extends MerchantRateCurrency {
  data: MerchantRateCurrencyItemDataCustom[];
}

/**
 * 获取商户汇率配置 - 自定义类型
 */
export interface MerchantRateCurrencyItemDataCustom {
  currency: string;
  deposit: MerchantRateCurrencyItemCustom[];
  withdrawal: MerchantRateCurrencyItemCustom[];
}

/**
 * 获取商户汇率配置 - 自定义类型
 */
export interface MerchantRateCurrencyItemCustom {
  smallRate: any;
  largeRate: any;
  feeControl: FormGroup<MerchantRateCurrencyItemControl>;
  name: string;
  paymentCategory: PaymentType;
  paymentMethodId: string;
}

export interface MerchantRateCurrencyItemControl {
  feeMin: FormControl<any>;
  feeMax: FormControl<any>;
}

/**
 * 获取上回汇率可配置的币种列表
 */
export interface MerchantRateCurrencyItem {
  currency: string;
  payments: { paymentCategory: PaymentType; paymentMethodId: string }[];
}

/**
 * 商户汇率币种类型
 */
export enum MerchantRateCurrencyType {
  Unknown, // 未知
  FiatMoney, // 法币
  VirtualMoney, // 虚拟币
  VirtualToFiatMoney, // 存虚得法币
}

/**
 * 币种类型
 */
export type CurrencyType = keyof typeof MerchantRateCurrencyType;

/**
 * 兑换记录列表请求参数
 */
export interface ExchangeRecordParams extends PageIndex {
  merchantId?: string | number; // 商户ID
  merchantUserAccount?: string; // 用户ID
  merchantOrderId?: string; // 商户订单号
  startTime: number; // 开始时间
  endTime: number; // 结束时间
}

/**
 * 兑换记录列表
 */
export interface ExchangeRecordItem {
  merchantId: number; // 商户Id
  merchantUserAccount?: string; // 用户ID
  merchantOrderId?: string; // 商户订单编号
  buyCurrency: string; // 买入币种
  buyAmount: number; // 买入金额(数量)
  sellCurrency: string; // 卖出币种
  sellAmount: number; // 卖出金额(数量)
  rate: number; // 兑换汇率
  realRate: number; // 实时汇率
  exchangeProfitCurrency: string; // 兑换币种
  exchangeProfitAmount: number; // 盈亏金额(数量)
  usdtRate: number; // USDT汇率(盈亏币种兑换USDT的中间价汇率)
  usdtAmount: number; // USDT金额(数量)(盈亏币种兑换USDT的数量)
  createdTime: number; // 创建时间
}

/**
 * 兑换记录返回
 */
export interface ExchangeRecordRes extends PageResponse<ExchangeRecordItem>, ExchangeRecordTotal {}

/**
 * 兑换记录总计
 */
export interface ExchangeRecordTotal {
  aggregate: { usdtAmount: number };
}
