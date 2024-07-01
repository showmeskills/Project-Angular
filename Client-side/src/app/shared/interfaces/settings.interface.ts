import { BaseInterface } from './base.interface';

/** 设置默认货币接口参数 */
export interface ISetDefaultCurrency extends BaseInterface {
  defaultCurrencyType: string;
}

/** 接口成功返回 赔率和视图 */
export interface UserSetting extends BaseInterface {
  /** 赔率格式 */
  oddsFormat: string;
  /** 视图格式 */
  viewFormat: 'euro' | 'asia';
  /** 默认货币 */
  defaultCurrencyType: string;
  /** 是否开启抵用券 */
  isEnableCredit: boolean;
  /** 隐身模式 */
  invisibilityMode: 'ShowUserName' | 'ShowUid' | 'Invisibility';
}

/** 语言设置  */
export interface setNoticeType extends BaseInterface {
  noticeTypeList: string[];
}

/** 设置语言 */
export interface setLangParams extends BaseInterface {
  language: string;
}

/** 偏好设置渲染接口 */
export interface MainThemeList {
  /** 偏好设置title */
  title: string;
  /** 偏好设置主题list */
  subThemeList: Array<{
    settingIcon: string;
    settingTitle: string;
    settingDesc: string;
    settingItem: any;
    setIdx: number;
    isShowNormal: boolean;
    loading?: boolean;
    show?: boolean;
    showLocale?: boolean;
    btnNormal: boolean;
    isCurrency?: boolean;
    isEnableCreit?: boolean;
    isShowCorrectIcon?: boolean;
  }>;
}

/** 隐身模式常量 */
export enum InvisibleMode {
  /** 显示用户名 */
  SHOWUSERNAME = 'ShowUserName',
  /** 显示uid */
  SHOWUID = 'ShowUid',
  /** 完全隐身 */
  INVISIBILITY = 'Invisibility',
}

/** 隐身模式 */
export interface InvisibleOptions {
  key: string;
  value: string;
}

/**
 * 配置默认头像
 *
 * @param url 头像的url地址
 * @param active 是否激活
 * @param processedUrl 处理后的url地址
 * @param idx 标识符 从avatar-50开始
 */
export interface defaultAvatarPc extends BaseInterface {
  /** 头像的url地址 */
  url: string;
  /** 处理后的url地址 */
  processedUrl: string;
  /** 是否激活 */
  active: boolean;
  /** 标识符 */
  idx: string;
}
