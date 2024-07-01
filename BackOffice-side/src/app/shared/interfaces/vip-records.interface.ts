import { Page } from 'src/app/shared/interfaces/page';

/**
 * 导出数据通用请求参数
 */
export interface DataExportParams extends Page {
  beginTime?: string; // 开始日期
  endTime?: string; // 结束日期
  tenantIds?: Array<string | number>; // 多商户id筛选
}

/**
 * 推广玩家
 */
export interface PlayersPromoteParams extends DataExportParams {
  AccountId?: number; // 账户经理id
}

/**
 * 推广玩家类目
 */
export interface PlayersPromoteItem {
  mid: number; //
  uid: string; //
  accountManager: string; // 账户经理
  createTime: string; //创建时间
  accountId: number; //
  lastLoginTime: string; //最近一次登录时间
  totalDeposit: number; //总存款
  depositCount: number; //存款数
  totalWithdrawal: number; //总提款
  withdrawCount: number; //提款数
  ngr: number; //
  activeDaysMonth: number; //本月的活跃天数
  activeThirtyDay: number; //过去30天的活跃天数
  accountActiveDay: number; //帐户创建以来的总活跃天数
  casinoActiveFlow: number; //娱乐场有效流水
  sportsActiveFlow: number; //体育有效流水
  totalActiveFlow: number; //总有效流水
  toRoi: number; //流红比
  toBon: number; //流红比
  toDep: number; //流存比
  totalAmount: number; //奖金金额
  bonusesCount: number; //奖金次数
  avgBetCasino: number; //娱乐城平均投注额
  avgBetSports: number; //体育平均投注额
  avgBet: number; //平均投注额
  superiorUId: string;
  inviteCode: string;
}

/**
 * VIP绩效
 */
export interface VipPerformanceParams extends DataExportParams {
  AccountId?: number; // 账户经理id
}

/**
 * VIP绩效类目
 */
export interface VipPerformanceItem {
  mid: number; //
  uid: string; //
  accountManager: string; // 账户经理
  createTime: string; //创建时间
  accountId: number; //
  lastLoginTime: string; //最近一次登录时间
  totalDeposit: number; //总存款
  depositCount: number; //存款数
  totalWithdrawal: number; //总提款
  withdrawCount: number; //提款数
  ngr: number; //
  activeDaysMonth: number; //本月的活跃天数
  activeThirtyDay: number; //过去30天的活跃天数
  accountActiveDay: number; //帐户创建以来的总活跃天数
  casinoActiveFlow: number; //娱乐场有效流水
  sportsActiveFlow: number; //体育有效流水
  totalActiveFlow: number; //总有效流水
  toRoi: number; //流红比
  toBon: number; //流红比
  toDep: number; //流存比
  totalAmount: number; //奖金金额
  bonusesCount: number; //奖金次数
  avgBetCasino: number; //娱乐城平均投注额
  avgBetSports: number; //体育平均投注额
  avgBet: number; //平均投注额
  isFirstVip: boolean; //是否首次添加为VIP
  bindAccountTime: string; //添加为VIP日期
  removals: number; //移除次数
  vipActiveDay: number; //成为VIP后的活跃天数
}

/**
 * VIP绩效
 */
export interface VipComparisonParams extends DataExportParams {
  AccountId?: number; // 账户经理id
  FirstBeginTime?: string;
  FirstEndTime?: string;
  SecondBeginTime?: string;
  SecondEndTime?: string;
}

/**
 * VIP绩效类目
 */
export interface VipComparisonItem {
  mid: number; //
  uid: string; //
  accountManager: string; // 账户经理
  createTime: string; //创建时间
  accountId: number; //
  lastLoginTime: string; //最近一次登录时间
  totalDeposit: number; //总存款
  depositCount: number; //存款数
  totalWithdrawal: number; //总提款
  withdrawCount: number; //提款数
  ngr: number; //
  activeDaysMonth: number; //本月的活跃天数
  activeThirtyDay: number; //过去30天的活跃天数
  accountActiveDay: number; //帐户创建以来的总活跃天数
  casinoActiveFlow: number; //娱乐场有效流水
  sportsActiveFlow: number; //体育有效流水
  totalActiveFlow: number; //总有效流水
  toRoi: number; //流红比
  toBon: number; //流红比
  toDep: number; //流存比
  totalAmount: number; //奖金金额
  bonusesCount: number; //奖金次数
  avgBetCasino: number; //娱乐城平均投注额
  avgBetSports: number; //体育平均投注额
  avgBet: number; //平均投注额
  isFirstVip: boolean; //是否首次添加为VIP
  bindAccountTime: string; //添加为VIP日期
  removals: number; //移除次数
  vipActiveDay: number; //成为VIP后的活跃天数
  timePeriod: string; //时间段
}
