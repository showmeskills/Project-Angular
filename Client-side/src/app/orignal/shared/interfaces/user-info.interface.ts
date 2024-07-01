import { BaseInterface } from './base.interface';

export interface UserInfo extends BaseInterface {
  cssName: string;
  currencyCode: string;
  mainAccountID: string;
  mainAccountSN: string;
  /**
   * 是否为游客
   */
  tryit: boolean;
  userAmount: number;
  walletType: number;
}
