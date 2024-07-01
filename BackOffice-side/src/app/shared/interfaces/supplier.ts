import { BaseInterface } from './base.interface';
import { GameCategory } from 'src/app/shared/interfaces/game';
import { ClientSourceKeyEnum } from 'src/app/shared/interfaces/member.interface';

/** 游戏排名榜 */
export interface GameRank extends BaseInterface {
  rank: number; // 排名
  gameId: string; // 游戏id
  gameName: string; // 游戏名称
  lastBeforeComparison: number; // 较之前(上周/上月)
  transactionAmount: number; // 累计交易本金 USDT
  payoutAmount: number; // 累积输赢 USDT
  gameProvider: string; // 游戏厂商
  gameProviderName: string; // 游戏厂商名称
  orderQuantity: number; // 订单数量
  activeFlowAmount: number; // 有效流水 USDT
  gameNameId: string; // 游戏名称ID
}

/** 会员排名榜 */
export interface UserRank extends BaseInterface {
  name: string; // 会员名称
  uId: string; // UId
  rank: number; // 排行
  wagerCount: number; // 下注数量
  wagerTotal: number; // 下注总额
  activeFlowTotal: number; // 有效流水
  payoutTotal: number; // 输赢
}

/** 实时概括 */
export interface LiveTransaction extends BaseInterface {
  wagerCount: number; // 下注单数
  prevWagerCount: number; // 昨日下注单数
  wagerCountRise: number; // 下注单数增长率
  wagerTotal: number; // 下注总额
  prevWagerTotal: number; // 昨日下注总额
  wagerTotalRise: number; // 下注总额增长率
  payoutTotal: number; // 输赢总额
  prevPayoutTotal: number; // 昨日输赢总额
  payoutTotalRise: number; // 输赢总额增长率
  registerCount: number; // 注册人数
  prevRegisterCount: number; // 昨日注册人数
  registerCountRise: number; // 注册人数增长率
  depositFirstCount: number; // 首存人数
  prevDepositFirstCount: number; // 昨日首存人数
  depositFirstCountRise: number; // 首存人数增长率
  depositCount: number; // 存款总数
  prevDepositCount: number; // 昨日存款总数
  depositCountRise: number; // 存款总数增长率
  depositTotal: number; // 存款总额
  prevDepositTotal: number; // 昨日存款总额
  depositTotalRise: number; // 存款总额增长率
  withdrawCount: number; // 提款总数
  prevWithdrawCount: number; // 昨日提款总数
  withdrawCountRise: number; // 提款总数增长率
  withdrawTotal: number; // 提款总额
  prevWithdrawTotal: number; // 昨日提款总额
  withdrawTotalRise: number; // 提款总额增长率
  time: number; // 更新时间
}

/** 申诉统计 */
export interface AppealStat extends BaseInterface {
  depositCount: number; // 存款申诉量
}

/** 会员趋势 */
export interface UserTrend extends BaseInterface {
  date: string; // 日期
  wagerCount: number; // 下注人数
  registerCount: number; // 注册人数
}

/** 交易概括 */
export interface TransactionGeneralize extends BaseInterface {
  date: number; // 日期
  transactionAmount: number; // 交易金额 USDT
  orderQuantity: number; // 交易订单数量
}

/**
 * 注册渠道
 */
type Registry = Array<ClientSourceKeyEnum>;

/** 注册渠道统计 */
export interface SourceCount extends BaseInterface {
  channel: Registry; // 渠道
  registerCount: number; // 注册总数
  registerRate: number; // 注册率
  loginCount: number; // 登录总数
  loginRate: number; // 登录率
}

/**
 * 供应商报表 - 累计输赢集合
 */
export interface SupplierReportPayoutModule {
  payoutAmount: number; // 累积输赢 USDT
  activeFlowAmount: number; // 累计有效流水 USDT
  returnRate: number; // 返还率 百分比
  // 分币种输赢
  currency: {
    [currency: string]: number;
  };
  // 分币种有效流水
  activeFlowCurrency: {
    [currency: string]: number;
  };
  activeCount: number; //活跃用户数
}

/**
 * 供应商报表 - 输赢趋势图
 */
export interface SupplierReportPayoutTrendChart {
  date: number; // 日期
  payoutAmount: number; // 累积输赢 USDT
  activeFlowAmount: number; // 累计有效流水 USDT
  activeCount: number; //活跃用户数
}

/**
 * 供应商报表 - 交易概括
 */
export interface SupplierReportTransactionSummary {
  transactionAmount: number; // 累计交易本金 USDT
  payoutAmount: number; // 累积输赢 USDT
  todayTransactionAmount: number; // 今日交易本金 USDT
  todayPayoutAmount: number; // 今日输赢 USDT
  todayBackWaterAmount: number; // 今日反水金额 USDT
  todayCancelQuantity: number; // 今日取消单据
  todayActiveCount: number; // 今日活跃用户数
}

/**
 * 供应商报表 - 各游戏厂商模块
 */
export interface SupplierReportGameModule {
  gameCategory: GameCategory; // 游戏类型
  gameProvider: string; // 游戏厂商
  gameProviderName: string; // 游戏厂商名称
  todayTransactionAmount: number; // 今日交易本金 USDT
  todayPayoutAmount: number; // 今日输赢 USDT
  todayActiveCount: number; //活跃用户数
}

/**
 * 供应商报表
 */
export interface SupplierReport {
  tenantId: number;
  gameCategory: GameCategory;
  // 累计输赢集合
  payoutModule: SupplierReportPayoutModule;
  // 输赢趋势图
  payoutTrendChart: Array<SupplierReportPayoutTrendChart>;
  // 交易概括
  transactionSummary: SupplierReportTransactionSummary;
  // 各游戏厂商模块
  gameModule: Array<SupplierReportGameModule>;
}
