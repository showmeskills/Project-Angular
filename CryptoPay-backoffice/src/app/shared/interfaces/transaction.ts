import { BaseInterface } from './base.interface';
import { Channel, WithdrawalTypeEnum } from 'src/app/shared/interfaces/channel';
import { FinancialWithdrawStatus } from 'src/app/shared/interfaces/status';

export interface IGetTransListParams extends BaseInterface {
  pageIndex: number;
  pageSize: number;
  merchantIds?: number;
  methods?: string;
  currencies?: string;
  providers?: string;
  category?: string;
  status?: string;
}

export interface IGetTranParams extends BaseInterface {
  id: number | string;
}

export interface IGetTranParams {
  id: number | string;
}

/**
 * 后台操作存款支付方式支付渠道列表请求参数
 */
export interface PaymentChannelListParams {
  tenantId: string;
  currency: string;
  category: string;
}

/**
 * 存款支付方式渠道
 */
export interface PaymentChannel {
  channelCode: string;
  channelName: string;
}

/**
 * 后台操作存款支付方式渠道
 */
export interface OperaPaymentChannel {
  labelId: number;
  labelName: string;
  methods: PaymentChannelMethod[];
}

/**
 * 后台操作存款支付方式渠道
 */
export interface PaymentChannelMethod {
  channelList: Channel[];
  paymentMethodName: string;
  paymentMethodeCode: string;
}

/**
 * 待客入款请求参数
 */
export interface DepositHelperParams {
  tenantId: string;
  uidName?: string;
  currency: string;
  paymentMethod?: string;
  paymentChannel: string;
  amount?: number | string;
  accountName: string;
}

/**
 * 待客入款请求返回
 */
export interface DepositHelperResponse {
  orderNumber: string;
  thirdPartOrderNumber: string;
  currency: string;
  paymentMethod: string;
  paymentChannel: string;
  accountName: string;
}

/**
 * 交易记录 - 存提款列表
 */
export interface TransactionItem {
  accountBalance: number; // 账户余额
  applicationTime: number; // 申请时间
  channelFee: number; // 渠道费
  channelOrderId: string; // 渠道订单号
  channelTime: number; // 渠道时间
  completeTime: number; // 完成时间
  transactedAmount: number; // 交易金额
  transactedAmountCurrency: string; // 交易金额币种
  receivedAmount: number; // 实际到账
  receiveAmountCurrency: string; // 实际到账币种
  currency: string; // 币种
  digitalInfo: {
    formAddress: string; // 来源地址
    toAddress: string; // 目标地址
    txHash: string; // 交易哈希
  };
  depositRate: string; // 存款费率 带百分号
  exchangeCurrency: null | string; // 汇率兑换的币种
  exchangeNetwork: string; // 兑换的网络
  exchangeRate: number; // 汇率
  hasRules: boolean;
  id: number;
  integrals: number; // 积分
  isDigital: boolean; // 是否是数字货币
  isShowRejectTips: boolean; // 是否显示显示驳回
  merchantBalance: number; // 商户余额
  merchantChannelName: string; // 子渠道名称
  merchantFee: number; // 商户手续费
  merchantName: string; // 商户名称
  merchantOrderId: string; // 商户订单号
  merchantUserAccount: string; // UID
  orderAmount: number; // 订单金额
  orderId: string; // 订单号
  paymentCategory: PaymentType; // 存款、提款、调账类型
  paymentCategoryReason: string; // 调整原因、调整类型
  paymentMethod: string; // 支付方式
  paymentProviderName: string; // 渠道名称 - 支付提供商名称
  presetOrderAmount: number; // 预设金额
  receiveAmount: number; // 实际到账金额
  rejectTimes: number; // 驳回次数
  matchCount?: number; // 匹配次数
  waitCount?: number; // 等待次数
  status: string; // 状态
  remark: string; // 备注
}

export enum PaymentTypeEnum {
  Deposit = 'Deposit', // 存款;
  Withdraw = 'Withdraw', // 提款;
  Adjustment = 'Adjustment', // 调账;
  CurrencyExchange = 'CurrencyExchange', // 换汇
  // Undefined = 'Undefined', // Default Value;
}

/**
 * 支付类别
 */
export type PaymentType = PaymentTypeEnum;

/**
 * 付款审批列表Item
 */
export interface WithdrawalApprovalItem {
  auditUserName: string; // 一级审核人
  auditUserName2: null; // 二级审核人
  bankAccountHolder: null | string; // 收款人
  bankAccountNumber: null | string; // 收款账号(虚拟币为收款地址)
  channelId: string; // 渠道ID
  createdTime: number; // 创建时间
  createdUserName: string; // 创建人
  currency: string; // 币种
  currencyCoinCategory: WithdrawalTypeEnum; // 币种类型
  description: null | string; // 描述
  exchangeAmount: null | number; // 兑换金额
  exchangeCurrency: null | string; // 兑换币种
  exchangeRate: null | number; // 汇率
  id: number; // ID
  merchantId: number; // 商户ID
  merchantName: string; // 商户名称
  note1: null | string; // 一级审核备注
  note2: null | string; // 二级审核备注
  orderId: null | string; // 订单号
  paymentMethodId: string; // 支付方式 ID
  status: FinancialWithdrawStatus; // 状态
  totalAmount: number;
  totalPresetAmount: number;
  tradeOrder: string; // 交易订单号
  withdrawTabCategory: string; // 特殊标签 = Special
  withdrawTabId: number;
  withdrawTabName: string;
}

/**
 * 手动上分请求参数
 */
export interface ManualDepositParams {
  id: number; // 雪花算法ID 可能会超过JS Number范围
  receiveAmount: number; // 上分金额 实际到账金额
  imagePath: string[]; // 图片路径
  remark: string; // 备注
}
