import { BaseInterface } from './base.interface';
import { GameListItem } from './game.interface';

/**转动后返回的中奖信息 */
export interface WheelPrize extends BaseInterface {
  /**转盘格子的序号（1~12） */
  snNo: number;
  /**奖品ID */
  prizeId: number;
  /**是否成功派奖 */
  isDistributed: boolean;
}

/**大转盘活动资讯 */
export interface WheelInfo extends BaseInterface {
  /**活动代码 */
  activityCode: string;
  /**大转盘是否可用 */
  available: boolean;
  /**活动状态 0-未开始，1-进行中，2-已停止 */
  status: number;
  /**条件类型 1-存款，2-交易, 3-时间间隔 */
  conditionType: number;
  /**币种 */
  currency: string;
  /**开始时间 */
  startTime: number;
  /**结束时间 */
  endTime: number;
  /**奖品信息 */
  prizeInfos: WheelPrizeInfo[];
  /**名称 */
  name: string;
  /**子名称 */
  subName: string;
  /**宣传语 */
  slogan: string;
  /**规则简介内容 */
  content: string;
}

/**大转盘奖品信息 */
export interface WheelPrizeInfo extends BaseInterface {
  /**奖品ID */
  prizeId: number;
  /**奖品全名 */
  prizeFullName: string;
  /**奖品简称 */
  prizeShortName: string;
  /**奖品类型，1:现金券,2:抵用金,3:后发现金券,4:实物,5:装备,6:Free Spin,7:SVIP体验券，99:未中奖 */
  prizeType: number;
  /**金额 */
  amount: number;
  /**币种 */
  currency: number;
  /**SVIP有效期，设置1天代表1内可以成为SVIP等级 （当奖品类型为抵用金、SVIP时，单位：天） */
  svipDays: number;
  /**次数（老虎机等旋转的游戏赠送的次数） （当奖品类型为Free Spin时） */
  times: number;
  /**奖品图片（相对路径） */
  picture: string;
}

/**大转盘转动次数条件 */
export interface WheelCondition extends BaseInterface {
  /**条件类型 1-存款，2-交易, 3-时间间隔 */
  wheelType: number;
  /**剩余的抽奖次数 */
  leftTimes: number;
  /**距离下次抽奖，还需上多少分，WheelType=1 */
  remainDeposit: number;
  /**达到多少金额才送，WheelType=1 */
  depositAmount: number;
  /**距离下次抽奖，还需上分多少次，WheelType=2 */
  remainTransCount: number;
  /**还要上分多少金额才送，WheelType=2 */
  remainTransAmount: number;
  /**单笔最低金额，WheelType=2 */
  transMinAmount: number;
  /**每有效交易多少次，WheelType=2 */
  perTransCount: number;
  /**达到多少金额才送，WheelType=2 */
  transAmount: number;
  /**下次给出抽奖次数的时间，还有转动次数时请略过此栏，WheelType=3，Now > RemainTime时才能转动 */
  nextTime: number;
}

/**大转盘历史记录 */
export interface WheelHistory extends BaseInterface {
  /**总数 */
  total: number;
  /**记录列表 */
  histories: WheelHistoryItem[];
}

/**大转盘历史记录详细 */
export interface WheelHistoryItem extends BaseInterface {
  /**用户Id */
  userId: string;
  /**用户名称 */
  userName: string;
  /**用户头像 */
  userAvatar: string;
  /**订单号 */
  orderId: number;
  /**奖品ID */
  prizeId: number;
  /**奖品全名 */
  prizeFullName: string;
  /**奖品简称 */
  prizeShortName: string;
  /**奖品类型，1:现金券,2:抵用金,3:后发现金券,4:实物,5:装备,6:Free Spin,7:SVIP体验券， 8: 非粘性，99:未中奖 */
  prizeType: number;
  /**金额 */
  amount: number;
  /**币种 */
  currency: string;
  /**SVIP有效期，设置1天代表1内可以成为SVIP等级 （当奖品类型为抵用金、SVIP时，单位：天） */
  svipDays: number;
  /**次数（老虎机等旋转的游戏赠送的次数） （当奖品类型为Free Spin时） */
  times: number;
  /**奖品图片（相对路径） */
  picture: string;
  /**抽奖时间 */
  drawTime: number;
  /**所属活动代码 */
  activityCode: string;
  /**所属活动名称 */
  activityName: string;
}

/**新用户可申请红利 */
export interface NewUserActivity {
  /**奖品编号 */
  prizeCode: string;
  /**活动编号 */
  tmpCode: string;
  /**模板类型 rank-竞赛模板 newuser-新人模板 deposit-首存送 guess-竞猜 spin-轮盘 */
  tmpType: string;
  /**活动名称 */
  activityName: string;
  /**奖品内容（多语言） */
  content: {
    /**奖品简称 */
    prizeName: string;
    /**标题 */
    title: string;
  };
  /**是否是默认选项 */
  isDefault: boolean;
}

/** tournament 竞赛列表 */
export interface TournamentList {
  endList: Tournaments | null;
  perList: Tournaments | null;
  startList: Tournaments | null;
}

/** 列表数据 */
export interface Tournaments {
  current: number;
  pages: number;
  records: Array<TouramentsRecords>;
  size: number;
  total: number;
}

export interface TournamentStartList extends Tournaments {
  rankList: Array<RankList>;
}

export interface TouramentsRecords {
  nowTime: number;
  tmpCode: string;
  activityName: string;
  activitySubName: string;
  activitySlogan: string;
  activityContent: string;
  activityThumbnails: string;
  gameLists: Array<GameListItem>;
  tmpEndTime: number;
  tmpStartTime: number;
  uidCanJoin: boolean;
  numberVos: Array<{
    rankNum: number;
    amount: number;
    currency: string;
    /**  CashCoupons = 1,DeductCoupons = 2,Goods = 4,Equipment = 5,WithdrawCashCoupons = 7,NoneSticky = 8,Nothing = 99, */
    prizeType: number;
    prizeFullName: string;
    prizeShortName: string;
  }>;
  /** 详情页 奖品列表 */
  rangeNumberVos: Array<{
    rankNumStart: number;
    rankNumEnd: number;
    amount: number;
    currency: string;
    /**  CashCoupons = 1,DeductCoupons = 2,Goods = 4,Equipment = 5,WithdrawCashCoupons = 7,NoneSticky = 8,Nothing = 99, */
    prizeType: number;
    prizeFullName: string;
    prizeShortName: string;
  }>;
  /** 自定义属性 */
  remainingTime: number;
  tournamentType?: string;
  totalPrizeAmount?: number;
  /** 当前排行榜状态 */
  tournamentStatus?: string;
}

/** tournament 排名数据 */
export interface TournamentRankList {
  activityName: string;
  activitySubName: string;
  activitySlogan: string;
  activityContent: string;
  activityThumbnails: string;
  gameLists: Array<GameListItem>;
  currentUserRank: RankList | null;
  nowTime: number;
  numberVos: Array<{
    rankNum: number;
    amount: number;
    currency: string;
    /**  CashCoupons = 1,DeductCoupons = 2,Goods = 4,Equipment = 5,WithdrawCashCoupons = 7,NoneSticky = 8,Nothing = 99, */
    prizeType: number;
    prizeFullName: string;
    prizeShortName: string;
  }>;
  /** 详情页 奖品列表 */
  rangeNumberVos: Array<{
    rankNumStart: number;
    rankNumEnd: number;
    amount: number;
    currency: string;
    /**  CashCoupons = 1,DeductCoupons = 2,Goods = 4,Equipment = 5,WithdrawCashCoupons = 7,NoneSticky = 8,Nothing = 99, */
    prizeType: number;
    prizeFullName: string;
    prizeShortName: string;
  }>;
  pageTable: {
    current: number;
    pages: number;
    records: Array<RankList>;
    size: 0;
    total: 0;
  };
  provider: string;
  rankType: number;
  tmpCode?: string;
  tmpEndTime: number;
  tmpStartTime: number;
  /** 自定义属性 */
  remainingTime: number;
  tournamentType?: string;
  /** 当前排行榜状态 */
  tournamentStatus?: string;
}

export interface RankList {
  prizeId: string;
  rankNumber: number;
  rankScore: number;
  tenantWinOrLost: number;
  userName: string | null;
  uidActiveFlow: number;
  uidBetMoney: number;
  uidWinOrLost: number;
  amount: number;
  currency: string;
  /**  CashCoupons = 1,DeductCoupons = 2,Goods = 4,Equipment = 5,WithdrawCashCoupons = 7,NoneSticky = 8,Nothing = 99, */
  prizeType: number;
  prizeFullName: string;
  prizeShortName: string;
  uid: string;
}

export interface SignalRLeaderBoard {
  time: number;
  related: 'Rank';
  action: 'NewRankLeaderboard';
  status: string;
  data: TournamentSignalR;
}

export interface SignalRSelfRank {
  time: number;
  related: 'Rank';
  action: 'OnNewRankSelfRank';
  status: string;
  data: TournamentSignalR;
}

export interface TournamentSignalR {
  PrizeId: string;
  IsEqualPosition: boolean;
  RankNumber: number;
  RankScore: number;
  TenantWinOrLost: number;
  Uid: string;
  UserName: string | null;
  UidActiveFlow: number;
  UidBetMoney: number;
  UidWinOrLost: number;
  Amount: number;
  Currency: string;
  PrizeType: number;
  PrizeFullName: string;
  PrizeShortName: string;
  /** 判断 当前用户名次是否有变化 / 判断 当前排行榜是否有变化*/
  IsChange: boolean;
  TmpCode: string;
}
