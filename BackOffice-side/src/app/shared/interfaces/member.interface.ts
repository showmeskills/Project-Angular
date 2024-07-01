import { BaseInterface } from './base.interface';
import { Page } from 'src/app/shared/interfaces/page';
import { KYCRegionEnum } from 'src/app/shared/interfaces/kyc';

/**
 * 通用的分类代码和描述
 */
export interface CategoryCodeAndDesc<T = string> {
  categoryCode: T;
  categoryDescription: string;
}

/**
 * 调账种类枚举
 */
export enum AdjustmentCategoryEnum {
  Main = 1, // 主钱包
  Bonus = 6, // 红利钱包
  WithdrawLimit = 99, // 提款流水要求
  Ag = 20006, // AG钱包
  Ky = 40010, // 开元钱包
  Rg = 40016, // 雷竞技钱包
}

export type AdjustmentCategoryKeyEnum = keyof typeof AdjustmentCategoryEnum;
export type AdjustmentCategoryValueEnum = (typeof AdjustmentCategoryEnum)[AdjustmentCategoryKeyEnum];

/**
 * 调账类型枚举
 */
export enum AdjustmentTypeEnum {
  Other = 0, //其他/默认
  Deposit = 1, //存款
  Withdraw = 2, //提款
  Bonus = 3, //红利
  Payout = 4, //输赢
}

export type AdjustmentTypeKeyEnum = keyof typeof AdjustmentTypeEnum;
export type AdjustmentTypeValueEnum = (typeof AdjustmentTypeEnum)[AdjustmentTypeKeyEnum];

/**
 * 客户端来源
 */
export enum ClientSourceEnum {
  Unknown = 0, // 未知
  AndroidApp = 1, // 安卓
  IosApp = 2, // 苹果
  AndroidH5 = 3, // 安卓H5
  IosH5 = 4, // 苹果H5
  WinPc = 5, // Windows Web
  MacPc = 6, // Mac Web
  OldSys = 7, // 老系统
}
export type ClientSourceKeyEnum = keyof typeof ClientSourceEnum;
export type ClientSourceValueEnum = (typeof ClientSourceEnum)[ClientSourceKeyEnum];

/**
 * 接口返回来源下拉列表
 */
export type ClientSourceSelect = CategoryCodeAndDesc<ClientSourceKeyEnum>;

/**
 * 会员状态
 */
export enum MemberStatusEnum {
  NotActive = 0, // 未激活
  Normal = 1, // 正常
  Freezing = 2, // 冻结
  Disable = 3, // 禁用
  Deleted = 4, // 删除
  DisablePart = 5, // 部分禁用
}
export type MemberStatusKeyEnum = keyof typeof MemberStatusEnum;
export type MemberStatusValueEnum = (typeof MemberStatusEnum)[MemberStatusKeyEnum];

/**
 * 会员状态接口返回的下拉列表
 */
export type MemberStatusSelect = CategoryCodeAndDesc<MemberStatusKeyEnum>;

/**
 * 会员类型
 */
export enum MemberTypeEnum {
  TestUser, // 测试账号
  NormalUser, // 正式账号
}

/**
 * 会员列表请求参数
 */
export interface MemberListParams extends Page {
  region?: KYCRegionEnum; // Europe, Asia
  searchContent?: string; // UID/用户名/手机号/姓名/ID/EMail/IP/Wallet
  superiorId?: string; // 代理人ID
  vipGrade?: number[]; // VIP等级
  source?: ClientSourceEnum; // 客户端来源
  status?: MemberStatusEnum; // 会员状态
  orderType?: 'registerTime' | 'lastLoginTime'; // 排序字段：注册时间/最后登录时间
  memberType?: MemberTypeEnum; // 会员类型
  isAsc?: boolean; // 是否升序
  tenantId?: number; // 商户Id
  depositDays?: number; // 最近未存款(天)
  loginDays?: number; // 最近未登录（天）
  startTime?: number; // 按注册时间筛选
  endTime?: number; // 按注册时间筛选
  seniorQueryType?: MemberListSeniorQueryTypeEnum; // 高级查询类型
  seniorQueryContent?: string; // 高级查询值
  /** 账户经理id */
  accountId: string;
}

/**
 * 会员列表高级查询类型
 */
export enum MemberListSeniorQueryTypeEnum {
  None = 0, // 无
  ip = 1, // IP
  uid = 2, // UID
  name = 3, // 用户名
}

/**
 * 会员列表返回数据
 */
export interface MemberItem {
  id: number;
  uid: string;
  name: string;
  fullName: string;
  registerTime: number;
  lastLoginTime: number;
  lastLoginIP: string; // 最近登陆IP
  depositProportion: number;
  profitProportion: number;
  vipGrade: number;
  source: ClientSourceKeyEnum;
  status: MemberStatusKeyEnum;
  balance: number;
  superiorUId: string;
  tenantId: number;
  currencies: string[];
  kycCountry: null | string;
  isAlliance: boolean;
  creditPoints: number;
  kycGrade: string;
  playedGameInfo: null | string;
  activeDays: number;
  createChannel: string;
  inviteCode: string;
  riskControl: string; // 风控等级
  birthday: string; // 生日
  registerIP: string; // 注册IP
  totalDeposit: string; // 总存款
  totalWithdraw: string; // 总提款
  email: string; // 邮箱
  /** 当前用户 accountManager 名称 */
  accountName: string;
}

/**
 * 会员活动状态
 */
export enum MemberActivityStatus {
  Unknown = 0,
  Success = 1, /// <summary>        /// 成功 （提款部分冲正也是成功）        /// </summary>        [Description("成功")]
  Fail = 2, /// <summary>        /// 失败        /// </summary>        [Description("失败")]
  UserCanceled = 3, /// <summary>        /// 客户取消        /// </summary>        [Description("客户取消")]
  Waiting = 4, /// <summary>        /// 等待（等待用户存款）        /// </summary>        [Description("等待")]
  Timeout = 5, /// <summary>        /// 入款超时        /// </summary>        [Description("入款超时")]
  Canceled = 6, /// <summary>        /// 人工取消         /// </summary>        [Description("人工取消")]
  Process = 7, /// <summary>        /// 处理中(提交给支付渠道后状态)        /// </summary>        [Description("处理中")]
  Review = 8, /// <summary>        /// 审核中        /// </summary>        [Description("审核中")]
  Passed = 9, /// <summary>        /// 审核通过        /// </summary>        [Description("审核通过")]
  NotPassed = 10, /// <summary>        /// 审核不通过        /// </summary>        [Description("审核不通过")]
  SysCanceled = 11, /// <summary>        /// 系统取消（= 全部冲正）        /// </summary>        [Description("系统取消")]
}

/**@Actiontype 可以显示用户行为的常量 */
export enum Actiontype {
  Login = 'Login',
  Logout = 'Logout',
  ModifyName = 'ModifyName',
  ModifyPassword = 'ModifyPassword',
  BindGoogleValidator = 'BindGoogleValidator',
  UnBindGoogleValidator = 'UnBindGoogleValidator',
  CreateGoogleValid = 'CreateGoogleValid',
  BindMobile = 'BindMobile',
  UnBindMobile = 'UnBindMobile',
  ModifyMobile = 'ModifyMobile',
  WithdrawWhiteList = 'WithdrawWhiteList',
  DeleteDevice = 'DeleteDevice',
  Kyc = 'Kyc',
  Bonus = 'Bonus',
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
  Transfer = 'Transfer',
  BankCard = 'BankCard',
  TokenAddress = 'TokenAddress',
  Wager = 'Wager',
  Vip = 'Vip',
  LowerLevelUnbind = 'LowerLevelUnbind',
  Commission = 'Commission',
  Adjust = 'Adjust',
  Register = 'Register',
  InviteMembers = 'InviteMembers',
  Agent = 'Agent',
  VerCode = 'VerCode',
  Clear = 'Clear',
  DisableLogin = 'DisableLogin',
  Communicate = 'Communicate',
  DisableGame = 'DisableGame',
  DisablePayment = 'DisablePayment',
  ResetPassword = 'ResetPassword',
  NegativeClear = 'NegativeClear',
  CreditClear = 'CreditClear',
  WithdrawalLimitClear = 'WithdrawalLimitClear',
  CreditExpired = 'CreditExpired',
  ForUserDeposit = 'ForUserDeposit',
  ActivityBonus = 'ActivityBonus',
  DefCurrency = 'DefCurrency',
  Biometric = 'Biometric',
  LedReceive = 'LedReceive',
  LedExchange = 'LedExchange',
  BindEmail = 'BindEmail',
  UnBindEmail = 'UnBindEmail',
  KycDocAudit = 'KycDocAudit',
  Remark = 'Remark',
  KycDocSubmit = 'KycDocSubmit',
  KycDoc = 'KycDoc',
  KycUserInfo = 'KycUserInfo',
  KycVerify = 'KycVerify',
  KycEDD = 'KycEDD',
  NonSticky = 'NonSticky',
  RiskControl = 'RiskControl',
  FreeSpin = 'FreeSpin',
  DisableActivity = 'DisableActivity',
  AccountManager = 'AccountManager',
  BadDataRiskControl = 'BadDataRiskControl', // 不良数据
}

/**@ActionGreen 绿色行为 */
export enum ActionGreen {
  Login = 'Login',
  Logout = 'Logout',
  ModifyName = 'ModifyName',
  ModifyPassword = 'ModifyPassword',
  BindGoogleValidator = 'BindGoogleValidator',
  UnBindGoogleValidator = 'UnBindGoogleValidator',
  BindMobile = 'BindMobile',
  UnBindMobile = 'UnBindMobile',
  ModifyMobile = 'ModifyMobile',
  WithdrawWhiteList = 'WithdrawWhiteList',
  DeleteDevice = 'DeleteDevice',
  Kyc = 'Kyc',
  Register = 'Register',
  VerCode = 'VerCode',
  Communicate = 'Communicate',
  DefCurrency = 'DefCurrency',
  BindEmail = 'BindEmail',
  UnBindEmail = 'UnBindEmail',
  Biometric = 'Biometric',
  KycDocAudit = 'KycDocAudit',
  Remark = 'Remark',
  KycDocSubmit = 'KycDocSubmit',
  KycDoc = 'KycDoc',
  KycUserInfo = 'KycUserInfo',
  KycVerify = 'KycVerify',
  KycEDD = 'KycEDD',
  NonSticky = 'NonSticky',
  FreeSpin = 'FreeSpin',
}

/**@ActionYellow 黄色行为 */
export enum ActionYellow {
  Bonus = 'Bonus',
  Vip = 'Vip',
  Agent = 'Agent',
  InviteMembers = 'InviteMembers',
  LowerLevelUnbind = 'LowerLevelUnbind',
  BankCard = 'BankCard',
  TokenAddress = 'TokenAddress',
  ActivityBonus = 'ActivityBonus',
}

/**@QueryList 会员详情弹窗 查询tab接口 */
export interface QueryList extends BaseInterface {
  categoryCode: '' | 'Login' | 'Asset' | 'VerCode' | 'Audit' | 'Remark' | 'KYC';
  categoryDescription: string;
}
export interface QueryListItem extends QueryList {
  checked: boolean;
}
/**@AddCommunicateParams 添加备注接口参数 */
export interface AddCommunicateParams extends BaseInterface {
  uid: string;
  remark: string;
  fileUrl?: string;
  commentType?: string;
}

export interface IMemberOverview extends BaseInterface {
  memberId: number;
}
export type QueryTypeBase = '' | 'Login' | 'Asset' | 'VerCode' | 'Audit' | 'KYC' | 'Remark';
export interface IMemberBehavior extends BaseInterface {
  uid: string;
  queryType: QueryTypeBase | Array<QueryTypeBase>;
  pageIndex?: number;
  pageSize?: number;
}

export interface AssetCourseListParams extends BaseInterface {
  OrderType?: string;
  OrderNum?: string;
  StartTime?: number;
  EndTime?: number;
  Uid: string;
  PageIndex?: number;
  PageSize?: number;
}

export interface GrantList extends BaseInterface {
  uid: string;
  pageIndex: number;
  pageSize: number;
}

/**
 * 禁用会员登录游戏参数
 */
export interface UserDisableParams extends BaseInterface {
  uid: string;
  isGame: boolean; // true:游戏交易；false:登录
  isEnabled: boolean; // true:启用：false：禁用
  gameCodes: string[]; // 用户禁用游戏的厂商id
}

export interface AuditData extends BaseInterface {
  auditTime: number; // 审核时间
  auditUserId: number;
  auditUserName: string;
  createdTime: number; // 创建时间
  createdUserId: number;
  createdUserName: string;
  detail: string; // 详情，已替换到form中
  form: {
    frontsideImage: string; // 身份证正面
    backsideImage: string; // 身份证反面
    bankRecordImages: string | string[]; // 银行记录
    cryptoCurrencyRecordImages: string | string[]; // 加密货币记录
    videoUrl: string;
  }; // 详情数据
  id: number;
  lastModifiedTime: number; // 最近一次修改时间
  lastModifiedUserId: number;
  lastModifiedUserName: string;
  mid: number;
  remark: string; // 拒绝原因
  status: string;
  tenantId: number;
  type: string; // 类型
  uid: string;
}

/**
 * 会员kyc接口数据
 */
export interface kycDocContent extends BaseInterface {
  operatorName: string; // 操作人
  operatorId: number; // 操作人id
  isVerificationIdentity: boolean; // 是否身份认证
  isVerificationAddress: boolean; // 是否是地址证明
  isVerificationWallet: boolean; // 是否财富来源证明
  isVerificationPaymentMethod: boolean; //支付方式
  paymentMethodName?: string; // 支付方式名称
  otherVerification?: string; // 其他
}

/**
 * 检查会员是否SVIP 对象枚举
 */
export const CheckSvipObjEnum = {
  AlreadIsSvip: 'alreadIsSvip', // 已经是SVIP
  NotExist: 'notExist', // 不存在会员数据
  InCD: 'inCD', // 在冷却中（30天内冷却时间中）

  // 自定义属性： 供模板显示用
  NotSvip: 'notSvip', // 不是SVIP
} as const;

export type CheckSvipEnum = (typeof CheckSvipObjEnum)[keyof typeof CheckSvipObjEnum];

/**
 * 检查会员是否SVIP接口返回数据
 */
export interface CheckSvipItem {
  typeName: CheckSvipEnum;
  uids: string[];
}

/**
 * 检查会员是否SVIP的提示模板回传类型
 */
export interface CheckSVIPTipTpl {
  $implicit: CheckSvipItem;
}

/**
 * 管理后台账号的调账限额返回数据
 */
export interface UserAmountLimitData extends BaseInterface {
  availableAmount: number; // 可用额度
  isNeedLimit: boolean; // 是否需要限制
  total: number; // 总额度
}

/**
 * 会员活动 - EDD状态
 */
export enum EDDStatusEnum {
  Initiated = 1, //  已发起
  Submitted = 2, //  已提交
  Rejected = 3, //  被拒绝
  Resubmitted = 4, // 已重新提交
  Approved = 5, //  已批准
}

/**
 * 非粘性奖金 - 类型
 */

export enum NonStickyTypeEnum {
  Get = 0, // 获取
  Activate = 1, // 激活
  Claim = 2, //  提取
  Abandon = 3, // 放弃/清理
}

/**
 * 返回数据 - 非粘性奖金总览 - 列表数据
 */
export interface NonStickyItem {
  cashableBonus: number; // 可变现奖金
  cashableBonusInfos: cashableInfo[]; // 可变现奖金详情
  lockedBonus: number; // 锁定奖金 USDT
  casinoBonus: number; // 娱乐场奖金
  liveCasinoBonus: number; // 真人娱乐场奖金
  bonus: BonusInfo[]; // 奖金列表
  total: number;
}
export interface BonusInfo {
  bonusCode?: string | null; // 奖品code
  prizeName: string; // 奖品名称
  prizeType: number; // 奖品类型
  prizeTypeDesc: string; // 奖品类型翻译
  activityName: string; // 活动名称
  amount: number; // 金额
  balance: number; // 当前奖金余额
  withdrawAmount: number; //提取金额
  currentBetTurnover: number; // 当前投注流水
  targetBetTurnover: number; // 目标投注流水
  laveBetTurnover: number; // 剩余投注流水
  betProgress: number; // 投注进度
  betCount: string; // 投注次数/要求次数
  status: string; // 状态
  statusDesc: string; // 状态翻译文本
  createdTime: number; // 时间
  source: string; // 来源
  currency: string; // 币种
}

interface cashableInfo {
  amount: number; // 金额
  currency: string; // 货币
}

/**
 * 返回数据 - 免费旋转 - 统计数据
 */
export interface FreeSpinStat {
  grantTotal: number; // 总发放次数
  bounsTotal: number; // 总获得奖金
  grantCount: number; // 发放张数
  usedRate: number; // 使用率
  expiredCount: number; // 已过期张数
  usingOrCompletedCount: number; // 进行中/已完成张数
}

/**
 * 会员活动 - 用户信息状态
 */
export enum UserInfoStatusEnum {
  Unknown = 'Unknown', // 兼容老数据
  None = 'None', //  不走审核
  Edit = 'Edit', //  编辑
  Reject = 'Reject', //  被拒绝
  Approve = 'Approve', // 通过
}

/**
 * 会员数据导出枚举类型
 */
export enum MemberExportTimeType {
  Day = 'Day',
  Month = 'Month',
  Year = 'Year',
}

/**
 * 会员报表导出请求参数
 */
export interface MemberExportParams {
  uid: string;
  startYear?: number; // 开始年份
  endYear?: number; // 结束年份
  startMonth?: number; // 开始月份
  endMonth?: number; // 结束月份
  startDay?: number; // 开始日期
  endDay?: number; // 结束日期
  exportYear?: number[]; // 导出年份
  requestCategory?: MemberExportTimeType; // 请求类别
}

/**
 * 会员报表导出返回数据
 */
export interface MemberExportResponse {
  date: string; // 日期
  totalDesposit: number; // 总存款
  totalWithdrawals: number; // 总提款
  ngr: number; // NGR
  ggr: number; // GGR
  totalBonus: number; // 总红利
  betAmount: number; // 投注金额
}

/**
 * 社交媒体类型
 */
export enum SocialUserType {
  Google = 'Google', // 0,
  Telegram = 'Telegram', // 1,
  MetaMask = 'MetaMask', // 2,
  Line = 'Line', // 3,
}

/**
 * 绑定社交媒体信息
 */
export interface MemberBindSocialMedia {
  socialUserId: string | null; // 社交账号id
  socialUserName: string | null; // 社交账号Name
  socialUserType: SocialUserType; // 社交账号类型
  isBinded: boolean; // 是否完成绑定
}

/**
 * 会员创建渠道
 */
export enum MemberCreateChannel {
  None = 'None', // 0
  Agent = 'Agent', // 1
  MyAffiliate = 'MyAffiliate', // 2
  Social = 'Social', // 3
  Alliance = 'Alliance', // 4
}

/**
 * 会员子钱包余额类目详情
 */
export interface MemberGameBalanceItemDetail {
  amount: number; // 金额
  category: string; // 钱包分类 category=Enum[ Main, Bonus, NSLiveCasino, NSSlotGame, WithdrawLimit, BoyaChess, Golden, SGWinChess, YYChess, GPIChess, AGSlot, AGYoPlay, AGHunter, KYChess, FCHunter, Baison, JDBGame, BBINLive, Ag, Ky, Rg ]
}

/**
 * 会员游戏子钱包余额
 */
export interface MemberGameBalance {
  rate: number; // USDT转CNY的汇率
  gameBalanceList: MemberGameBalanceItemDetail[]; // 子钱包余额列表
}

/**
 * 会员游戏禁用
 */
export interface MemberGameDisable {
  gameCode: null | string[]; // 用户禁用的游戏厂商
  startTime: number; // 禁用开始时间
  endTime: number; // 禁用结束时间
  isForever: boolean; // 是否终生禁止 （不是终生，那么就是指定开始，结束时间） true：是 false：否
}

/**
 * KYC信息
 */
export interface MemberKYCInfo {
  actualName: string | null; // 真实姓名
  countryCode: string | null; // 认证国家代码
  countryName: string | null; // 认证国家
  countryEnName: string | null; // 认证国家英文
  kycGrade: string | null; // Kyc等级
  kycGradeCode: string; // Kyc等级代码=Enum [ KycPrimary, KycIntermediat, KycAdvanced, IsOpenWhiteList, SiteMail, UserSetting, LiveCheck, RiskAssessment, WealthSource, FullAudit, BasicInfo, IdAndPoaVerifyStatus ]
  // KycPrimary:0, //初级认证
  // KycIntermediat:1, //中级验证
  // KycAdvanced:2, //高级验证
  // IsOpenWhiteList:3,
  // SiteMail:4,
  // UserSetting:5,
  // LiveCheck:6,
  // RiskAssessment:7,
  // WealthSource:8,
  // FullAudit:9,
  // BasicInfo:10,
  // IdAndPoaVerifyStatus:11,

  idType: string | null; // 证件类型
}

/**
 * 会员详情 - 最近登录信息
 */
export interface MemberLastLoginInfo {
  time: number; // 最近一次登录时间
  ip: string | null; // 最近一次登录IP
  source: ClientSourceValueEnum; // 最近一次登录客户端来源
  zone: string | null; // 最近一次登录地区
}

/**
 * 会员禁用支付信息
 */
export interface MemberDisablePaymentInfo {
  depositType: string[]; // 存款方式 Legal, BankCard
  withdrawType: string[]; // 提款方式 Legal, BankCard
  isForever: boolean; // 是否终生禁止 （不是终生，那么就是指定开始，结束时间） true：是 false：否
  fileAddress: string | null; // 文件域名
  fileUrl: string | null; // 文路径
  startTime: number; // 禁用开始时间
  endTime: number; // 禁用结束时间
}

/**
 * 会员详情概述
 */
export interface MemberOverview {
  actualName: null | string; // 真实姓名
  address: null | string; // 地址
  avatar: string | null; // 头像地址
  balance: number; // 余额
  balances: { [key: string]: number } | null; // 所有币种余额  例：{CNY: 0}
  bindBankCard: boolean; // 是否绑定银行卡
  bindGoogle2FA: boolean; // 是否绑定谷歌验证器
  bindMobile: boolean; // 是否绑定手机
  bindSocialInfo: MemberBindSocialMedia[]; // 社交媒体绑定信息
  bindTokenAddress: boolean;
  bonus: number; // 红利 USDT
  cashableBonus: number; // 可提取非粘性奖金
  childrenNums: number; // 下线数量
  couponBalance: number; // 抵用券余额
  createChannel: MemberCreateChannel; // 创建渠道
  createSource: ClientSourceValueEnum; // 创建的客户端平台
  createTime: number; // 注册时间
  credit: number; // 信用登记
  email: string | null; // 邮箱
  endTime: number; // 登录禁用结束时间
  freezeAmount: { [key: string]: number } | null; // 冻结余额明细 {CNY: 13115, USD: 0, THB: 50, VND: 0, AUD: 0, EUR: 0, GBP: 0, NZD: 0, ETH: 0.00096416, USDT: 19933,…}
  freezeAmountTotal: number; // 冻结总余额 USDT
  gameBalance: number; // 子钱包余额
  gameBalanceInfo: MemberGameBalance; // 游戏各个子钱包余额（子钱包余额详情）
  gameBalances: { [key: string]: number } | null; // 子钱包余额（不区分游戏，同币种相加） {CNY: 5000, USD: 23, THB: 20.8, USDT: 19.52}
  gameInfo: MemberGameDisable; // 游戏禁用信息
  gameWallet: { [key: string]: { [key: string]: number } } | null; // 每个游戏钱包明细 {AGSlot: {CNY: 0, USD: 23, THB: 20.8, USDT: 19.52}, Ag: {USDT: 0}, Ky: {CNY: 0}, Rg: {CNY: 5000}};
  handlingFee: number; // 剩余手续费明细 {CNY: 44, USD: 0, THB: 0, VND: 0, AUD: 0, EUR: 0, GBP: 0, NZD: 0, ETH: 0, USDT: 0, TRX: 0, USDC: 0,…}
  handlingFeeTotal: number; // 总剩余手续费 USDT
  iconAddress: string; // 图标静态资源域名地址 （需自行拼接资源路径）
  inviteCode: string | null; // MA邀请码
  isForever: boolean; // 登录禁用是否终生禁止 （不是终生，那么就是指定开始，结束时间） true：是 false：否
  isTest: boolean; // 是否测试会员（true=不会参与数据统计，设置true无法改为false否则会影响统计结果=Arthur、Liz）
  isWatch: boolean; // 是否监视列表
  kycInfo: MemberKYCInfo; // KYC信息
  lastLoginInfo: MemberLastLoginInfo; // 最近登录信息
  ledLockedAmount: number; // LED已解锁待领取金额
  ledReceiveAmount: number; // LED已领取总金额
  ledUnlockableAmount: number; // LED可解锁金额
  limitAmount: number; // 限额(USDT)
  limitAmounts: { [key: string]: number } | null; // 所有币种限额 {CNY: 52301.259718944, USD: 0.39, THB: 0.14, VND: 2, AUD: 90, EUR: 54.2, GBP: 0, NZD: 0,…}
  mobile: string | null; // 手机号码
  name: string | null; // 用户名
  paymentInfo: MemberDisablePaymentInfo; // 支付禁用信息
  safeAuth: string[]; // 安全认证过的类型 Enum:[ Mobile, Google ]
  startTime: number; // 登录禁用开始时间
  status: string; // 账号状态,中文注释
  statusCode: MemberStatusValueEnum;
  superiorUId: string; // 上级代理/推荐人uid
  tenantId: number;
  uid: string;
  vip: number; // VIP等级
  vipProcess: number; // VIP升级进度
  riskControl: string; // 风控级别
  activityInfo: ActivityInfo | null; // 红利控制
  /** 账户经理id */
  accountId: string;
  /** 账户经理名称 */
  accountName: string;
  /** 不良ID */
  badDataId: number | null;
  /** 最后投注时间 */
  lastBetTime: number;
}

export interface ActivityInfo {
  activityCode: string[];
  startTime: number;
  endTime: number;
  // 是否终生禁止 （不是终生，那么就是指定开始，结束时间） true：是 false：否
  isForever: boolean;
}

/**
 * 会员统计数据
 */
export interface MemberStatistics {
  depositTotal: number; // 存款总额
  withdrawTotal: number; // 提款总额
  nrgTotal: number; // 赌博净利总额
  toDep: number; // 流存比
  toBon: number; // 流红比
  bankerAdvantage: number; // 庄家优势
  avgBet: number; // 平均交易金额
  activeDay: number; // 活跃天数
  couponTotal: number; // 抵用金总额
  avgDep: number; // 平均存款 = 根据存款金额/存款成功的笔数
  toRoi: number; // 百分比已领取红利 / 总流水
}

/**
 * 会员详情 - 竞赛活动排名详情（返回数据）
 */
export interface TournamentActivitInfo {
  selectCode: TournamentActivitSelectItem[];
  userRankInfo: TournamentActivitUserRankInfo[];
}
export interface TournamentActivitSelectItem {
  code: string;
  name: string;
}
export interface TournamentActivitUserRankInfo {
  amount: number;
  code: string;
  rankNumber: number;
  uidBetMoney: number;
  uidWinOrLost: number;
  currency: string;
}

/**
 * 会员详情 - 通讯记录列表类目
 */
export interface CorrespondenceItem {
  id: number;
  boardType: string;
  messageBoardTime: number;
  createdTime: number;
  lastEditName: string;
  info: CorrespondenceInfoItem[];
}

/**
 * 会员详情 - 通讯记录多语言列表类目
 */
export interface CorrespondenceInfoItem {
  languageCode: string;
  problem: string;
  answer: string;
}

/**
 * 异常会员详情 - IP/设备指纹列表类目
 */
export interface DeviceIpItem {
  createTime: number;
  source: string;
  ip: string;
  fingerprint: string | null;
}

/**
 * 批量获取会员或管理后台账号基本信息
 */
export interface AccountInfo {
  source: number; // 来源： 1=后台账号 2=前端会员
  uid: string; // 会员是uid 后台账号是主键id
  tenantId: number; // 商户Id
  name: string; // 昵称
  avatar: string; // 头像
}

/**
 * 资金流向分析 - 列表类目
 */
export interface FundFlowAnalysisItem {
  tenantId: number;
  uid: string;
  cteatedTime: number;
  orderNum: string; // 订单号
  orderType: string; // 订单类型
  fromWallet: string;
  toWallet: string;
  fromBeforeBalance: number;
  fromAfterBalance: number;
  toBeforeBalance: number;
  toAfterBalance: number;
  amount: number;
  currency: string;
}

/**
 * 资金流向分析 - 列表类目
 */
export interface MessageBanItem {
  createTimeStamp: number;
  uid: string;
  userName: string;
  vip: number;
  checked?: boolean;
}

/**
 * 会员列表：在线消息白名单 - 列表类目
 */
export interface MessageWhiteItem {
  createTime: string;
  createTimestamp: number;
  uid: string;
  userName: string;
  vipLevel: number;
  checked?: boolean;
}

/**
 * 会员IP - 列表类目
 */
export interface IpSessionsItem {
  loginTime: number;
  endTime: number;
  startBalance: number;
  endBalance: number;
  ip: string;
  ipLocation: string;
  fingerprint: string;
  device: string;
  os: string;
  browser: string;
  totalActiveFlow: number;
}

/**
 * 不良数据 - 列表类目
 */
export interface BadDataItem {
  id: number;
  tenantIds: number[];
  type: string;
  value: string;
  comment: string;
  createdUserName: string;
  createdTime: number;
}

/**
 * 不良数据详情 - 列表类目
 */
export interface BadDataDetailItem {
  tenantId: number;
  mid: number;
  uid: string;
  createdTime: number;
}
