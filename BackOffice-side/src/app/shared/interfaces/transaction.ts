import { BaseInterface } from './base.interface';
import { Channel } from 'src/app/shared/interfaces/channel';
import { KYCRegionEnum } from 'src/app/shared/interfaces/kyc';

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
  channelList: PaymentChannelItem[];
  paymentMethodEn: string;
  paymentMethodLocal: string;
  paymentMethodeCode: string;
}

/**
 * 存款支付方式渠道
 */
export interface PaymentChannelItem {
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
  currency: string; // 币种
  exchangeCurrnecy: null | string; // 汇率兑换的币种
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
}

export enum PaymentTypeEnum {
  Deposit = 'Deposit', // 存款;
  Withdraw = 'Withdraw', // 提款;
  Adjustment = 'Adjustment', // 调账;
  // Undefined = 'Undefined', // Default Value;
}

/**
 * 支付类别
 */
export type PaymentType = keyof typeof PaymentTypeEnum;

/**
 * 交易记录 - 存提款列表请求参数
 */
export interface TransactionParams {
  Region?: KYCRegionEnum;
  PageIndex: number;
  PageSize: number;
  TenantId: string | number;
  OrderNum?: string; // 订单号
  Category?: string; // 类型：存款/提款
  UID?: string; // UID
  Status?: string; // 状态 订单状态(Success（成功）、Fail（失败）、Created（建单成功）、Waiting（等待）、Timeout(入款超时)、 Cancel(取消订单)、Process(处理中)、Review(审核中)、 Passed(审核通过)、NotPassed(审核不通过)、Bet(已下注)、Settled(已结算)、ReSettled(重新结算))
  StatusList?: string[]; // 状态 订单状态(Success（成功）、Fail（失败）、Created（建单成功）、Waiting（等待）、Timeout(入款超时)、 Cancel(取消订单)、Process(处理中)、Review(审核中)、 Passed(审核通过)、NotPassed(审核不通过)、Bet(已下注)、Settled(已结算)、ReSettled(重新结算))
  Currency?: string; // 币种
  IsManualAudit?: boolean; // 是否人工审核
  CreatedTimeStart?: number; // 创建时间（起始）
  CreatedTimeEnd?: number; // 创建时间（截至）
  FinishedTimeStart?: number; // 完成时间（起始）
  FinishedTimeEnd?: number; // 完成时间（截至）
  Order?: string; // 排序字段 CreateTime, Amount, ReceiveAmount, ModifyTime, CreateTimeAsc
  isAsc?: boolean; // 是否升序
  IsDigital?: boolean | string; // 是否为虚拟货币 GET方式可以支持传入字符串的true/false
  Address?: string; // 地址
  IsAutoReview?: boolean | undefined; // 是否查询所有自动审核的订单 - true=自动, false=审核中及待定（剔除自动）
}

/**
 * 交易记录 - 存提款列表返回
 */
export interface TransactionListResponse {
  id: number;
  tenantId: number; // 商户Id
  orderNum: string | null; // 订单号
  uid: string | null; // 会员Id
  currency: string; // 币种
  isDigital: boolean; // 是否数字货币
  paymentMethod: string; // 支付方式
  amount: number; // 交易金额
  receiveAmount: number; // 实际到账金额
  createdTime: number; // 申请时间
  finishedTime: number; // 完成时间（和修改时间对应）
  auditType: string | null; // 审核类型(分为自动审核和人工审核)
  status: OrderStatusEnum;
  category: PaymentCategoryEnum;
  address: string | null; // 存/提款地址
  reviewer: string | null; // 审核人（和修改人名字对应）
  isApprove2: boolean; // 是否是二级审核（目前用于提款里）
  claimTime: null | number; // 第一次查看时间
  approveTime: null | number; // 一级审核批准时间
  onHoldTime: null | number; // 保留提款时间
  claimBy: null | string; // 第一次查看人
  approveBy: null | string; // 一级审核批准人
  approve2Time: null | string; // 二级审核批准时间
  approve2By: null | string; // 二级审核批准人
  vipLevel: number;
  isFirstDeposit: boolean; // 是否首存
  policyName: string; // 规则名称
}

/**
 * 交易记录 - 状态
 */
export enum OrderStatusEnum {
  Unknown = 0,
  Success = 1, // 成功
  Fail = 2, // 失败
  UserCanceled = 3, // 客户取消
  Waiting = 4, // 等待
  Timeout = 5, // 入款超时
  Canceled = 6, // 人工取消
  Process = 7, // 处理中
  Review = 8, // 审核中
  Passed = 9, // 审核通过
  NotPassed = 10, // 审核不通过
  SysCanceled = 11, // 系统取消
  OnHold = 12, // 待定
}

/**
 * 支付方式类型
 */
export enum PaymentCategoryEnum {
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
}
