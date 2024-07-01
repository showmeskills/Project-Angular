import { BehaviorSubject } from 'rxjs';
import { BaseInterface } from './base.interface';
export type ProviderCategoryType = 'SportsBook' | 'Esports' | 'Lottery' | 'LiveCasino' | 'SlotGame' | 'Chess';

/**
 * 游戏币种和比例
 */
export interface CurrencyRatio extends BaseInterface {
  /**币种 */
  currency: string;
  /**比例 */
  ratio: number;
}

/**
 * 获取厂商列表 返回数据
 */
export interface ProviderInterface {
  providerCatId: string;
  providerId: string;
  providerName: string;
  dayLogo: string;
  nightLogo: string;
  status: string;
  gameCount: number;
  /**SportsBook:体育Esports:电子竞技Lottery:彩票LiveCasino:真人娱乐场SlotGame:老虎机Chess:棋牌 */
  category: string;
  currencyRatio: CurrencyRatio[];
  /**true 进入 二级页，false进入三级页（直接玩） */
  secondaryPage: boolean;
  /**是否为转账制 */
  isTransfer: boolean;
  /**排序 */
  sort: number;
  /**厂商支持国家编码，为空数组，就是不限制国家 */
  countryCode: string[];
  /**游戏打开方式 */
  gameOpenMethod: { [key: string]: 'Iframe' | 'NewWindow' };
  /** 是否支持试玩 */
  isTry?: boolean;

  /** 是否展示 在大厅页面 */
  showHome: boolean;
  currencies: string[];
}

/**
 * 根据厂商获取标签列表 返回数据
 */
export interface LabelCodeList extends BaseInterface {
  /**标签id */
  code: string;
  /**标签名字 */
  name: string;
  /**标签图标 */
  icon: string;
  /**游戏数量 */
  gameCount?: number;
}

/**
 * 获取游戏列表 返回数据
 */
export interface GameList extends BaseInterface {
  /**标签代号 */
  labelCode: string;
  /**标签名称 */
  labelName: string;
  /**标签描述 */
  description: string;
  /**标签icon */
  icon: string;
  /**标签所属游戏总数 */
  gameCout: number;
  /**游戏列表 */
  gameLists: GameListItem[];
}

/** 新游戏列表 */
export interface NewGameList extends BaseInterface {
  /**标签名称 */
  labelName: string;
  /**标签icon */
  icon: string;
  /**游戏列表 */
  gameLists: GameListItem[];
}

/**
 * 游戏搜索
 */
export interface GameSearch {
  labelInfo: {
    labelId: string;
    labelName: string;
  }[];
  gameInfo: GameListItem[];
}

/**
 * 游戏列表成员
 */
export interface GameListItem {
  /**id */
  id: number;
  /**厂商id */
  providerCatId: string;
  /**厂商id */
  // providerId: string;
  /**厂商名称 */
  providerName: string;
  /**游戏id */
  gameId: string;
  /**名称 */
  gameName: string;
  /**简介 */
  gameDesc: string;
  /**weblogo */
  webLogo: string;
  /**h5Logo */
  h5Logo: string;
  /**appLogo */
  appLogo: string;
  /**状态 */
  status: 'Maintenance' | 'Online' | 'Offline';
  /**是否可以试玩 */
  isTry: boolean;
  /**是否全屏打开 */
  isFullScreen: boolean;
  /**是否收藏 */
  isFavorite: boolean;
  /**庄家优势 */
  bankerAdvantage: number;
  /**标签 */
  gameLabels: {
    code: string;
    description: string;
  }[];
  /**币种&比率 */
  currencyRatio: CurrencyRatio[];
  /**厂商支持国家编码，为空，就是不限制国家 */
  countryCode: string[];
  /**投注级距配置 */
  betRangeSetting: ProviderSetting;
  category: string;
  providerId: string;
}

/**
 * 获取游戏类型下拉 返回数据
 */
export interface ProviderCategoryInterface extends BaseInterface {
  code: string;
  description: string;
}

/**
 * 获取游戏列表-游戏供应商分类
 */
export interface GameProviderParams {
  labelCode?: string[];
  providerCatIds: string[] | null;
  gameTypes?: string[];
  sort: string;
  pageIndex: number;
  pageSize: number;
  /**
   * 排序类型
   *  HomeSort:0, //首页排序 首页排序，或者不传sortType 默认就是这个
   *  ProviderSort:1, //厂商排序 点击厂商的时候传递
   *  LabelSort:2, //标签排序 点击标签的时候传递
   */
  sortType: SortType;
}

export type SortType = 'HomeSort' | 'ProviderSort' | 'LabelSort';

/**
 * 取得游戏链接请求参数
 */
export interface PlayGameParams {
  /** 游戏商代码 */
  providerCatId: string;
  /** 游戏代码 */
  gameId: string;
  /** 用户币别代码 */
  currencyCode: string;
  /** 游戏币别代码 */
  gameCurrencyCode: string;
  /** 试玩模式 */
  playMode: 'Normal' | 'Try';
  /** 网站类型 */
  siteType: 'PC' | 'Mobile' | 'App';
  /** 盘口类型 */
  oddsType?: string;
  /** 请求方域名 */
  domain?: string;
  /** AG盤口類型 */
  agOddType?: string;
  /** 显示日夜模式 */
  showMode: 'Day' | 'Night' | '';
}

/**
 * 取得游戏链接结果返回
 */
export interface PlayGameResponse {
  playGameUrl: string;
  token?: string;
}

/**
 * swiper组建数据
 */
export interface GameListData extends BaseInterface {
  key: GameSwiperListData;
}

/**
 * swiper组建数据
 */
export interface GameSwiperListData extends BaseInterface {
  description: string;
  gameCout: number;
  gameLists: any; //array
  icon: string;
  labelCode: string;
  labelName: string;
}

//获取所有游戏标签返回数据
export interface Gamelabel extends BaseInterface {
  /**随机数字字符串 */
  code: string;
  /**显示名称 */
  name: string;
  /**暂无用 */
  description: string;
  /**普通标签栏标签图标 */
  icon: string;
  /**标签二级页面右上角的背景图 */
  image: string;
  /**左侧菜单小图标 */
  menuIcon: string;
}

//获取游戏排序下拉返回数据
export interface GameSort extends BaseInterface {
  code: string;
  description: string;
  icon: string;
}

//gamelistbylabel请求参数
export interface GameListByLabelParams {
  labelCodes: string[];
  isRecomment?: boolean;
  gameCount?: number;
  /** 是否是 游戏大厅 - 默认为false*/
  isHall?: boolean;
  /** 0: 不区分； 1: 娱乐城； 2: 彩票 - 默认为0*/
  entryType?: number;
  // providerId?: string;
  providerCatId?: string;
}

//gamelistbylabel请求参数
export interface GameListByTypeParams extends BaseInterface {
  gameTypes: ('SportsBook' | 'Esports' | 'Lottery' | 'LiveCasino' | 'SlotGame' | 'Chess')[];
  isRecomment?: boolean;
  gameCount?: number;
}

/**
 * 获取游戏收藏列表Params
 */
export interface GameFavoriteListParams extends BaseInterface {
  pageIndex: number;
  pageSize: number;
}
/**
 * 游戏收藏列表
 */
export interface GameFavoriteList extends BaseInterface {
  total: number;
  gameIds: number[];
  gameList: GameListItem[];
}

/**
 * 场景标签
 */
export interface ScenesLabel extends BaseInterface {
  sort: number;
  labelId: string;
  name: string;
  icon: string;
  image: string;
  menuIcon: string;
}

/**小游戏大厅tabs */
export interface CasinoTabs extends BaseInterface {
  labelId: string;
  name: string;
  icon: string;
}

/**
 * 场景标签列表
 */
export interface ScenesLabelList extends BaseInterface {
  type: 'Hall' | 'Menu' | 'HallBar' | 'FrontPage';
  labelList: ScenesLabel[];
}

// /**
//  * 投注级距配置
//  */
// export interface BetRangeSetting extends BaseInterface {
//   betRangeSetting: ProviderSetting;
// }

/**
 * 投注级距配置
 */
export interface ProviderSetting {
  providerId: string;
  providerCatId: string;
  currencySettingList: {
    currency: string;
    rangeSettingList: {
      oddType: string;
      value: string;
    }[];
  }[];
}

export interface ScenesInfo {
  /**标签id */
  labelCode: string;
  /**标签名字 */
  labelName: string;
  /**描述 */
  description: string;
  /**标签栏图标 */
  icon: string;
  /**标签页装饰图 */
  image: string;
  /**左侧菜单icon */
  menuIcon: string;
  /**标签所属游戏总数 */
  gameCount: number;
  /**游戏列表 */
  gameLists: GameListItem[];
  /**是否是活动推荐 */
  isActivityRecommend: boolean;
  /**web活动推荐图 IsActivityRecommend=true时存在 */
  webRecommendImage: string;
  /**H5活动推荐图 IsActivityRecommend=true时存在 */
  h5RecommendImage: string;
  /**开启促销 */
  openPromotion: boolean;
  /**场景标签跳转方式 */
  redirectMethod: 'LabelPage' | 'AssignUrl';
  /** 指定Url RedirectMethod=AssignUrl时存在 */
  assignUrl: string;
  /** 指定Url RedirectMethod=AssignUrl时存在(APP专用，web忽略) */
  assignAppUrl: string;
  /**多行显示 */
  multiLine: number;
  config: Config;
}

/** 通过LabelId获取游戏列表返回 */
export interface ScenesGameResponse {
  labelId: number;
  gameList: GameListItem[];
}

/** 场景菜单 */
export interface SceneData {
  headerMenus: HeaderMenu[];
  leftMenus: LeftMenu[];
  navigationMenus: HeaderMenu[];
}

/** 整合菜单数据 */
export interface HomeLabelSceneData {
  homeScene: HeaderMenu | [];
  headerMenus: HeaderMenu[];
  leftMenus: LeftMenu[];
  navigationMenus: HeaderMenu[];
}

/** 跳转方式 */
export enum LabelScenesRedirectMethodEnum {
  LabelPage = 'LabelPage',
  AssignUrl = 'AssignUrl',
  DropDownList = 'DropDownList',
  AssignProvider = 'AssignProvider',
  AssignGame = 'AssignGame',
}

export interface HeaderMenu {
  key: string;
  name: string;
  icon: string;
  menuIcon: string;
  labelId: number;
  redirectMethod: string;
  config: Config;
  /** 展开菜单 */
  infoExpandList: ConcatLeftmenu[];
  /** 水平展示菜单 */
  infoHorizontalList: InfoHorizontalList[];
  /** 垂直展示菜单 */
  infoVerticallyList: InfoVerticallyList[];
}

/** 后台路由config 配置 */
export interface Config extends BaseInterface {
  assignAppUrl?: string;
  assignGameCode?: string;
  assignGameProviderId?: string;
  assignProviderId?: string;
  assignUrl?: string;
  assignDropDownListUrl?: string;
}

export interface InfoExpandList extends BaseInterface {
  pid?: number;
  labelName?: string;
  scenesType?: 'Expand' | 'Vertically' | 'Horizontal' | string;
  labelId?: number;
  config?: Config | null;
  multiLine?: number;
  redirectMethod?: 'DropDownList' | 'LabelPage' | 'AssignUrl' | 'AssignProvider' | 'AssignGame' | string;
  sort?: number;
  labelCode?: string;
  description?: string;
  icon?: string;
  image?: string;
  menuIcon?: string;
  gameCount?: number;
  isActivityRecommend?: boolean;
  webRecommendImage?: string | null;
  h5RecommendImage?: string | null;
  openPromotion?: boolean;
  providerSetting?: {
    secondaryPage: boolean;
    gameOpenMethod: string | null;
  } | null;
}

export interface ConcatLeftmenu extends InfoExpandList {
  name: string;
  ident: string;
  menuIcon: string;
  config: Config | null;
  redirectMethod: 'AssignUrl';
  num: BehaviorSubject<number>;
  scenesType: 'Expand';
  needLogined: boolean;
  hasBotLine?: boolean;
}

export interface InfoHorizontalList extends InfoExpandList {
  /**随机数字字符串 */
  code: string;
  /**显示名称 */
  name: string;
  /**暂无用 */
  description: string;
  /**普通标签栏标签图标 */
  icon: string;
  /**标签二级页面右上角的背景图 */
  image: string;
  /**左侧菜单小图标 */
  menuIcon: string;
}
export interface InfoVerticallyList extends BaseInterface, InfoExpandList {}

export interface Config extends BaseInterface {
  assignAppUrl?: string;
  assignGameCode?: string;
  assignGameProviderId?: string;
  assignProviderId?: string;
  assignUrl?: string;
  assignDropDownListUrl?: string;
}

export interface LeftMenu extends HeaderMenu {
  /** 启用收藏 */
  enableFavorites: boolean;
  /** 启用近期玩过 */
  enableRecentlyPlayed: boolean;
  /** 收藏数量 */
  favoritesNum: number;
  /** 近期玩过的数量 */
  recentlyPlayedNum: number;
  expand: boolean;
  tooltip: boolean;
}
