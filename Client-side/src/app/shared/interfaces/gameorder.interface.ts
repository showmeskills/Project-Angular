import { PaginatorState } from '../components/paginator/paginator.module';
import { BaseInterface } from './base.interface';

/**
 *  一些状态下拉列表 返回
 */
export interface StatusSelect extends BaseInterface {
  code: string;
  description: string;
}

/**
 *  查询交易记录列表参数（通用）
 */
export interface DealRecordParams extends BaseInterface {
  wagerStatus: string; // 注单状态
  betStartTime: number; //交易开始时间
  betEndTime: number; //交易结束时间
  page: number; // 起始页数
  pageSize: number; // 每页大小
}

/**
 *  最近交易记录列表参数
 */
export interface RecentorderDealRecordParams extends BaseInterface {
  page: number; // 起始页数
  pageSize: number; // 每页大小
}

/**
 * 查询体育交易记录列表返回数据
 */
export interface SportDealRecord extends BaseInterface {
  wagerNumber: string; //交易单号
  gameProvider: string; //场馆（游戏厂商）
  betAmount: number; // 交易金额
  payoutAmount: number; //输赢金额
  betTime: number; //交易时间
  status: string; //状态
  currency: string; //币种
  odds: string; //赔率
  isReserved: boolean; //是否兑现
  gameCode: string; // 游戏代码
  gameDetail: {
    sport: string; //球种 串关时为 '混合串关'
    tournamentName: string; //联赛名称 串关时为 null
    eventName: string; //赛事名称 串关时为 null
    betoptionName: string; //玩法 串关时为 null
    betContent: string; //投注内容 串关时为 null
  };
  subOrderList: {
    sport: string;
    tournamentName: string;
    eventName: string;
    betoptionName: string;
    betContent: string;
    // 以下暂没用到
    gameResult: string;
    detailOdds: number;
    gameTime: number;
    wagerNumber: string;
    gameProvider: string;
    betAmount: number;
    principal: number;
    bonus: number;
    payoutAmount: number;
    betTime: number;
    wagerStatus: string;
    status: string;
    gameCategory: string;
    gameName: string;
    rebateAmount: number;
    refundAmount: number;
    activeFlow: number;
    settleTime: string;
    isReserved: boolean;
    currency: string;
    odds: string;
  }[];
}

/**
 * 查询体育交易记录详情返回数据
 */
export interface SportDealRecordDetail extends BaseInterface {
  wagerNumber: string; //交易单号
  gameProvider: string; //场馆(游戏厂商)
  betAmount: number; //交易金额
  principal: number; //交易本金
  bonus: number; //抵用金
  payoutAmount: number; //输赢金额
  betTime: string; //交易时间
  status: string; //状态
  gameCategory: string; //游戏类型
  gameName: string; //游戏名称
  rebateAmount: number; //返水金額
  refundAmount: number; //返还金額
  activeFlow: number; //有效流水
  settleTime: string; //结算时间
  isReserved: boolean; //是否兑现
  currency: string; //币种
  odds: string; //主单赔率
  sport: string; //球種
  tournamentName: string; //聯赛名称
  eventName: string; //赛事名稱
  betoptionName: string; //玩法
  betContent: string; //投注内容
  gameResult: string; //赛果
  detailOdds: number; //子单赔率
  gameTime: string; //开赛时间
}

/**
 * 查询娱乐城交易记录列表返回数据
 */
export interface CasinoDealRecord extends BaseInterface {
  wagerNumber: string; //交易单号
  gameProvider: string; //场馆（游戏厂商）
  betAmount: number; // 交易金额
  payoutAmount: number; //输赢金额
  betTime: number; //交易时间
  status: string; //状态
  currency: string; //币种
  odds: string; //赔率
  isReserved: boolean; //是否兑现
  gameCode: string; // 游戏代码
  gameDetail: {
    gameName: string; //游戏名称
    playOption: string; //玩法
    table: string; //牌桌
  };
  /** 非粘性 */
  isNonStickyBet: boolean;
  nonStickyBetAmount: string;
}

/**
 * 查询娱乐城交易记录详情返回数据
 */
export interface CasinoDealRecordDetail extends BaseInterface {
  wagerNumber: string; //交易单号
  gameProvider: string; //场馆(游戏厂商)
  betAmount: number; //交易金额
  principal: number; //交易本金
  bonus: number; //抵用金
  payoutAmount: number; //输赢金额
  betTime: string; //交易时间
  status: string; //状态
  gameCategory: string; //游戏类型
  gameName: string; //游戏名称
  rebateAmount: number; //返水金額
  refundAmount: number; //返还金額
  activeFlow: number; //有效流水
  settleTime: string; //结算时间
  isReserved: boolean; //是否兑现
  currency: string; //币种
  odds: string; //赔率
  playOption: string; //玩法
  table: string; //牌桌
}

/**
 * 查询棋牌交易记录列表返回数据
 */
export interface ChessDealRecord extends BaseInterface {
  wagerNumber: string; //交易单号
  gameProvider: string; //场馆（游戏厂商）
  betAmount: number; // 交易金额
  payoutAmount: number; //输赢金额
  betTime: number; //交易时间
  status: string; //状态
  currency: string; //币种
  odds: string; //赔率
  isReserved: boolean; //是否兑现
  gameCode: string; // 游戏代码
  gameDetail: string; //=> 游戏名称（后端说的）
}

/**
 * 查询棋牌交易记录详情返回数据
 */
export interface ChessDealRecordDetail extends BaseInterface {
  wagerNumber: string; //交易单号
  gameProvider: string; //场馆(游戏厂商)
  betAmount: number; //交易金额
  principal: number; //交易本金
  bonus: number; //抵用金
  payoutAmount: number; //输赢金额
  betTime: string; //交易时间
  status: string; //状态
  gameCategory: string; //游戏类型
  gameName: string; //游戏名称
  rebateAmount: number; //返水金額
  refundAmount: number; //返还金額
  activeFlow: number; //有效流水
  settleTime: string; //结算时间
  isReserved: boolean; //是否兑现
  currency: string; //币种
  odds: string; //赔率
}

export interface CasinoDealRecordDetail extends ChessDealRecordDetail {
  /** 非粘性  */
  isNonStickyBet: boolean;
  nonStickyBetAmount: string;
}

/**
 * 查询彩票交易记录列表返回数据
 */
export interface LotteryDealRecord extends BaseInterface {
  wagerNumber: string; //交易单号
  gameProvider: string; //场馆（游戏厂商）
  betAmount: number; // 交易金额
  payoutAmount: number; //派彩金额
  betTime: number; //交易时间
  status: string; //状态
  currency: string; //币种
  odds: string; //赔率
  isReserved: boolean; //是否兑现
  gameCode: string; // 游戏代码
  gameDetail: {
    lotterCategory: string; //彩票分类名称
    gameName: string; //游戏名称
    roundNo: string; //期号
    playWay: string; //玩法
    betContent: string; //投注内容
  };
}

/**
 * 查询彩票交易记录详情返回数据
 */
export interface LotteryDealRecordDetail extends BaseInterface {
  wagerNumber: string; //交易单号
  gameProvider: string; //场馆(游戏厂商)
  betAmount: number; //交易金额
  principal: number; //交易本金
  bonus: number; //抵用金
  payoutAmount: number; //输赢金额
  betTime: string; //交易时间
  status: string; //状态
  gameCategory: string; //游戏类型
  gameName: string; //游戏名称
  rebateAmount: number; //返水金額
  refundAmount: number; //返还金額
  activeFlow: number; //有效流水
  settleTime: string; //结算时间
  isReserved: boolean; //是否兑现
  currency: string; //币种
  odds: string; //赔率
  lotterCategory: string; //彩票分类名称
  roundNo: string; //期号
  playWay: string; //玩法
  gameDetail: string; //交易内容
  gameResult: string; //赛果
}

/**
 * 查询最近记录详情返回数据
 */
export interface RecentTransactionsData extends BaseInterface {
  gameName: string; //游戏名称
  betTime: string; //交易时间
  odds: string; //赔率
  currency: string; //币种
  betAmount: number; //交易金额
  payoutAmount: number; //输赢金额
}

/**
 * 查询会员注单日期汇总返回数据
 */
export interface WagerDaysTotalData extends BaseInterface {
  /**注单总数 */
  count: number;
  /**下注总额 */
  betTotal: number;
  /**输赢总额 */
  payoutTotal: number;
  /**会员日期统计 */
  list: WagerDayTotalData[];
}

/**
 * 单日汇总信息
 */
export interface WagerDayTotalData extends BaseInterface {
  /**日期 */
  day: string;
  /**注单总数 */
  count: number;
  /**下注总额 */
  betTotal: number;
  /**输赢总额 */
  payoutTotal: number;

  // --------下面是为了渲染界面新增的--------

  /**是否已展开 */
  expanded: boolean;
  /**是否加载中 */
  loading: boolean;
  /**当日分页信息 */
  paginator: PaginatorState;
  /**当日显示的列表数据 */
  data: SportDealRecord[] | CasinoDealRecord[] | ChessDealRecord[] | LotteryDealRecord[];
}

/** 我的投注 */
export interface CommonRealTimeData {
  gameProviderName: string;
  gameName: string;
  dateTime: number;
  betAmount: number;
  odds: string | number | null;
  payAmount: number;
  currency: string;
  orderNum: string;
  playerName: string;
  avatar: string;
  /** logo 暂时不加 */
  appLogo?: string;
  webLogo?: string;
  h5Logo?: string;
}

/** 大赢家 */
export interface GetBigWinner extends CommonRealTimeData {
  ranking: number;
}

/** 幸运玩家 */
export interface GetLuckiestUser extends CommonRealTimeData {
  ranking: number;
}

/** 我的投注 渲染接口 */
export interface MybetData {
  titles: string[];
  isH5Titles: string[];
  data: Array<CommonRealTimeData>;
  loading: boolean;
}

/** 所有投注 渲染接口 */
export interface AllBetsData {
  titles: string[];
  isH5Titles: string[];
  data: CommonRealTimeData[];
  loading: boolean;
}

/** 风云榜 */
export interface HeroBetData {
  titles: string[];
  isH5Titles: string[];
  data: CommonRealTimeData[];
  loading: boolean;
}

/** 最幸运 */
export interface LuckiestBetsData {
  titles: string[];
  isH5Titles: string[];
  data: CommonRealTimeData[];
  loading: boolean;
}

/** 大赢家 */
export interface BigWinnerData {
  titles: string[];
  isH5Titles: string[];
  data: GetBigWinner[];
  loading: boolean;
}

/** 幸运赢家 */
export interface LuckiestUserData {
  titles: string[];
  isH5Titles: string[];
  data: GetLuckiestUser[];
  loading: boolean;
}

/** 推送排名 */
export interface WagerRank extends BaseInterface {
  time: number;
  related: string;
  action: string;
  status: string;
  data: {
    OrderNum: string;
    Uid: string;
    UserName: string;
    Avater: string;
    GameName: {
      [key: string]: string;
    };
    GameCode: string;
    BetAmount: number;
    BetTime: number;
    Odds: number;
    PayoutAmount: number;
    Status: 'Wager' | 'Settle';
    Currency: string;
    Ranking: number;
    BetUsdt: string;
    PayoutUsdt: number;
    /** 游戏类型 */
    GameCategory: string;
    /** 大赢家专用 */
    PayAmount: number;
    PayAmountUsdt: number;
    Provider: {
      /** logo 参数 先用不到 */
      app: string;
      h5: string;
      web: string;
      /** 厂商名称 */
      name: string;
    };
  };
}

/** 大赢家请求接口 */
export interface BigWinnerParams extends BaseInterface {
  gameId: string;
  /** 游戏厂商 */
  provider: string;
  /** 游戏类型 */
  catId: string;
}

/** 幸运玩家请求接口 */
export interface LuckiestUserParams extends BaseInterface, BigWinnerParams {}

/** 内页传递参数 */
export interface GameInnerRace extends BaseInterface, BigWinnerParams {}
