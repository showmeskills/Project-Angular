import { BaseInterface } from 'src/app/shared/interfaces/base.interface';

/**
 * 国家下拉
 */
export interface Country extends BaseInterface {
  countryCode: string;
  countryName: string;
}

/**
 * 商户下拉列表
 */
export interface Merchant extends BaseInterface {
  value: number;
  name: string;
  id: number;
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
 * 通用下拉
 */
export interface CommonSelect extends BaseInterface {
  code: string;
  enName: string;
  localName: string;
}

/**
 * 调账类型
 */
export type AdjustmentType = CommonSelect;

/**
 * 调账类型下拉
 */
export interface AdjustmentTypeSelect extends AdjustmentType {
  name: string;
}

/**
 * 网络
 */
export type Network = CommonSelect;

/**
 * 网络下拉
 */
export interface NetworkSelect extends Network {
  name: string;
}

/**
 * 厂商分类
 */
export type ProviderCategory = 'SportsBook' | 'Esports' | 'Lottery' | 'LiveCasino' | 'SlotGame' | 'Chess';
