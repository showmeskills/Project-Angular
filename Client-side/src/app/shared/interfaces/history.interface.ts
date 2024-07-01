import { BaseInterface } from './base.interface';

/**
 * 设备列表 接口返回
 */
export interface DeviceHistory extends BaseInterface {
  id: number;
  os: string;
  browser: string;
  createIp: string;
  createZone: string;
  createTime: number;
  lastLoginTime: number;
  lastLoginZone: string;
  lastLoginIp: string;
}

/**
 * 设备操作记录/登录历史记录等 接口返回
 */
export interface DeviceLog extends BaseInterface {
  category: string;
  result: string;
  source: string;
  createIp: string;
  createZone: string;
  createTime: number;
}

/**
 * 登录历史 操作历史等 接口返回
 */
export type UserActivityLog = DeviceLog;

/**
 * 数字货币存款/提款交易  法币存款/提款交易 接口请求参数
 */
export interface GetAssetHistoryInterface extends BaseInterface {
  category: string;
  startTime: number | string;
  endTime: number;
  currency: string;
}

/**
 * 数字货币存款/提款交易 返回数据
 */
export interface CointxHistoryInterface extends BaseInterface {
  currency: string;
  category: string;
  orderNum: string;
  amount: number;
  status: string;
  date: string;
  address: string;
  txid: string;
  statusName: string;
}

/**
 * 法币存款/提款交易 返回数据
 */
export interface CurrencytxHistoryInterface extends BaseInterface {
  currency: string;
  category: string;
  orderNum: string;
  amount: number;
  status: string;
  date: string;
  paymentMethod: string;
  statusName: string;
  /** 减免手续费 */
  feeWaiver: number;
  /** 实际支付手续费 */
  fee: number;
  /** 实际到账金额 */
  receiveAmount: number;
  /** 充值时 是否使用福利券 */
  isVoucher: boolean;
}

/**
 * 投注交易记录 请求参数
 */
export interface GetWagerHistoryInterface extends BaseInterface {
  startTime: number;
  endTime: number;
  currency: string;
  isDigital: boolean;
  gameCategory: string;
  gameProvider: string;
}

/**
 * 投注交易记录 返回数据
 */
export interface WagerHistoryInterface extends BaseInterface {
  date: string;
  wagerNum: string;
  currency: string;
  amount: string;
  winAmout: number;
  activeFlow: number;
  status: string;
}

/**
 * 历史记录状态和对应显示文字 返回数据
 */
export interface StatusListInterface extends BaseInterface {
  code: string;
  description: string;
}

/**
 * 钱包历史记录 投注交易状态 返回数据
 */
export interface WagerStatusListInterface extends BaseInterface {
  code: string;
  description: string;
}

/**
 * 划转 钱包下拉数据
 */
export interface Transferwalletselect extends BaseInterface {
  code: string;
  description: string;
}

/**
 * 钱包历史记录 划转 请求参数
 */
export interface GetTransferHistoryInterface extends BaseInterface {
  StartTime: number;
  EndTime: number;
  Status: number;
  Currency: string;
  Page: number;
  PageSize: number;
  FromWallet: string;
  ToWallet: string;
}

/**
 * 钱包历史记录 划转 返回数据
 */
export interface TransferHistoryInterface extends BaseInterface {
  createdTime: number;
  transactionId: string;
  fromWallet: string;
  toWallet: string;
  amount: number;
  transferType: string;
  status: string;
  currency: string;
}

/**
 * 钱包历史记录 调账 请求参数
 */
export interface GetAdjusttxHistoryInterface extends BaseInterface {
  StartTime: number;
  EndTime: number;
  Status: number;
  Currency: string;
  PageIndex: number;
  PageSize: number;
}

/**
 * 钱包历史记录 调账 返回数据
 */
export interface AdjusttxHistoryInterface extends BaseInterface {
  date: number;
  orderNum: string;
  type: string;
  currency: string;
  amount: number;
  remark: string;
  walletType: string;
}

/**
 *  获取用户划转交易记录 param
 *
 */
export interface TransferParam extends BaseInterface {
  status: number; //状态(-1全部 0划转成功 1划转失败)
  currency: string; // 币种
  fromWallet: string; //string(query)	钱包(从)
  toWallet: string; //钱包(至)
  startTime: number; //开始时间
  endTime: number; //结束时间
  page: number; //起始页
  pageSize: number; //每页笔数
}
