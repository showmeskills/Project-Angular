import { BaseInterface } from './base.interface';

/**
 * 游戏配置
 */
export interface GameConfiguration extends BaseInterface {
  vendor: number | undefined; // 厂商
  id: number | undefined; // 游戏id
  language: GameLanguage[]; // 游戏信息
  label: any[]; // 游戏标签
  advantage: string; // 庄家优势
  sort: number; // 显示顺序
  state: string; // 状态
  backwater: boolean; // 参与反水
  recommend: boolean; // 首页推荐
  hotRecommend: boolean; //热门推荐
  isTry: boolean; // 试玩模式
}

/**
 * 游戏语言配置
 */
export interface GameLanguage extends BaseInterface {
  lang: string;
  name: string;
  desc: string;
  imgWeb?: string;
  imgH5?: string;
  imgApp?: string;
}

/**
 * 新增游戏参数
 */
export interface GameInfo {
  lanageCode: string;
  gameName: string;
  gameDesc: string;
  webLogo: string;
  h5Logo?: string;
  appLogo: string;
}

/**
 * 新增游戏参数
 */
export interface GameParams extends BaseInterface {
  providerId: string; // 厂商ID
  gameId: string; // 游戏代码
  bankerAdvantage?: number; // 庄家优势
  status: string; // 状态
  sort: number; // 显示顺序
  isRecomment: true; // 是否推荐
  isReBate: true; // 是否反水
  isTry: true; // 试玩模式
  gameInfos: GameInfo[]; // 游戏信息
  gameLabels: {
    code: string;
    description: string;
    isSelect: true;
  }[];
}

/**
 * 游戏分类
 */
export enum GameCategoryEnum {
  SportsBook = 1, // 体育
  Esports = 2, // 电子竞技
  Lottery = 3, // 彩票
  LiveCasino = 4, // 真人娱乐场
  SlotGame = 5, // 电子游戏 >老虎机
  Chess = 6, // 棋牌
}

export type GameCategory = keyof typeof GameCategoryEnum;

/**
 * 游戏厂商状态
 */
export const GameProviderStatusObjEnum = {
  Maintenance: 'Maintenance', // 维护
  Online: 'Online', // 在线
  Offline: 'Offline', // 离线/下架
  None: 'None', // 无
} as const;

export type GameProviderStatusEnum = keyof typeof GameProviderStatusObjEnum;

/**
 * 禁用 - 游戏交易厂商请求参数
 */
export interface GameProviderGroupParams extends BaseInterface {
  tenantId: string | number;
  type?: GameCategory;
  isTransfer?: boolean;
  gameStatue?: GameProviderStatusEnum;
}

/**
 * 更新 - 第三方游戏配置参数
 */
export interface GameTurnoverParams extends BaseInterface {
  tenantId: string | number;
  gameTurnoverInfos: gameTurnoverInfos[];
}
export interface gameTurnoverInfos extends BaseInterface {
  gameType: string;
  isTurnover: boolean;
  turnoverPercentage: number;
}
