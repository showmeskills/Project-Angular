import { BaseInterface } from './base.interface';

/** 联盟游戏厂商接口 */
export interface GameProvider extends BaseInterface {
  providerName: string;
  providerCode: string;
}

/** 联盟游戏交易记录茶轩参数 */
export interface GameTransParams extends BaseInterface {
  uid: string;
  betBeginTime: number;
  betEndTime: number;
  status: string | number;
  providerCode: string;
  page: number;
  pageSize: number;
}

/** 联盟游戏交易记录返回 */
export interface GameTransList extends BaseInterface {
  total: number;
  list: Array<TransList>;
}

/** 游戏交易记录数组 */
export interface TransList extends BaseInterface {
  betTime: number;
  activeFlowUsdt: number;
  betAmountUsdt: number;
  payoutUsdtAmount: number;
  gameCode: string;
  gameProvider: string;
  uid: string;
  wagerStatus: number;
  gameName: string;
  providerName: string;
}

/** 联盟表格组件头部接口 */
export interface TableHader extends BaseInterface {
  headTitle: string;
  icon?: string | null;
}

/** 首存概览接口返回的数据 */
export interface FirstDepositList extends BaseInterface {
  total: number;
  list: Array<DepositList>;
}

/** 首存概览返回的list 数据 */
export interface DepositList extends BaseInterface {
  ftdTime: number;
  regTime: number;
  flowReturnRateLower: number;
  flowReturnRateUpper: number;
  ftdAmount: number;
  totalWinLoss: number;
  tradeAmount: number;
  uid: string;
  inviteCode: string;
}

/** 组件定义的首存概览返回的数据 */
export interface IDepositList extends BaseInterface {
  header: TableHader[];
  list: Array<DepositList>;
}

/** 数据对比返回 */
export interface DataComp extends BaseInterface {
  month: Array<{
    firstDeposit: number;
    activePeople: number;
    contribute: number;
    date: string;
  }>;
  firthMonth: Array<{
    firstDeposit: number;
    activePeople: number;
    contribute: number;
    date: string;
  }>;
}
export interface GetDataCompParams extends BaseInterface {
  type: number;
  month: number;
}

/** 联盟分成数据 */
export interface AgentDivide extends BaseInterface {
  /** 总数 */
  total: number;
  /** 返回的list */
  list: Array<{
    /** 账号状态 */
    accountStatus: number;
    /** 佣金率 */
    commissionRate: number;
    /** 佣金类型 */
    commissionType: number;
    /** 时间 */
    date: number;
    /** 人数 */
    people: number;
    /** 收入 */
    revenue: string;
  }>;
}

/** 佣金返还数据 */
export interface AgentCommissionReturn extends BaseInterface {
  total: number;
  list: Array<{
    accountStatus: number;
    activeFlow: number;
    commissionRate: number;
    localDate: string;
    currencyAmount: null | {};
    relationId: string;
    uid: string;
    usdtCurrency: number;
  }>;
}

/** 费用明细 */
export interface AgentCommissionConstInfo extends BaseInterface {
  total: number;
  list: Array<{
    cost: number;
    platform: number;
    venue: number;
    date: number;
  }>;
}

/** 交易总览数据 */
export interface AgentCommissionOverview extends BaseInterface {
  total: number;
  list: Array<{
    affiliate: number;
    affiliateCurrency: null | {};
    bonus: number;
    cost: number;
    date: string;
    ggr: number;
    miscellaneousTotal: number;
    miscellaneousTotalCurrency: null | {};
    people: number;
    platform: number;
    reconciliation: number;
    venue: number;
  }>;
}

/** 产品明细数据 */
export interface DailyProfit extends BaseInterface {
  total: number;
  list: Array<{
    date: number;
    profitVoList: Array<{
      date: number;
      gameCategory: string;
      total: number;
      people: number;
    }>;
  }>;
}

/**@PageParams 分页参数 */
export interface PageParams extends BaseInterface {
  page: number;
  pageSize: number;
}

export interface GetHistoryExportParams extends BaseInterface {
  TimeFrame: number;
  Type: number;
  AccountType: number;
}

/** 会员管理 请求参数接口 */
export interface IStatisticUsersList extends BaseInterface {
  /** 用户uid */
  uid: string;
  /** 开始 统计时间*/
  beginTime: number | string;
  /** 结束 统计时间*/
  endTime: number | string;
  /** 注册日期 开始 */
  registerBeginTime: number | string;
  /** 注册日期 结束 */
  registerEndTime: number | string;
  /** 当前第几页 */
  page: number;
  /** 1页多少条 */
  pageSize: number;
}

/** 会员管理 接口返回数据 */
export interface StatisticUsersList extends BaseInterface {
  list: Array<{
    vip: number;
    deposit: number;
    withdraw: number;
    totalWinLoss: number;
    bonus: string;
    commission: string;
    uid: string;
    status: number;
    lastLoginTime: number;
    regTime: string;
  }>;
  total: number;
}
export interface UserRemoveBody extends BaseInterface {
  userId: string;
}
