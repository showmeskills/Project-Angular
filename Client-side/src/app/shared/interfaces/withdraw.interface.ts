import { BaseInterface } from './base.interface';

/**
 * 虚拟货币提款
 */
export interface CoinWithdrawReq extends BaseInterface {
  key?: string;
  currency: string;
  address?: string;
  addressId?: string;
  network: string;
  amount: number;
}

/**
 * 虚拟货币提款返回參數
 */
export interface CoinWithdrawReturn extends BaseInterface {
  orderId: string; //订单号
  amount: number; //数量
  fee: number; //手续费
  address: string; //提币地址
  currency: string; //币种
  network: string; //网路
}

/**
 * 法币提款
 */
export interface CurrencyWithdrawReq extends BaseInterface {
  key?: string;
  paymentCode: string;
  currency: string;
  bankCardId?: number;
  amount: number;
  actionType: number;
  walletaddress?: string;
  addressId?: number;
}

export interface Quotalimit extends BaseInterface {
  /**币种 */
  currency: string;
  /**可用金额（单位选择的币种） */
  availQuota: number;
  /**余额（查询币种的余额） */
  balance: number;
  /**提款限额(USDT) */
  withdrawQuota: number;
  /**锁定金额（选择的币种锁定金额） */
  freezeAmount: number;
  /**当日限额(USDT)  当等于 -1 时，为无限制*/
  todayQuota: number;
  /**已使用额度（等于今日总的已提款金额）（USDT) */
  usedQuota: number;
  /**可提款金额（单位选择的币种） */
  canUseQuota: number;
  /**实际款手续费 (扣减后的手续费) */
  paymentHandlingFee: number;
  /**总提款手续费 (没有扣减的手续费) */
  totalHandlingFee: number;
}

/** 提法得虚参数 */
export interface CoinFiatToCrypto extends BaseInterface {
  key?: string;
  paymentCode: string;
  currency: string;
  amount: number | string;
  withdrawCurrency: string;
  network: string;
  address: string;
  addressId?: number;
  rateId: string;
  actionType: number;
}

export interface RiskFormVerify extends BaseInterface {
  /** 2061 返回 edd 并且isValid 是false */
  code: string;
  isValid: boolean;
  userName: string;
  kycType: string;
  kycCountry: string;
  country: string;
  isNeedWalletAddress: boolean;
  asiaCodes: 'Asia' | 'Europe';
}
