import { BaseInterface } from 'src/app/shared/interfaces/base.interface';

/**
 * 大洲下的国家下拉
 */
export interface ContinentCountryItem extends BaseInterface {
  continentCode: string;
  continentName: string;
  countries: Country[];
}

/**
 * 国家下拉
 */
export interface Country extends BaseInterface {
  countryCode: string;
  countryEnName: string;
  countryIso3: string;
  countryName: string;
}

/**
 * 国家带翻译下拉（自定义countryLang）
 */
export interface CountryUsage extends Country {
  countryLang: string;
}

/**
 * 商户下拉列表
 */
export interface Merchant extends BaseInterface {
  value: string;
  name: string;
}
export interface GoMoneyMerchant extends BaseInterface {
  id: number;
  name: string;
}

/**
 * 所有币种和主链
 */
export interface NetworkLink extends BaseInterface {
  code: string; // "ETH_ERC20"
  network: string; // "ERC20"
  token: string; // "ETH"
}

/**
 * 厂商下拉列表
 */
export interface Provider extends BaseInterface {
  id: string;
  name: null | string;
  gameList: string[];
  webLogo: string[];
  h5Logo: string[];
  appLogo: string[];
}

/**
 * 禁用 - 游戏交易厂商列表（分组）
 */
export interface ProviderGroupItem<T = any> {
  code: string;
  description: string;
  providers: T[];
}
