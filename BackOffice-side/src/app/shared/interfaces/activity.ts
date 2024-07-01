import { BaseInterface } from 'src/app/shared/interfaces/base.interface';
import { Observable } from 'rxjs';
import { PageIndex } from 'src/app/shared/interfaces/page';

/**
 * 通用活动 - 类型 GoGaming的活动类型
 */
export enum ActivityTypeEnum {
  Unknown = 0, // 未知
  Turntable = 1, // 大转盘
  NewUser = 2, // 新人模板
  Deposit = 3, // 首存送
  CouponCodeDeposit = 7, // 存送券码
  Guess = 4, // 竞猜
  NewRank = 5, // 新竞赛
  EWalletDepBonus = 6, // 额外存款奖励
  VipSignIn = 8, // 登录签到
  VipExclusive = 9, // 专属VIP
}

/**
 * 活动资格流程通用 - 类型枚举 Java服务的活动类型
 */
export enum ActivityQualificationsTypeEnum {
  newuser = ActivityTypeEnum.NewUser, // 新人模板
  deposit = ActivityTypeEnum.Deposit, // 首存送
  couponcodedeposit = ActivityTypeEnum.CouponCodeDeposit, // 存送券码
  guess = ActivityTypeEnum.Guess, // 竞猜
  spin = ActivityTypeEnum.Turntable, // 大转盘
  newrank = ActivityTypeEnum.NewRank, // 新竞赛
  eWalletDepBonus = ActivityTypeEnum.EWalletDepBonus, // 额外奖励
  vipsignin = ActivityTypeEnum.VipSignIn, // 登录签到
  vipexclusive = ActivityTypeEnum.VipExclusive, // 专属VIP
}

export type ActivityQualificationsType = keyof typeof ActivityQualificationsTypeEnum;

/**
 * 通用活动 - 状态
 */
export enum ActivityStatusEnum {
  waitingStart = 0, // 待开始
  inProgress = 1, // 进行中
  stopped = 2, // 已停止、已过期
  startReview = -1, // 启动审核中
  stopReview = -2, // 停止审核中
}

/**
 * 活动周期
 */
export enum ActivityCycleEnum {
  Once = 0, // 一次性
  Day = 1, // 每日
  Week = 2, // 每周
  Month = 3, // 每月
  EveryTime = 4, // 每次
}

/**
 * 奖品金额类型
 */
export enum PrizeAmountType {
  Fixed = 1, // 固定金额
  Rate = 2, // 按比例
}

/**
 * 奖品 发放方式类型
 */
export enum PrizeDistributionEnumType {
  Need = 1, // 需要领取
  Direct = 2, // 直接领取
}

/**
 * 奖品 卷有效期类型
 */
export enum PrizePeriodEnumType {
  Period = 1, // 相对时间
  Permanent = 2, // 永久有效
}

/**
 * 奖品 抵用金：可用范围类型
 */
export enum PrizeCreditLimitEnumType {
  Common = 1, // 全场通用
  Category = 2, // 指定游戏类型
  Provider = 3, // 指定游戏厂商
}

/**
 * 奖品 非粘性/粘性 奖金：可用范围类型
 */
export enum PrizeStickyLimitEnumType {
  SlotGame = 'SlotGame', // 娱乐场投注
  LiveCasino = 'LiveCasino', // 真人娱乐场投注
  SportsBook = 'SportsBook', // 体育投注
}

/**
 * 奖品类型
 */
export enum PrizeType {
  All = 0, // 全部
  Cash = 1, // 现金券
  Credit = 2, // 抵用金
  SvipEXP = 3, // SVIP体验券
  AfterCash = 7, // 后发现金券
  RealItem = 4, // 实物
  Equipment = 5, // 装备
  FreeSpin = 6, // Free Spin
  NonStickyBonus = 8, // 非粘性奖金
  StickyBonus = 9, // 粘性奖金
}

/**
 * 奖品参数
 */
export interface PrizeParams {
  merchantId: string | number; // 商户ID
  prizeName?: string; // 奖品名称
  prizeType?: number; // 奖品类型，1:现金券,2:抵用金,3:SVIP体验券,4:实物,5:装备,6:Free Spin,7:后发现金券
  currency?: number; // 币种
  pageIndex: number; // 页码
  pageSize: number; // 每页条数
  lang?: string; // 语言
}

/**
 * 奖品
 */
export interface Prize {
  id: number;
  prizeName: string;
  prizeCode: string; // 奖品代码、券码（总共8位，数字+字母，目前并无实际用处，预留后续关联活动使用）
  amount: number; // 金额
  amountType: number; // 金额类型(1：固定金额,2：按比例)
  currency: string;
  prizeType: number; // 奖品类型，1:现金券,2:抵用金,3:后发现金券,4:实物,5:装备,6:Free Spin,7:SVIP体验券
  prizeTypeName?: string | null; // 自定义奖品类型名称
  totalIssuedCount: number; // 已发放数量（所有活动）
  createdTime: number; // 创建时间戳（毫秒）
  status: number; // 状态，1:待审核,2:已审核,3:已下架
  times: number; // 次数，老虎机等旋转的游戏赠送的次数（当奖品类型为Free Spin时）
  freeSpinTimes: number; // Free Spin - 旋转次数
  rate: number; // 比例
  expirationDays: number; // 券有效期，单位：天（当奖品类型为现金券、抵用金、SVIP时），0代表永久有效
  isRisk: boolean; // 是否风控
  rateLimit: number; // 比例类型时，奖品金额上限
}

/**
 * 奖品
 */
export interface PrizeInfo {
  amount: number; // 金额
  amountType: number; // 金额类型(1：固定金额,2：按比例)
  categories: string[]; // 指定类型（数组格式，如：["SportsBook","Esports"]），空阵列代表不限制（奖品类型：抵用金）
  currency: string; // 币种
  expirationDays: number; // 券有效期，单位：天（当奖品类型为现金券、抵用金、SVIP时），0代表永久有效
  expirationEndTime: number; // 适用开始时间戳（单位：毫秒）（奖品类型：Free Spin）
  expirationStartTime: number; // 适用截止时间戳（单位：毫秒）（奖品类型：Free Spin）
  gameProvider: string[]; // 游戏提供商
  id: number;
  isRisk: boolean; // 是否风控
  maxSingleOrder: number; // 单笔使用上限金额，不限制则为0
  maxSingleOrderRate: number; // 单笔使用上限比例（小数形式，如：0.1表示10%）不限制则为0
  merchantId: string; // 商户ID
  picture: string; // 奖品图片（相对路径）
  prizeCode: string; // 奖品代码、券码（总共8位，数字+字母，目前并无实际用处，预留后续关联活动使用）
  prizeName: Array<{ id?: number; lang: string; prizeFullName: string; prizeShortName: string }>; // 奖品名称 多语系
  prizeType: number; // 奖品类型，1:现金券,2:抵用金,3:后发现金券,4:实物,5:装备,6:Free Spin,7:SVIP体验券
  providers: string[]; // 游戏提供商
  rate: number; // 比例
  rateLimit: number; // 比例类型时，奖品金额上限
  sendType: number; // 发放类型 奖品发放方式(1：需要领取,2：直接发放)
  times: number; // 次数，老虎机等旋转的游戏赠送的次数（奖品类型：Free Spin）
  withdrawFlowMultiple: number; // 提款流水倍数
}

/**
 * 大转盘类型枚举
 */
export enum TurntableTypeEnum {
  Grid12 = 'Grid12', // 默认 12个格子
  Grid16 = 'Grid16', // 模板2的 16个格子 附加转盘等级（普通、钻石、铂金）
}

/**
 * 大转盘模板类型枚举
 */
export enum TurntableTemplateTypeEnum {
  Default = 0, // 默认
  Template2 = 2, // 模板2 (定制转盘模板)
}

/**
 * 大转盘模板2附加等级类型枚举
 */
export enum TurntableTemplate2LevelTypeEnum {
  General = 1, // 普通  General     （第1个位置）
  Silver = 2, // 白银  Silver   （第1、2个位置）
  Gold = 3, // 黄金  Golden    （第1、2、3个位置）
  Platinum = 4, // 铂金  Platinum  （第1、2、3个位置）
  Diamond = 5, // 白钻  Diamond   （第1、2、3个位置）
  YellowDiamond = 6, // 黄钻  Yellow Diamond    （第2、3个位置）
  BlackDiamond = 7, // 黑钻  Black Diamond （第3个位置）
}

/**
 * 大转盘奖品
 */
export interface TurntablePrize extends Prize {
  prizeId: number; // 奖品ID
  prizeCount: number; // 奖品预计数量
  hitCount: number; // 当前活动的中奖人数（新增、更新为0，只有编辑显示用）
  issuedCount: number; // 当前活动的已发放数量（新增、更新为0，只有编辑显示用）
  prizeCodeFiltered: Observable<Prize[]>; // 奖品代码、券码
}

/**
 * 通用活动 - 第一步多语系参数
 */
export interface TurntableCreate1Lang extends BaseInterface {
  languageCode: string; // 语言Code
  name: string; // 名称
  subName: string; // 子名称
  slogan: string; // 宣传语
  content: string; // 规则简介内容
}

/**
 * 通用活动 - 第一步参数
 */
export interface ActivityCreateStep1 extends BaseInterface {
  id: string; // 新增时，一定是0
  type: ActivityTypeEnum; // 活动类型
  isOpenCoupon?: boolean; // 是否开启券码
  startTime?: number; // 开始时间
  endTime?: number; // 结束时间
  infoList: TurntableCreate1Lang[]; // 详情列表
  tenantId: number; // 商户Id
}

/**
 * 通用活动 - 第二步参数 - 获取上级信息请求参数
 */
export interface ActivityCreateStep2ParentInfoParams {
  current: number;
  size: number;
  tenantId: number; // 商户id
  uid?: string; // 用户id模糊查询
  userType: number; // 用户类型(2=推荐上级/3=代理)
}

/**
 * 通用活动 - 第二步参数 - 获取上级信息返回
 */
export interface ActivityCreateStep2ParentInfo {
  superId: string; // 上级id
  userType: number; // 用户类型(2=推荐上级/3=代理)
}

/**
 * 通用活动 - 第二步 活动资格配置信息 - 渠道
 */
export enum ActivityStep2Channel {
  AllChannel = 'all', // 全部渠道
  InviteFriend = '0', // 推荐好友
  AffiliateChannel = '1', // 联盟渠道
  DesignatedChannel = '2', // 指定渠道
}

/**
 * 通用活动 - 第二步 活动资格配置信息 - 渠道(新)
 */
export enum ActivityStep2ChannelType {
  All = 'all', // 不指定渠道（所有）
  Direct = '0', // 直客
  Proxy = '1', // 代理用户
  Refer = '2', // 推荐好友
  Specify = '3', // 指定用户
}

/**
 * 通用活动 - 第二步 活动资格配置信息 - 渠道
 */
export enum ActivityStep2KYC {
  All = 'all', // 全部
  NotCertified = '-1', // 未认证
  BasicCertification = '0', // 基础认证
  IntermediateCertification = '1', // 中级认证
  AdvancedCertification = '2', // 高级认证
}

/**
 * 通用活动 - 第二步 是否为活跃用户
 * 0-不限 1-活跃 2-不活跃
 */
export enum ActivityStep2ActiveUser {
  NoLimit = 0, // 不限
  Active = 1, // 活跃
  NoActive = 2, // 不活跃
}

/**
 * 通用活动 - 第二步 存款类型
 */
export enum ActivityStep2DepositType {
  // 0-未存款 1-距离上次存款 2-范围时间内存款 3-周期时间内依托于第一步周期 4-存款周期前一天 5-存款周期当天
  Undeposited = 0, // 未存款
  LastDepositDay = 1, // 距离上次存款
  RangeDeposit = 2, // 范围时间内存款
  periodicTime = 3, // 周期时间内依托于第一步周期
  PreviousDay = 4, // 前一天存款
  OfTheDay = 5, // 当天存款
}

/**
 * 通用活动 - 第二步 是否勾选
 */
export enum ActivityStep2IsCheckEnum {
  true = 'yes', // 是
  false = 'no', // 否 除了yes都是否
}

/**
 * 通用活动 - 第二步 交易条件
 *
 * 交易状况类型 0-未交易 1-距上次交易 2-笔数
 */
export enum ActivityStep2TransactionConditionEnum {
  NotBet = 0, // 未交易
  BetLast = 1, // 距上次交易
  BetCount = 2, // 交易笔数
  // TotalAmountUSDT = '3', // 累计金额 （暂时不用，共用2笔数类型。接口没有这个后续大可能会加上）
}

/**
 * 通用活动 - 第二步 交易时间 ！！！自定的类型
 */
export enum ActivityStep2TransactionTime {
  all = 'all', // 全部时间
  SpecifiedTime = 0, // 指定时间
  ThisPeriod = 1, // 本周期

  // 自定义
  BetLast = 'BetLast', // 距离上次交易多少天
}

/**
 * 活动资格流程通用 - 第一步参数
 */
export interface ActivityQualificationsStep1 {
  id?: string; // 记录唯一 ID 首次新增请无视,回上一步修改一定要填
  tenantId?: number; // 商户 ID
  langConfig?: string[]; // 多语言配置  zh-cn...
  langSwitch?: number; // 多语言切换 语言资格开关 0=停用 1=启用
  tmpCode?: string; // 活动代码 ActivityCode
  tmpStartTime?: string; // 模板开始执行时间
  tmpEndTime?: string; // 模板结束执行时间
  tmpName?: string; // 活动名称(非多语言)
  tmpType?: ActivityQualificationsType; // 活动类型
  triggerPeriod?: ActivityCycleEnum; // 触发周期
  periodDays?: Array<number>; // 周期具体触发时间 如果 triggerPeriod 为 周 则为 1~7 ,为月则为 1~31
}

/**
 * 通用活动 - 第一步周期详情返回
 */
export interface TurntableStep1Period {
  id: string;
  tenantId: number;
  langSwitch: number; // 多语言切换 语言资格开关 0=停用 1=启用
  tmpCode: string;
  tmpEndTime: string;
  tmpName: string;
  tmpStartTime: string;
  tmpType: string; // 这里是字符串
  triggerPeriod: ActivityCycleEnum; // 触发周期
  periodDays?: Array<number> | null; // 周期具体触发时间 如果 triggerPeriod 为 周 则为 1~7 ,为月则为 1~31
}

/**
 * 活动资格流程通用 - 第二步参数
 */
export interface ActivityQualificationsStep2Params {
  betChoose: ActivityStep2IsCheckEnum; // 交易状态块选中 yes-为勾选
  betTimeEnd: string; // betTimeType 为 0 时候不能为空,交易时间结束
  betTimeStart: string; // betTimeType 为 0 时候不能为空,交易时间开始
  betTimeType: ActivityStep2TransactionTime; // 交易时间类型 all-全部 0-范围时间
  categorys: ActivityQualificationsStep2Category[]; // 游戏类型 限制
  channelCodes: string[]; // channelType 为 2 的情况下本参数不能为空
  channelType: ActivityStep2Channel; // 渠道（废弃，接口未废弃传all）: all-全部渠道 0-推荐好友 1-联盟渠道 2-指定渠道
  channelTypes: ActivityStep2ChannelType[]; // 渠道（新）: all-所有 0-直客 1-代理用户 2-推荐好友 3-指定用户
  channelPersonal: ActivityQualificationsStep2ChannelPersonal; // 渠道（新）: 指定用户
  // 代理黑名单
  channelAgentBlack: {
    type: number; // 0-全部 1-具体uids
    uids: string[]; // uid合集
  };
  // 代理白名单
  channelAgentWhite: {
    type: number; // 0-全部 1-具体uids
    uids: string[]; // uid合集
  };
  // 推荐好友黑名单
  channelRecommenderBlack: {
    type: number; // 0-全部 1-具体uids
    uids: string[]; // uid合集
  };
  channelRecommenderWhite: {
    type: number; // 0-全部 1-具体uids
    uids: string[]; // uid合集
  };

  countryType: number; // 1=kyc国家 2=账号注册的国家
  countrys: string[]; // 用户KYC国家 : all-不限 严重提醒,请用国家 三码 不支持两码
  currencys: string[]; // 币种代码 all-不限

  betType: ActivityStep2TransactionConditionEnum; // 交易状况类型 0-未交易 1-距上次交易 2-笔数
  betCount: number; // betType 为 2 必填! 交易笔数
  betSingleUsdt: number; // 交易金额 betType 为 2 时必填! 单笔最低金额
  betTotalUsdt: number; // 交易金额 betType 为 2 时必填! 累计金额
  lastBetDays: number; // betType 为 1 必填 距离上次交易 几天

  depositChoose: ActivityStep2IsCheckEnum; // 存款状态块选中 yes-为勾选
  depositEndTime: string; // depositType 为 2 必填 存款范围时间结束
  depositStartTime: string; // depositType 为 2 必填 存款范围时间开始
  depositTotalUsdt: number; // depositType 为 2 必填 存款范围时间 内总和
  lastDepositTotalUsdt: number; // depositType 为 4 必填 前一天存款 内总和
  currentDepositTotalUsdt: number; // depositType 为 5 必填 当天存款 内总和
  depositType: ActivityStep2DepositType; // 存款类型 0-未存款 1-距离上次存款 2-范围时间内存款 3-周期时间内依托于第一步周期 4-存款周期前一天 5-存款周期当天
  lastDepositDays: number; // depositType 为 1 必填 距离上次存款 几天

  id?: string;
  kycTypes: ActivityStep2KYC[]; // kyc 状态: all-全部 -1-未认证 0-初级 1-中级 2-高级
  tenantId: number; // 商户 ID
  tmpCode: string; // 活动代码
  isActiveUser: ActivityStep2ActiveUser; // 是否为活跃用户
  isNewUser: ActivityStep2IsCheckEnum; // 新用户 yes-为勾选
  createDay: number; // 新用户注册天数
  vipLevels: string[]; // 用户Vip等级: all-全部 0~9-vip0~9 10-Svip
}

/**
 * 活动资格流程通用 - 第二步渠道 - 指定用户
 */
export interface ActivityQualificationsStep2ChannelPersonal {
  inputType: number; // 0-选择会员 1-手动输入 2-上传名单
  type: number; // 0-白名单 1-黑名单
  users: ActivityQualificationsStep2ChannelPersonalUser[]; // uid合集
}

/**
 * 活动资格流程通用 - 第二步渠道 - 指定用户对象
 */
export interface ActivityQualificationsStep2ChannelPersonalUser {
  uid: string; // 用户ID
  uact: string; // 用户账号
}

/**
 * 活动资格流程通用 - 第二步游戏厂商类型
 */
export interface ActivityQualificationsStep2Category {
  code: string; // 限制 游戏大类 Code
  providers: { providerId: string }[]; // 限制 游戏厂商 Code
}

/**
 * 活动资格流程通用 - 第二步接口返回
 */
export interface ActivityQualificationsStep2 {
  id: string;
  tmpCode: string; // 活动代码
  tenantId: number; // 商户 ID
  channelType: ActivityStep2Channel; // 渠道: all-全部渠道 0-推荐好友 1-联盟渠道 2-指定渠道
  channelCodes: string[]; // channelType 为 2 的情况下本参数不能为空
  channelTypes: ActivityStep2ChannelType[]; // 渠道（新）: all-所有 0-直客 1-代理用户 2-推荐好友 3-指定用户
  channelPersonal: ActivityQualificationsStep2ChannelPersonal; // 渠道（新）: 指定用户
  // 代理黑名单
  channelAgentBlack: {
    type: number; // 0-全部 1-具体uids
    uids: string[]; // uid合集
  };
  // 代理白名单
  channelAgentWhite: {
    type: number; // 0-全部 1-具体uids
    uids: string[]; // uid合集
  };
  // 推荐好友黑名单
  channelRecommenderBlack: {
    type: number; // 0-全部 1-具体uids
    uids: string[]; // uid合集
  };
  channelRecommenderWhite: {
    type: number; // 0-全部 1-具体uids
    uids: string[]; // uid合集
  };

  kycTypes: string[]; // kyc 状态: all-全部 -1-未认证 0-初级 1-中级 2-高级
  vipLevels: string[]; // 用户Vip等级: all-全部 0~9-vip0~9 10-Svip
  isActiveUser: ActivityStep2ActiveUser; // 是否为活跃用户
  isNewUser: ActivityStep2IsCheckEnum; // 新用户 yes-为勾选
  createDay: number; // 新用户注册天数
  countryType: number; // 1=kyc国家 2=账号注册的国家
  countrys: string[]; // 用户KYC国家 : all-不限 严重提醒,请用国家 三码 不支持两码
  currencys: string[]; // 币种代码 all-不限
  depositChoose: ActivityStep2IsCheckEnum; // 存款状态块选中 yes-为勾选
  depositType: ActivityStep2DepositType; // 存款类型 0-未存款 1-距离上次存款 2-范围时间内存款 3-周期时间内依托于第一步周期 4-存款周期前一天 5-存款周期当天
  lastDepositDays: number; // depositType 为 1 必填 距离上次存款 几天
  depositStartTime: null | string; // depositType 为 2 必填 存款范围时间开始
  depositEndTime: null | string; // depositType 为 2 必填 存款范围时间结束
  depositTotalUsdt: null | string; // depositType 为 2 必填 存款范围时间 内总和
  lastDepositTotalUsdt: null | string; // depositType 为 4 必填 前一天存款 内总和
  currentDepositTotalUsdt: null | string; // depositType 为 5 必填 当天存款 内总和
  betChoose: ActivityStep2IsCheckEnum; // 交易状态块选中 yes-为勾选
  categorys: ActivityQualificationsStep2Category[]; // 游戏类型 限制
  betTimeType: ActivityStep2TransactionTime; // 交易时间类型 all-全部 0-范围时间
  betTimeStart: null | string; // betTimeType 为 0 时候不能为空,交易时间开始
  betTimeEnd: null | string; // betTimeType 为 0 时候不能为空,交易时间结束
  betType: ActivityStep2TransactionConditionEnum; // 交易状况类型 0-未交易 1-距上次交易 2-笔数
  lastBetDays: number; // betType 为 1 必填 距离上次交易 几天
  betCount: number; // betType 为 2 必填! 交易笔数
  betSingleUsdt: number; // 交易金额 betType 为 2 时必填! 单笔最低金额
  betTotalUsdt: number; // 交易金额 betType 为 2 时必填! 累计金额
}

/**
 * 通用活动 - 第一步多语系返回
 */
export interface ActivityStep1LangResponse {
  activityId: number; // goGaming活动ID
  content: string; // 规则简介内容
  couponCode: string; // 活动code、活动券码关联java服务的唯一8位code
  id: number;
  languageCode: string; // 语言Code
  name: string; // 名称
  slogan: string; // 宣传语
  subName: string; // 子名称
}

/**
 * 通用活动 - 列表类目
 */
export interface TurntableListItem {
  activityId: number; // 活动ID
  activityCode: string; // 活动code
  drawTimes: number; // 抽奖次数
  endTime: number;
  hitCount: number; // 中奖次数
  id: number;
  activityName: string | null;
  startTime: number;
  status: number;
  inAudit: boolean; // 是否审核中
  infoList: ActivityStep1LangResponse[]; // 详情列表
}

/**
 * 转盘 - 获取条件参数
 */
export enum TurntableCondition {
  deposit = 1, // 存款
  validTransaction = 2, // 有效交易
  time = 3, // 时间
}

/**
 * 转盘 - 交易范围（当 “获取条件” 的类型为 “有效交易 = TurntableCondition.validTransaction” 时）
 */
export interface TurntableConditionTransactionRange {
  categoryId: string; // 游戏分类(只提供ID，名称由前端处理)
  providerIds?: string[]; // 游戏商代码(只提供ID，名称由前端处理)
}

/**
 * 转盘 - 转盘场次设定
 */
export interface TurntableGame {
  id: number; // 唯一识别码
  snNo: number; // 转盘格子的序号（1~12）
  prizeId: number; // 奖品ID
  prizeCode?: string; // 奖品代码 仅做展示所用，提交时不需要
  weight: number; // 每个奖品对应的中奖概率(乘以100后的数值)
  icon?: string; // 奖品图片
}

/**
 * 转盘 - 第三步 奖品类型
 */
export interface PrizeTypeItem {
  prizeTypeName: string;
  prizeTypeValue: number;
}

/**
 * 转盘 - 第三步参数
 */
export interface TurntableCreate3 {
  id: number; // 更新传入的活动ID
  merchantId: string; // 商户ID 只能字符串
  activityCode: string; // 活动代码
  startTime: number; // 开始时间
  endTime: number; // 结束时间
  conditionType: TurntableCondition; // 获取条件：1:存款，2：有效交易，3：时间
  countryCode: string[]; // 国家代码
  perDeposit: number; // 每次存款金额
  transStartTime: number; // 交易开始时间戳（毫秒）
  transEndTime: number; // 交易截止时间戳（毫秒）
  perTransCount: number; // 每交易N笔
  transMin: number; // 单笔最低金额
  transAmount: number; // 每有效交易金额
  interval: number; // 每N小时
  currency: string; // 币别
  scope?: TurntableConditionTransactionRange[]; // 交易范围（当“获取条件”的类型为“有效交易”时）
  drawTimes: number; // 抽奖次数
  // tipsSetting: TurntableActivityTips; // 活动提示
  prizesSetting?: TurntablePrizes[]; // 活动奖品
  turntableSetting: TurntableGame[]; // 转盘场次设定
  level: TurntableTemplate2LevelTypeEnum;
  templateType: TurntableTemplateTypeEnum; // 模板类型
}

/**
 * 转盘 - 更新第三步活动时间参数
 */
export interface TurntableUpdateStep3TimeParams {
  merchantId: string; // 选择的商户ID
  activityCode: string; // 活动代码（基础设置时生成，并在新增活动时传入）
  startTime: number; // 开始时间
  endTime: number; // 结束时间
}

/**
 * 转盘 - 活动奖品设置
 */
export interface TurntablePrizes {
  id?: number; // 唯一识别码
  prizeId?: number;
  prizeCode?: string; // 奖品代码
  prizeName?: string; // 奖品名称
  prizeType?: number; // 奖品类型，1:抵用金，2:现金券，3:后发现金券，4:实物奖励，5:装备，6:free spin
  prizeCount?: number; // 发放总量（当前活动）
  issuedCount?: number; // 已发放数量（当前活动）
  hitCount?: number; // 中奖人数
  icon?: string; // 奖品图标
}

/**
 * 大转盘 - 抽奖记录请求参数
 */
export interface LuckRecordParams {
  activityId: number; // 活动ID
  merchantId?: number; // 商户ID
  status?: number; // 参与状态，0:全部，1:中奖，2:未中奖
  uid?: string; // 用户ID
  prizeId?: number; // 奖品ID
  prizeType?: number; // 奖品类型ID
  lang?: string; // 语言
  pageIndex?: number; // 页码
  pageSize?: number; // 每页条数
  startTime?: number; // 开始时间
  endTime?: number; // 结束时间
  sort?: string; // 排序字段
  isAsc?: boolean; // 是否升序
}

/**
 * 大转盘 - 抽奖记录
 */
export interface TurntableRecord {
  id: number;
  uid: string; // 抽奖用户ID
  drawTime: number; // 抽奖时间
  prizeId: number; // 奖品ID
  prizeType: number; // 奖品类型
  prizeName: string; // 奖品名称
  sendAmount: number; // 发放金额
  sendCurrency: string; // 发放币别
}

/**
 * 大转盘 - 抽奖记录 - 表格
 */
export interface TurntableRecordTable extends TurntableRecord {
  prizeTypeName?: string; // 奖品类型名称
}

/**
 * 大转盘 - 抽奖记录 - 奖品
 */
export interface TurntableRecordPrize {
  prizeId: number;
  prizeName: string;
}

/**
 * 新模板状态变更 - 存款送/新人
 */
export interface ActivityQualificationsParams {
  tmpCodes: string[];
  tmpConfigState: number;
}

/**
 * 获取奖品列表请求参数
 */
export interface GetPrizeListParams {
  merchantId: string;
  prizeType?: number;
  amountType?: number;
  lang?: string;
  pageIndex?: number;
  prizeName?: string;
  prizeCode?: string;
  pageSize?: number;
}

/**
 * 奖品发放记录列表类目请求参数
 */
export interface GetPrizeSendRecordListParams {
  TenantId: number; // 商户ID
  Name?: string; // 活动名称
  StartTime?: number; // 开始时间
  EndTime?: number; // 结束时间
  PageIndex?: number; // 页码
  PageSize?: number; // 每页条数
  SendStatus?: number; // 发放状态 派发状态，-1: 派发失败, 0: 未派发, 1: 系统已派发, 2: 手动已派发
  prizeId?: number; // 奖品ID
  UId?: string; // 用户ID
}

/**
 * 奖品发放记录列表类目
 */
export interface PrizeSendRecord {
  activityCode: string; // 活动代码
  activityId: number; // 活动ID
  activityName: string; // 活动名称
  amount: number; // 金额
  amountType: number; // 金额类型
  bonusOrderId: string; // 订单号
  cardStatus: string; // 使用状态
  currency: string; // 币别
  expirationDays: number; // 有效天数
  id: number; // 发放记录ID
  infoList: unknown[] | null; // 奖品信息列表
  prizeId: number; // 奖品ID
  prizeName: string; // 奖品名称
  prizeType: PrizeType; // 奖品类型
  rate: number; // 比例
  sendStatus: number; // 发放状态 -1: 派发失败, 0: 未派发, 1: 系统已派发, 2: 手动已派发
  sendTime: number; // 发放时间
  sendType: number; // 发放类型 奖品发放方式(1：需要领取,2：直接发放)
  times: number; // 发放次数
  freeSpinTimes: number; // freespin - 旋转次数
  uid: string; // 用户ID
}

/**
 * 红利活动 - 领取名单列表类目请求参数
 */
export interface GetBonusReleaseRecordListParams {
  tenantId: number | string; // 商户ID
  tmpId: string; // 模板ID
  uid?: string;
  releaseType?: number; // 奖品类型
  createTimeStart?: string | undefined; // 开始时间
  createTimeEnd?: string | undefined; // 结束时间
  pageIndex?: number; // 页码
  pageSize?: number; // 每页条数
}

/**
 * 红利活动 - 领取名单列表类目
 */
export interface BonusReleaseRecordItem {
  createBy: string;
  createTime: string;
  expiryTime: string;
  money: number;
  moneyType: string;
  moneyUsdt: number;
  newusePrizeCode: string;
  orderNum: number;
  prizeDetail: PrizeDetail;
  receivedTime: null;
  releaseCode: string;
  releaseStatus: number;
  releaseType: number;
  tenantId: number;
  tmpCode: string;
  tmpId: string;
  tmpName: string;
  tmpType: string;
  uid: string;
  vipLevel: number;
  vipSignInDetail: vipSignInDetail;
  activityName: string;
  activityId: number;
  infoList: ActivityLangItem[];
}

/**
 * 红利活动 - 领取名单列表类目:奖品详情
 */
export interface PrizeDetail {
  amount: number;
  amountType: number;
  categories: string;
  currency: string;
  expirationDays: number;
  expirationEndTime: number;
  expirationStartTime: number;
  id: number;
  isRisk: boolean;
  maxSingleOrder: number;
  maxSingleOrderRate: number;
  merchantId: string;
  picture: string;
  prizeName: PrizeLangItem[];
  prizeType: number;
  rate: number;
  rateLimit: number;
  sendType: number;
  freeSpinTimes: number;
  times: number;
  withdrawFlowMultiple: number;
}

/**
 * 红利活动 - 领取名单列表类目:奖品多语言
 */
export interface PrizeLangItem {
  id: number;
  lang: string;
  prizeFullName: string;
  prizeShortName: string;
}

/**
 * 红利活动 - 领取名单列表类目:活动多语言
 */
export interface ActivityLangItem {
  id: number;
  activityId: number;
  languageCode: string;
  name: string;
  subName: string;
  slogan: string;
  content: string;
  couponCode: string;
}

/**
 * 红利活动 - 领取名单列表类目:签到活动详情
 */
export interface vipSignInDetail {
  signInType: number;
  signInNum: number;
  signInContinueNum: number;
  signInCycle: number;
  signInCycleIndex: number;
  signInCycleNum: number;
}

/**
 * 非粘性奖金领取名单请求参数
 */
export interface NonStickyPrizeSendDetailParams {
  TenantId: number; // 商户ID
  Name?: string; // 活动名称
  StartTime?: number; // 开始时间
  EndTime?: number; // 结束时间
  PageIndex?: number; // 页码
  PageSize?: number; // 每页条数
  UId?: string; // 用户ID
  PrizeId?: string; // 奖品ID
  TmpCode?: string; // 活动code
}
export interface NonStickySendDetaiItem {
  list: NonStickySendDetaiRecord[];
  total: number;
  totalLostAmount: number; // 总损失金额
  totalDepositAmount: number; // 总存款金额
  exchangeQuantity: number; //兑换数量
}

/**
 * 非粘性奖金领取名单列表类目
 */
export interface NonStickySendDetaiRecord {
  activityName: string; // 活动名称
  amount: number; // 金额
  beginTime: number; // 开始时间
  betCount: string; // 投注次数/要求次数
  betProgress: number; // 投注进度
  currency: string; // 货币
  currentBetTurnover: number; // 当前投注流水
  depositAmount: number; // 存款金额
  depositCurrency: string; // 存款货币
  durationDays: number; // 持续天数
  endTime: number; // 结束时间
  isActivated: boolean; // 是否已激活
  lostAmount: number; // 输掉金额
  prizeName: string; // 奖品名称
  prizeTypeDesc: string; // 奖品类型描述
  sendTime: number; // 发送时间
  statusDesc: string; // 状态描述
  targetBetTurnover: number; // 目标投注流水
  uid: string; // 用户ID
}

/**
 * 通用活动列表 - 请求参数
 */
export interface ActivityListParams extends PageIndex {
  tenantId: number | string; // 商户ID
  tmpType: ActivityQualificationsType; // 活动类型
  activityName?: string; // 活动名称
  tmpEndTimeStart?: string; // 活动结束时间开始
  tmpEndTimeEnd?: string; // 活动结束时间结束
  tmpState?: number; // 模版状态
}

/**
 * 通用活动列表 - 类目
 */
export interface ActivityListItem {
  configState: number; // 不同活动状态不一致 // 模板状态 0=停用 1=启用 2=过期 -1=启动审核中 -2=停止审核中
  tenantId: number; // 商户Id
  tmpCode: string; // 活动 code
  tmpEndTime: string; // 活动结束时间
  tmpId: string; // tmpId
  tmpSendNum: number; // 模板发送次数
  tmpSendUidNum: number; // 模板发送人数
  tmpStartTime: string; // 模板开始执行时间
  tmpType: ActivityQualificationsType; // newuser-新人模板 deposit-首存送 guess-竞猜 spin-轮盘
  triggerOrder: number; // 触发排序
  activityName: string; // 活动名称
  activityId: number; // 活动Id
  infoList: ActivityStep1LangResponse[]; // 活动信息多语系
}

/**
 * 新竞赛 - 活动列表类目
 */
export interface NewContestListItem {
  activityId: number;
  activityName: string;
  configState: number;
  ggr: number;
  infoList: ActivityStep1LangResponse[];
  provider: string;
  tenantId: number;
  tmpCode: string;
  tmpEndTime: string;
  tmpId: null | string;
  tmpJoinUidNum: number;
  tmpName: string;
  tmpStartTime: string;
  nowTime: string;
}

/**
 * 新竞赛 - 活动状态类型
 */
export enum NewContestStatusEnum {
  StopReviewing = -2, // 停止审核中
  StarReviewing = -1, // 启动审核中
  Draft = 0, // 草稿
  Expired = 2, // 已过期
  ManualStop = 3, // 手动结束
  ToBeStarted = 10, // 待开始
  Processing = 11, // 进行中
}

/**
 * 存款 - 第三步奖品参数
 */
export interface DepositStep3Prize {
  minDepositUsdt: number; // 最低存款Usdt
  nonStickyShow: boolean; // 非粘性奖金是否展示 [存款劵码活动没有此参数]
  prizeId: string; // 奖品 ID
}

/**
 * 存款券码 - 第三步奖品参数
 */
export interface DepositCouponStep3Prize {
  minDepositUsdt: number; // 最低存款Usdt
  prizeId: string; // 奖品 ID
}

/**
 * 存款 - 第三步奖品列表参数
 */
export interface DepositStep3PrizeItem<T> {
  minPrizes: T[];
  orderNum: number; // 次数 只能是 1,2,3,4,5
}

/**
 * 存款 - 第三步参数
 */
export interface DepositStep3Params<T> {
  number: number; // 奖品次数 总共几次
  prizeItems: DepositStep3PrizeItem<T>[];
  tenantId: number; // 商户ID
  tmpCode: string; // 活动code
}

/**
 * 存款券码 - 第三步自定义体
 */
export type DepositCouponStep3Custom = DepositStep3PrizeItem<DepositCouponStep3Prize & Partial<Prize>>;

/**
 * 存款券码 - 第三步响应体
 */
export interface DepositCouponStep3Response extends DepositStep3Params<DepositCouponStep3Prize> {
  changeTmpCode?: string; // 活动code
}

/**
 * 更新劵码存款Code
 */
export interface UpdateCouponCodeParams {
  activityId: number;
  tenantId: number;
  couponCode: string;
}

/*****************************************************************************
 *                                签到活动
 ****************************************************************************/
/**
 * 签到活动 - 第三步奖品列表参数
 */
export interface VipSignInStep3PrizeItem {
  prizeId: string | number; // 奖品ID
}

/**
 * 签到活动 - 第三步参数
 */
export interface VipSignInStep3Params {
  signInType: number; // 签到类型 1=注册 2=登录
  prizeItems: VipSignInStep3PrizeItem[];
  tenantId: number; // 商户ID
  tmpCode: string; // 活动code
}

/**
 * 签到活动 - 第三步响应体
 */
export type VipSignInStep3Response = VipSignInStep3Params;

/*****************************************************************************
 *                                VIP专属活动
 ****************************************************************************/
/**
 * VIP专属活动 - 审核列表类目
 */
export interface ExclusiveVipReviewItem {
  id: number;
  tenantId: number;
  tmpId: string;
  tmpCode: string;
  tmpName: string;
  releaseStatus: number;
  releaseType: number;
  uid: string;
  vipLevel: number;
  tmpType: string;
  prizeDetail: PrizeDetail;
  createBy: string;
  createTime: string;
  updateBy: string | null;
  updateTime: string | null;
  money: number;
  moneyType: string;
  moneyUsdt: number;
  checked?: boolean | null;
}
