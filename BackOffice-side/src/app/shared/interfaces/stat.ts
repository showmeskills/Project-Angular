import { Page } from 'src/app/shared/interfaces/page';
import { CorrespondenceInfoItem } from 'src/app/shared/interfaces/member.interface';

/**
 * 导出数据通用请求参数
 */
export interface DataExportParams extends Page {
  beginDate?: string; // 开始日期
  endDate?: string; // 结束日期
  tenantIds?: Array<string | number>; // 多商户id筛选
  isExport?: boolean; // 是否导出
}

/**
 * 操作日志导出请求参数
 */
export interface OperaLogParams extends DataExportParams {
  userName?: string; // 操作人
}

/**
 * 市场数据请求参数
 */
export interface MarketDataParams extends DataExportParams {
  hasTest?: boolean; // 是否含测试用户
}

/**
 * 市场数据类目
 */
export interface MarketDataItem {
  stat_date?: string | null;
  site_id: number;
  market?: string | null;
  ggr: number;
  ngr: number;
  real_sports_turnover: number;
  real_sports_winnings: number;
  sports_bonus_issued: number;
  sports_bonus_withdrawn: number;
  real_lottery_turnover: number;
  real_lottery_winnings: number;
  lottery_bonus_issued: number;
  lottery_bonus_withdrawn: number;
  live_casino_turnover: number;
  live_casino_winnings: number;
  live_casino_bonus_issued: number;
  live_casino_bonus_withdrawn: number;
  real_casino_turnover: number;
  real_casino_winnings: number;
  casino_bonus_issued: number;
  casino_bonus_withdrawn: number;
  real_poker_turnover: number;
  real_poker_winnings: number;
  poker_bonus_issued: number;
  poker_bonus_withdrawn: number;
  gw_amount: number;
  wd_adjustments: number;
  cashback: number;
  vip_bonus_issued: number;
  vip_bonus_withdrawn: number;
  credit_bonus_issued: number;
  credit_bonus_withdrawn: number;
  cash_bonus_issued: number;
  cash_bonus_withdrawn: number;
  commission_rebate: number;
  referral_kickback: number;
  top_referral_bonus: number;
  deposit: number;
  withdraw: number;
  adjust_amount_usdt: number;
  adjust_deposit_withdraw_usdt: number;
  net_deposit: number;
  deposit_count: number;
  ftd: number;
  register: number;
  active_player: number;
}

/**
 * 操作日志
 */
export interface OperationLogItem {
  tenant_id: number; // 商户id
  operation_name?: string; // 操作功能
  operation_type: number; // 操作类型
  user_name?: string; // 操作人
  created_time?: string; // 操作时间
}

/**
 * VIP数据
 */
export interface VIPDataParams extends DataExportParams {
  hasTest?: boolean; // 是否含测试用户
}

/**
 * VIP数据类目
 */
export interface VipDataItem {
  user_name: string; // 用户名
  uid: string; // uid
  vip_level: string; // vip等级
  first_deposit_date: string; // 首存日期
  last_login_time: string; // 最后登入时间
  active_flow_usdt: number; // 当月有效流水
  ngr_usdt: number; // 当月净盈利
  payout_usdt: number; // 当月总输赢
  bonus_receive_usdt: number; // 已领取红利
  coupon_used_usdt: number; // 已使用抵用金
  adjust_amount_usdt: number; // 调账
  back_water_receive_usdt: number; // 返水
  platform_fee_usdt: number; // 平台费
  hall_fee_usdt: number; // 场馆费
  deposit_withdraw_fee_usdt: number; // 存提款手续费
}

/**
 * 会员余额请求参数
 */
export interface MemberBalanceParams extends DataExportParams {
  hasTest?: boolean; // 是否含测试用户
  statDate: string; // 统计日期
}

/**
 * 会员余额类目
 */
export interface MemberBalanceItem {
  uid: string; // uid
  player_id: number; // player_id
  player_country_code: string; //国家代码
  site_id: number; //站点id
  currency: string; //货币
  balance: number; //余额
  adjust_amount: number; //调账
  adjust_amount_usdt: number; // 调账usdt
  deposit_adjust_amount: number; // 存款调账
  deposit_adjust_amount_usdt: number; // 存款调账usdt
  withdraw_adjust_amount: number; // 提款调账
  withdraw_adjust_amount_usdt: number; // 提款调账usdt
  bonus_adjust_amount: number; // 红利调账
  bonus_adjust_amount_usdt: number; // 红利调账usdt
  payout_adjust_amount: number; // 输赢调账
  payout_adjust_amount_usdt: number; // 输赢调账usdt
  commission_rebate: number; // 佣金
  commission_rebate_usdt: number; // 佣金usdt
  referral_kickback: number; // 推荐佣金
  referral_kickback_usdt: number; // 推荐佣金usdt
  top_referral_bonus: number; // 顶级推荐人
  top_referral_bonus_usdt: number; // 顶级推荐人usdt
}

/**
 * 活跃用户
 */
export interface ActiveUserParams extends DataExportParams {
  hasTest?: boolean; // 是否含测试用户
}

/**
 * 活跃用户类目
 */
export interface ActiveUserItem {
  tenant_id: string; // 商户id
  uid: string; // uid
  date: string; // 日期
}

/**
 * 首存数据
 */
export interface FirstDepositParams extends DataExportParams {
  hasTest?: boolean; // 是否含测试用户
}

/**
 * 首存数据类目
 */
export interface FirstDepositItem {
  uid: string; // uid
  first_deposit_time: string; // 首存时间
  register_time: string; // 注册时间
  create_source: string; // 来源
}

/**
 * 首存数据
 */
export interface GameTopParams extends DataExportParams {
  hasTest?: boolean; // 是否含测试用户
  Sort?: number; //排序 0=有效流水 1=GGR 2=玩家数
}

/**
 * 首存数据类目
 */
export interface GameTopItem {
  num: number; //序号
  game_provider: string; //厂商
  game_code: string; //游戏code
  game_name: string; //游戏名称
  active_flow_usdt: number; //有效流水
  ggr_usdt: number; // ggr
  player_total: number; // 玩家数
}

/**
 * 银行卡新增数据
 */
export interface BankDataParams {
  tenantIds?: Array<string | number>; // 多商户id筛选
  isExport?: boolean; // 是否导出
}

/**
 * 银行卡新增数据类目
 */
export interface BankDataItem {
  tenant_id: number; //商户id
  month: string; //月份
  count: number; //数量
}

/**
 * 游戏厂商GGR数据
 */
export interface ProviderggrParams extends DataExportParams {
  hasTest?: boolean; // 是否含测试用户
  dateType?: string;
}

/**
 * 游戏厂商GGR数据类目
 */
export interface ProviderggrItem {
  tenant_id: number; //商户id
  month: string; //月份
  date: string; //月份
  game_category: string; //游戏类别
  game_provider: string; //游戏厂商
  wager_count: number; //注单数
  active_flow_usdt: number; // 有效流水
  payout_usdt: number; // 用户输赢
  active_user: number;
}

/**
 * 代理数据
 */
export interface ProxyDataParams {
  hasTest?: boolean; // 是否含测试用户
  tenantId?: string | number; // 多商户id筛选
  isExport?: boolean; // 是否导出
  monthReview: string; // 查询月份(yyyy-MM)
  current?: number;
  size?: number;
}

/**
 * 代理数据类目
 */
export interface ProxyDataItem {
  uid: string;
  tenantId: number;
  dataMonth: string;
  active: number;
  bonus: number;
  commission: number;
  commissionAmount: number;
  commissionTop: number;
  contributionTotal: number;
  deduction: number;
  deposit: number;
  lastAmount: number;
  monthCommission: number;
  monthCurrency: number;
  monthCurrencyStr: string;
  monthDeposit: number;
  monthFirstDeposit: number;
  monthFirstDepositPeople: number;
  monthWithDraw: number;
  newActive: number;
  platform: number;
  platformInfo: string;
  platformRate: number;
  protectCommission: number;
  protectTime: string;
  proxyState: number;
  recommendAmount: number;
  subordinateTotal: number;
  totalCost: number;
  totalCostStr: string;
  transactions: number;
  transactionsCurrency: string;
  transactionsSize: number;
  venue: number;
  venueInfo: string;
  wagerTotal: number;
  winOrLoss: number;
}

/**
 * 红利数据
 */
export interface BonusActivityParams extends DataExportParams {
  hasTest?: boolean; // 是否含测试用户
  bonusType?: string; //红利类别
  prizeType?: string; //奖品类型
}
/**
 * 红利与奖品
 */
export interface BonusPrizeTypeSelect {
  code: number; //商户id
  name: string; //红利类别
}
/**
 * 游戏厂商GGR数据类目
 */
export interface BonusActivityItem {
  tenant_id: number; //商户id
  category: string; //红利类别
  activity: string; //活动名称
  bonus_type: string; //奖品类别
  grant_amount: number; //已发放
  join_times: number; //发放次数
  receive_amount: number; //已领取
  unlock_amount: number; //已解锁
  expired_amount: number; //已过期
  used_amount: number; //已使用
  giveup_amount: number; //已放弃
  total_times: number; //总次数
  bonus_amount: number; //奖金
}

/**
 * 每日数据 接口参数
 */
export interface DailyDataReport extends DataExportParams {
  hasTest: boolean;
}

/**
 * 每日数据 list
 */
export interface DailyDataList {
  stat_date: string;
  tenant_id: number;
  regs: number;
  ftds: number;
  au: number;
  ggr: number;
  active_flow: number;
  deposit_count: number;
  deposit_amount: number;
  withdraw_count: number;
  withdraw_amount: number;
  grant_amount: number;
  receive_amount: number;
  coupon_expired_amount: number;
  adjust_amount: number;
  ngr: number;
  sport_au: number;
  sport_active_flow: number;
  sport_payout: number;
  slot_game_au: number;
  slot_game_active_flow: number;
  slot_game_payout: number;
  live_casino_au: number;
  live_casino_active_flow: number;
  live_casino_payout: number;
  lottery_au: number;
  lottery_active_flow: number;
  lottery_payout: number;
  chess_au: number;
  chess_active_flow: number;
  chess_payout: number;
  currency: string;
}

/**
 * 会员红利明细
 */
export interface PlayerBonusDownbreak {
  tenant_id: number;
  uid: string;
  category: string;
  activity: string;
  bonus_type: string;
  grant_amount: number;
  join_times: number;
  receive_amount: number;
  unlock_amount: number;
  expired_amount: number;
  used_amount: number;
  giveup_amount: number;
  total_times: number;
  bonus_amount: number;
}

/**
 * 会员红利明细接口参数
 */
export interface PlayerBonusDownbreakParams extends DataExportParams {
  hasTest?: boolean;
  uids: string;
  bonusType?: string; //红利类别
  prizeType?: string; //奖品类型
}

/**
 * 每日统计数据
 */
export interface DailyStatisticsParams extends DataExportParams {
  hasTest?: boolean; // 是否含测试用户
}

/**
 * 每日统计数据类目
 */
export interface DailyStatisticsItem {
  tenant_id: number; //商户id
  stat_date: string; //统计日期
  pc_register_count: string; //pc注册数量
  pc_login_count: number; //pc登录数量
  ios_register_count: number; //ios注册数量
  ios_login_count: number; //ios登录数量
  android_register_count: number; //安卓注册数量
  android_login_count: number; //安卓登录数量
  deposit_count: number; //存款数量
  wager_count: number; //下注数量
}

/**
 * psp 存款统计 请求接口
 */
export interface PspDepositParams extends DataExportParams {
  currency: string;
  page: number;
  pageSize: number;
}

export interface PspDepositList {
  uid: string;
  order_num: string;
  type: string;
  apply_time: number;
  arrival_time: number;
  time_difference: number;
  amount: number;
  currency: string;
  psp_name: string;
}

/**
 * 报告查看  - 数据类目
 */
export interface ReportViewerItem {
  tenantId: string;
  mid: string;
  uid: string;
  userName: string;
  fullName: string;
  birthDay: number;
  areaCode: string;
  mobile: string;
  email: string;
  emailDomain: string;
  registeredTime: number;
  registeredIp: string;
  lastLoginIp: string;
  lastLoginTime: number;
  userBalance: number;
  firstDepositTime: number;
  firstDepositAmount: number;
  currencies: string;
  totalDeposit: number;
  totalWithdrawal: number;
  totalBet: number;
  bettingProducts: { gameCategory: number; gameProviders: string[] }[];
  vipLevel: number;
  riskControl: string;
  kycLevel: string;
  status: string;
  withBonusRestrictions: boolean;
  depositRestrictions: boolean;
  withdrawalRestrictions: boolean;
  superiorUId: string;
  firstDepositIp: string;
  firstWithdrawalIp: string;
  firstWithdrawalDate: number;
  firstDeclinedWithdrawalAmount: number;
  lastDepositDate: number;
  lastGameDate: number;
  bonusUsed: boolean;
}

/**
 * 报告查看:通讯记录  - 列表数据类目
 */
export interface ReportCorrespondenceItem {
  uid: string;
  boardType: string;
  messageTime: number;
  editor: string;
  problem: string[];
  infoList: CorrespondenceInfoItem[];
}
