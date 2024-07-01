import { BaseInterface } from './base.interface';
import { Page } from './page';
import { GameLanguage, GameCategory } from 'src/app/shared/interfaces/game';
import { StatusService } from 'src/app/shared/interfaces/status';

/**
 * 厂商状态
 */
export enum ProviderStatusEnum {
  Maintenance = 0, // 维护
  Online = 1, // 上架
  Offline = 2, // 下架
  None = -1,
}

export type ProviderStatus = keyof typeof ProviderStatusEnum;

/**
 * 超级管理员 - 新增厂商
 */
export interface ProviderParamsForSuper extends BaseInterface {
  providerId: string; // 厂商id
  providerName: string; // 厂商简称
  category: string; // 游戏类别
  gameList: string; // 游戏清单
  venueFee?: number; // 场馆费
  tenantIds: number[]; // 支持商户
  legalArea: string[]; // 司法管辖
  status: string; // 状态
}

/**
 * 超级管理员 - 获取厂商列表
 */
export interface ProviderListParamsForSuper extends Page {
  id?: number; // key，用于查询指定资料
  ProviderId: string; // 厂商ID，支持模糊搜索
  ProviderName: string; // 厂商简称
  StatusOrder: string; // 状态排序  "" = 预设，0 = ASC， 1 = DESC
}

/**
 * 商户管理员 - 厂商更新参数和详情
 */
export interface ProviderParamsForMerchant extends BaseInterface {
  baseId: string; // 基础厂商id
  abbreviation: string; // 厂商简称
  isProxy: boolean;
  status: ProviderStatus;
  foundedYear: number; // 成立年份
  providerConfigDtos: ProviderProductDetail[];
}

export interface ProviderParamsLang extends BaseInterface {
  lanageCode: string; // 语言code
  providerName: string; // 厂商名称
  providerDesc: string; // 厂商描述
}

/**
 * 厂商数据
 */
export interface Provider extends BaseInterface {
  code: string; // 厂商id
  description: string; // 厂商简称
  categoryDescription: string; // 游戏描述
  categoryCode: string; // 游戏类别
}

/**
 * 商户新增厂商
 */
export interface MerchantProvider extends BaseInterface {
  providerId: number | undefined; // 厂商id
  sort?: string; // 显示顺序
  lang: GameLanguage[]; // 语种
  imgWeb?: string;
  imgH5?: string;
  imgApp?: string;
}

/**
 * 获取游戏列表参数
 */
export interface GameListParams extends Page, BaseInterface {
  Id?: number; // 用于单笔指定查询
  GameId?: string; // 游戏代码
  GameName?: string; // 游戏名称
  ProviderId?: string; // 厂商ID
  Category?: string; // 游戏类别
  GameLabel?: string; // 游戏标签
  Status?: string; // 状态
  StatusOrder?: string; // 状态排序， "" = 预设，0 = ASC， 1 = DESC
}

/**
 * 搜索厂商 - 超级管理员 / 普通管理员
 */
export interface SearchProvider {
  id?: number; //用于查询指定资料
  baseID?: string; // BaseID，支持模糊搜索
  abbreviation?: string; //厂商简称
  providerCatId?: string; // 供应商ID
  providerName?: string; // 供应商名称
  page?: number; //起始页数
  pageSize?: number; //每页笔数
  // statusOrder?: string; //状态排序  null = 预设，0 = ASC， 1 = DESC
}

/**
 * 返回数据 - 搜索厂商 - 超级管理员
 */
export interface Provider extends BaseInterface {
  checked?: boolean;
  id?: number;
  providerId?: string;
  providerName?: string;
  category?: string;
  gameCount?: number; //游戏数量
  venueFee?: number; // 场馆费
  status?: string; //状态
  gameList?: string; //??
  tenantIds?: number[];
  legalArea?: string[];
}
/**
 * 返回数据 - 搜索厂商 - 普通管理员
 */
export interface ProviderPT extends BaseInterface {
  baseId: string;
  abbreviation: string;
  gameCount: number;
  isProxy: boolean;
  status: ProviderStatus;
  details: ProviderProduct[];
}

/**
 * 厂商列表类型 - 商户管理员
 */
export interface ProviderProductList extends ProviderPT {
  checked?: boolean;
  statusLabel?: StatusService & { text: string };
}

/**
 * 厂商列表 - 厂商产品 - 商户管理员
 */
export interface ProviderProduct extends BaseInterface {
  categoryName: string;
  isEnable: boolean;
  venueFee: number;
  category: string;
  providerId: string;
  providerCatId: string;
  providerName: string;
}

/**
 * 厂商分类下拉
 */
export interface ProviderSelect {
  appLogo: string | null;
  gameList: string[]; // 游戏列表
  h5Logo: null | string;
  id: string;
  name: string; // 厂商总名称
  providerCatId: string; // 厂商分类id
  providerCategory: string; // 厂商分类
  providerNameAndId: string; // 厂商名称和id 唯一
  webLogo: string | null;
}

/**
 * 厂商管理 - 厂商商品详情 - 商户管理员
 */
export interface ProviderProductDetail {
  id: number;
  providerId: string; // 对应的厂商基础id
  category: GameCategory; // 游戏分类
  gameList: string; // 游戏列表，用分号;分隔
  freeSpinGameList: string; // 支持免费旋转，用分号;分隔
  venueFee: number; // 场馆费比例 0~1
  tenantIds: number[]; // 所支持的商户id
  showHomeTenant: null | number[]; // 首页展示的商户
  guestMode: null | number[]; // 是否支持游客模式
  legalArea: string[]; // 所支持的地区
  isEnable: boolean; // 是否启用
  webLogo: string;
  h5Logo: string;
  appLogo: string;
  sort: number | null; // 显示顺序
  providerInfoDtos: ProviderParamsLang[]; // 产品信息 多语言
  secondaryPage: boolean; // 二级页面 进入游戏: false    进入二级页面: true
  excludable: boolean; // 是否支持非粘性奖金单独排除游戏 - 支持=true，不支持=false
  countryCode: string[] | null; // 能够访问的国家地区代码
  currencyRatio: ProviderCurrencyRatio[]; // 币种比例
  gameOpenMethod: GameOpenMethod;
}

/**
 * 厂商管理 - 厂商商品详情 - 币种压缩比列
 */
export interface ProviderCurrencyRatio {
  currency: string;
  ratio: number;
}

/**游戏打开方式 */
export interface GameOpenMethod {
  h5Android: string;
  h5Ios: string;
  ionicAndroid: string;
  ionicIos: string;
  webWindow: string;
  webMac: string;
}
