import { BaseInterface } from './base.interface';

export interface BannerList extends BaseInterface {
  /**id */
  id: number;
  /**图片地址 */
  bannerUrl: string;
  /**链接地址 */
  imageUrl: string;
}

export interface FooterList extends BaseInterface {
  type: string;
  name: string;
  detail: FooterDetail[];
}

export interface FooterDetail extends BaseInterface {
  id: string;
  title: string;
  url: string;
  isBlank: boolean;
}

export interface LicensePic extends BaseInterface {
  id: string;
  image: string;
  isBlank: boolean;
  licenseType: string;
  url: string;
}

export interface TenantConfig extends BaseInterface {
  /**自定义配置 */
  config: {
    [key: string]: string | number;
    /**是否开启IM聊天 */
    chatEnabled: string;
    /**IM的配置 */
    chatConfig: string;
    /**缓存版本 */
    cacheVersion: string;
    /**下载页地址 */
    appDownloadPage: string;
    /**app的apiurl */
    appApiUrl: string;
    /**app的版本 */
    appVersion: string;
    /**app的资源域名 */
    appResourceUrl: string;
    /**app的下载链接 */
    appDownloadUrl: string;
    /**资源域名 */
    resourceUrl: string;
    /**欧洲版资源域名 */
    eurResourceUrl: string;
    /**liveChat id */
    liveChatLicense: string;
    /**liveChat 各语言分组 */
    liveChatGroup: string;
    /**帮助中心相关 */
    helpCenterConfig: any;
    /**网站favicon */
    favicon: string;
    /**IOS桌面图标 */
    appleTouchIcon: string;
    /** 第三方 验证 */
    thirdAuth: any;
    /**原生ios唤起链接 */
    appIosWakelink: string;
    /**原生安卓唤起链接 */
    appAndroidWakelink: string;
    /** 需要显示全名的国家列表 */
    fullNameCountries: string;
    /** 获取越南盾10倍显示 providerId */
    vndProviderIds: string;
    /** 限制弹出piq货币 */
    limitPiqCurrency: string;
    /** 动态资源域名 */
    deployUrl: string;
    /** 可用域名列表（需定期在后台更新） */
    dl: string;
    /**节日主题样式 */
    themeClass: string;
    /** 虚拟货币存款开启手机验证 */
    phoneVerifyCryptoDeposit: string;
    /** 支付宝口令红包 */
    aliPaySecretRedPacket: string;
    /** 支付寶H5 */
    aliPayH5: string;
    /** 支付宝个人码 */
    aliPayTransfer: string;
    /** 微信支付转帐 */
    weChatPayTransfer: string;
    /** 是否开启欧洲红利 */
    switchEuBonusFlow: string;
    /** 是否开启欧洲KYC */
    switchEuKyc: string;
    /** 是否开启 虚拟币提现需要完成初级KYC */
    kycVerifyCryptoWidthdraw: string;
    /** euro 2024 比赛完可删除*/
    euro2024_match_schedule: string;
    euro2024_tree_h5_1: string;
    euro2024_tree_h5_2: string;
    euro2024_tree_web: string;
    euro2024_tree_h5_1_dark: string;
    euro2024_tree_h5_2_dark: string;
    euro2024_tree_web_dark: string;
  };
  /**默认主题 */
  colorScheme: 'sun' | 'moon';
  /**加载图片(初始进入画面) */
  loadingImg: string;
  /**h5浅色主题logo */
  h5LogoSun: string;
  /**h5深色主题logo */
  h5LogoMoon: string;
  /**web浅色主题logo */
  webLogoSun: string;
  /**web深色主题logo */
  webLogoMoon: string;
}
