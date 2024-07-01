import { BaseInterface } from './base.interface';

/** 红利活动 */
export interface BonusList {
  ctivityRules?: string | null;
  activityType: string;
  activityTypeName: string[];
  bonusActivitiesNo: string;
  bonusActivityName: string;
  bonusFixedUsdt: number;
  bonusMaxUsdt: number;
  index: number;
  isActive: boolean;
  labels: string[];
  /** 0:不指定 1:固定金額 2:固定比例 */
  prizeAmountType: number;
  /**奖品类型，1:现金券,2:抵用金,3:后发现金券,4:实物,5:装备,6:Free Spin,7:SVIP体验券，99:未中奖 */
  prizeType: number;
  projectedCurrency: string;
  projectedIncome: number;
  projectedOrdNum: number;
  projectedTotalNum: number;
  rateVos: Array<{ minDepositUsdt: number; rate: number }>;
  releaseCardTypeCode: string;
  returnPercentage: number;
  grantTypeName: string;
  /** 免费旋转次数 */
  freeSpinTimes?: number | null;
}

/** 非激活参数 */
export interface NoneInActivatedCards {
  casinoBonusList: Array<InactiveCardsAttri>;
  liveCasinoBonusList: Array<InactiveCardsAttri>;
}

export interface InactiveCardsAttri extends NoneActivatedAttri {
  isDeposit: boolean;
  minimumDeposit: number;
  /** 充值专用 CashBack 比率 */
  rate: number;
}

/** 激活非粘性 */
export interface NoneActivated {
  [key: string]: NoneActivatedAttri | null;
}

/** 卡券属性 */
export interface NoneActivatedAttri {
  code: string;
  category: string;
  currency: string;
  name: string;
  targetBetTurnover: number;
  currentBetTurnover: number;
  betMultiple: number;
  maxBetPerSpin: number;
  expires: number;
  /** 激活卡券余额, 当余额 小于等于0 时候，无法操作激活卡券 */
  // 若isFreeSpin == true 时，balance 为代表旋转（获得）奖金
  balance: number;
  /** 卡券金额 */
  // 若isFreeSpin == true amount 为代表旋转价值
  amount: number;
  /** 激活后 多天内过期 0 未永久 */
  durationDaysAfterActivation: number;
  /** 卡券 图片类型  Unknown:0, //未知 Turntable:1, //大转盘  NewUser:2, //新人模板Deposit:3, //首存送 Guess:4, //竞猜*/
  typeCode: string;
  isDeposit: boolean;
  /** 目标次数 */
  targetBetNum: number;
  /** 当前次数 */
  currentBetNum: number;
  /** 自定属性 */
  showIntro: boolean;
  isTargetBetDone: boolean;
  processed: number | string;
  leftToWallet: number;
  loading: boolean;
  submitLoading: boolean;
  intro: string;
  calc: string;
  /** 当前次数和剩余次数 */
  rates: string;
  isLocked: boolean;
  /** 进度框的位置 */
  isLeft: string;
  /** 非粘性 红利 活动编号 */
  tmpCode: string;
  /** 当前非粘性 是否符合 kyc */
  countryCheck: boolean;
  /** free spin 的图片 */
  freeSpinImage?: string;
  /**是否free spin */
  isFreeSpin: boolean;
  /** 厂商id */
  providerCatId?: string;
  /** 游戏id */
  gameId?: string;
  /** 游戏名称 */
  gameName?: string;
  /** 旋转总次数 */
  maxSpinNum?: number;
  /** 已旋转次数 */
  currentSpinNum?: number;
}

/** 非粘性总览 */
export interface NoneStickyOverview {
  cashableBonus: number;
  cashableBonusInfos: Array<{
    amount: number;
    currency: string;
  }>;
  lockedBonus: number;
  casinoBonus: number;
  liveCasinoBonus: number;
}

/** ts 组件接口类型 */
export interface OverviewData {
  [key: string]: {
    text: string;
    amount: number;
    currency: string;
    cashableBonusInfos?: Array<{
      amount: number;
      currency: string;
    }>;
    showToolTips?: boolean;
  };
}

/** 优惠券查询记录接口返回 */
export interface IExchangeInfo extends BaseInterface {
  total: number;
  list: Array<ExchangeCard>;
}

/** 兑换券 */
export interface ExchangeCard {
  exchangeCode: string;
  name: string;
  createTime: number;
}

/**
 * 卡券类型 常量
 */
export enum GrandType {
  Cash = 'Cash',
  SVIP = 'SVIP',
  Coupon = 'Coupon',
}

/** 活动列表  */
export interface BonusInfo {
  bonusMoney: number;
  bonusCurrency: string;
  bonusUsdtMoney: string;
  rankMoney: number;
  rankNumber: number;
  uid: string;
  avatar: string;
  userName: string;
}
/** 当前所有排名 */
export interface Rank extends BaseInterface {
  total: 0;
  bonusInfo: Array<BonusInfo>;
  activitiesNo: string;
}

/** 竞赛活动列表和活动名称 */
export interface ContestActivities extends BaseInterface {
  title: ContestActivitiesItem[];
}

/** 单个竞赛活动 */
export interface ContestActivitiesItem extends BaseInterface {
  title: string;
  endTime: number | string;
  nowTime: number;
  activitiesNo: string;
  period: string;
  text: string;
  icon: string;
  /** 0-有效流水  10-大赢家(总输赢) 11-大赢家(单笔最大盈利)  2-运气最好 */
  executeType: number;
}

/** 每日竞赛 表格头部 */
export interface ContestTableRow extends BaseInterface {
  executeType: number;
  titles: Array<Titles>;
}

/** 活动title */

export interface Titles extends BaseInterface {
  icon: string | null;
  text: string;
  toolTips?: string | null;
}

/** 我的排名 */
export interface MyRank extends BaseInterface {
  activitiesNo: string;
  endTime: number;
  nowTime: number;
  remainingTime: number;
  kycCheck: boolean;
  title: string;
  period: string;
  isClose: boolean;
  bonusInfo: {
    bonusCurrency: string;
    bonusMoney?: number;
    bonusUsdtMoney?: string;
    rankMoney: number;
    rankNumber: number | string;
    uid?: string;
  };
}

/** 活动列表 */
export interface ActivityList extends BaseInterface {
  list: Array<{
    labelCode: string;
    labelName: string;
    list: Array<RespActivityDetail>;
  }>;
}

export interface ActivityNavList extends BaseInterface {
  labelCode: string;
  labelName: string;
}

/** 活动详情返回 */
export interface RespActivityDetail extends BaseInterface {
  activeObject: string;
  activityImgUrl: string;
  bannerImgUrl: string;
  content: string;
  detailImgUrl: string;
  endTime: number;
  introduction: string;
  isEnroll: boolean;
  isJoin: boolean;
  startTime: number;
  title: string;
  sort: number;
}

/**
 * 卡券发放方式下拉列表
 */
export interface GrantTypeSelect extends BaseInterface {
  code: string;
  description: string;
}

/**
 * 钱包历史记录 红利 请求参数
 */
export interface BonusGrantParam extends BaseInterface {
  startTime: number;
  endTime: number;
  grantType: string;
  currency: string;
  pageIndex: number;
  pageSize: number;
}

/**
 * 红利历史记录返回数据
 */
export interface BonusGrantListData extends BaseInterface {
  grantTime: number;
  bonusOrderId: string;
  bonusName: string;
  currency: string;
  amount: number;
  /** grantType 为NonSticky 非粘性 */
  grantType: string;
  grantName: string;
  vipLevel: number;
  statusName: string;
  /** 非粘性 新增字段 */
  nonStickyStatus: NonStickyStatus | string;
  /** 非粘性 提现金额 */
  withdrawAmount: number;
  /** 奖品名称 */
  prizeName: string;
  /** 来源 PrizeCenter: 奖品中心，CouponCenter: 券码中心*/
  source: string;
  /** 奖品、优惠券编码 */
  temCode: string;
  prizeType: string;
  prizeTypeDesc: string;
  /** 奖金余额 */
  balance: number;
  /** 投注流水金额 */
  currentBetTurnover: number;
  /** 目标投注流水金额 */
  targetBetTurnover: number;
  /** 下注进度 */
  betProgress: number;
  betCount: string;
  /** 最后更新时间 */
  lastUpdateTime: number;
}

export type NonStickyStatus = 'Pending' | 'Activated' | 'Withdraw' | 'Expired' | 'Cancel' | 'NotWithdrawn';

export interface ActivityDetail extends BaseInterface {
  bonusActivitiesNo: string;
  equipment: string;
}

/**
 * 卡券状态返回数据
 */
export interface BonusSelect extends BaseInterface {
  code: string;
  description: string;
}

/**
 * 卡券类型返回数据
 */
export interface BonusTypeList extends BaseInterface {
  grantType: string | null;
  title: string;
  total?: number;
  typeCode: string | null;
  newTypeCode: string;
}

/**
 * 用户卡券列表返回数据
 */
export interface BonusDetail extends BaseInterface {
  total: number;
  list: BonusDetailList[];
}

export interface BonusDetailList extends BaseInterface {
  activitiesNo: string;
  activityType: string;
  amount: number | string;
  balance: number | string;
  bonusRate: number;
  cardStatus: string;
  createdTime: number;
  currency: string;
  expiredTime: number;
  grantType: GrandTypes;
  id: string;
  introduction: string;
  isAccumulate: boolean;
  labels: string[];
  maxBetAmount: number;
  maxBetRate: number;
  multiCurrency: MultiCurrency | null;
  receiveTime: number;
  title: string;
  typeCode: string;
  vipLevel: number;
  withdrawFlowMultiple: number;
  /** 用户排序后 返回对应值 未排序为0 */
  sort: number;
  /** 为 0 时 不限制 */
  minBetLimit: number;
}

/** 卡券赋予的类型 */
export type GrandTypes = 'Cash' | 'Coupon' | 'SVIP' | 'InKind' | 'Equip' | 'FreeSpin';

/** 多币种券 */
export type MultiCurrency = {
  [key in string]: string;
};

/** 获取卡券详情接口 */
export interface BonusDetailParams extends BaseInterface {
  pageIndex?: number;
  pageSize?: number;
  typeCode?: string;
  grantType?: string;
  status?: string;
  ascSort: boolean;
  /** 是否返回 用户上一次排序 */
  userSort?: boolean;
  /** 是否使用 分页 */
  isByPage?: boolean;
}

/** 抵用金 排序参数 */
export interface BonusSortParam extends BaseInterface {
  id: string;
  sort: number;
}

/**
 * 用户卡券反水返回数据
 */
export interface BackwaterData extends BaseInterface {
  total: number;
  list: BackwaterDataList[];
  totalAmount: number;
}

export interface BackwaterDataList extends BaseInterface {
  amount: number;
  createdTime: number;
  currency: string;
  orderNum: string;
  cardStatus: string;
}

export interface BackwaterListParams extends BaseInterface {
  bonusId: number;
  pageIndex: number;
  pageSize: number;
}

export interface ReceiveBackwaterParams extends BaseInterface {
  bonusId: number;
}

export interface BonusFlowParams extends BaseInterface {
  bonusId: number;
  pageIndex: number;
  pageSize: number;
}

export interface BonusCustomerApply extends BaseInterface {
  vipLevel: number;
  bonusActivitiesNo: string;
}

/** 下拉页码 */
export interface IDropDown extends BaseInterface {
  key: string;
  value: number;
}

/** 非粘卡券状态更新 */
export interface SigalNonStickyStatus {
  action: 'NonStickyStatus';
  related: string;
  status: string;
  time: number;
  data: {
    Success: boolean;
  };
}

export interface CouponCodeParams {
  // 可为 0 兼容 欧洲
  amount?: number;
  couponCode: string;
  /** 当前存款货币 币种可为空*/
  currency?: string;
}

export interface CouponCodeExchangeResult extends BonusList {
  id: number;
  minDepositUsdt: number;
}
