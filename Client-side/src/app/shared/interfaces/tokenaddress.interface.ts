import { BaseInterface } from './base.interface';

/**
 * 数字货币地址
 */
export interface TokenAddress extends BaseInterface {
  id: number;
  remark: string;
  token: string;
  network: string;
  address: string;
  isWhiteList: boolean;
  currency: string;
  paymentMethod: string;
}

//添加地址参数
export interface AddAddressParam extends BaseInterface {
  /**备注 */
  remark: string;
  /**币种 */
  token: string;
  /**网络 */
  network: string;
  /**地址 */
  address: string;
  /**是否添加白名单 */
  isWhiteList: boolean;
  /**2fa返回的key */
  key: string;
}

//添加电子钱包地址参数
export interface AddEwAddressParam extends BaseInterface {
  /**备注 */
  remark: string;
  /**币种 */
  currency: string;
  /**支付方式（钱包类型：例如EBpay） */
  paymentMethod: string;
  /**地址 */
  address: string;
  /**是否添加白名单 */
  isWhiteList: boolean;
  /**2fa返回的key */
  key: string;
}

export interface GetAddParam {
  /**币种,不传即不限，空字符串时候自动不传 */
  currency: string;
  /**是否为白名单地址,不传即不限，null时候自动不传 */
  isWhiteList: null | boolean;
  /**是否为通用地址,不传即不限，null时候自动不传 */
  isUniversalAddress?: null | boolean;
  /**搜索地址,不传即不限，空字符串时候自动不传 */
  address: string;
  /** 是否提现，为 true 时会判断用户是否开启了白名单，如果已开启，只返回白名单地址（忽略isWhiteList），如果未开启，返回全部地址（同样忽略isWhiteList）, 不传默认为false */
  isWithdraw?: boolean;
  /**地址类型 VirtualCurrencyWallet = 1 ElectronicWallet = 2 */
  walletAddressType: string;
  /**电子钱包支付方式 */
  paymentMethod?: string;
}

export interface EwPaymentlist {
  code: string;
  name: string;
  walletAddressValid: string;
  supportCurrency: string[];
}

export interface BatchdeleteParam extends BaseInterface {
  ids: number[];
  key: string; //2fa返回的key
}

export interface InOutWhitelistParam extends BaseInterface {
  ids: number[]; //
  isJoin: boolean; //加入白名单or移出白名单,true为加入,false为移出
  key: string; //2fa返回的key
}
