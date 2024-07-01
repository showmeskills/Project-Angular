import { BaseInterface } from './base.interface';

export interface AppealListParams extends BaseInterface {
  page: number;
  pageSize: number;
}

export interface TxIdExitsParams extends BaseInterface {
  currency: string;
  txId: string;
}

export interface DepositCoinParams extends BaseInterface {
  currency: string;
  amount: number;
  network: string;
  txId: string;
}

export interface TopUpoOrderInforCallBack extends BaseInterface {
  amount: number;
  currency: string;
  orderNum: string;
  paymentCode: string;
  paymentImages: any;
  paymentName: string;
  userName: string;
}

export interface UpdateCurrencyDepositeOrderCallBack extends BaseInterface {
  appealId: string;
  orderNum: string;
  currency: string;
  amount: number;
  userName: string;
  paymentName: string;
  images: Array<string>;
  video: string;
}

export interface TopUpOrderInforItem extends BaseInterface {
  orderId: string;
  createTime?: string;
  userName: string;
  bankName?: string;
  amount: string;
  fee?: string;
  orderStatus?: string; //[ Pending, Finish, Supplement, Rejected, Cancel ]
  currency: string;
  paymentWay?: string;
  toCurrency?: string;
  isOpen?: boolean;
  paymentIcon: string;
}

export interface historyListItem extends BaseInterface {
  amount: number;
  appealId: string;
  appealTime: number;
  coinDepositAddress: any;
  currency: string;
  fee: number;
  isOpen: boolean;
  orderNumber: string;
  paymentMethod: string;
  status: string;
}

export interface DepositeByCurrencyParams extends BaseInterface {
  orderNum: string;
  amount: number;
  images: Array<string>;
  desc: string;
}

export interface UpdateCurrencyDepositeOrderParams extends BaseInterface {
  appealId: string;
  isCancel: boolean;
  video: string;
  images: string[];
  desc: string;
  amount: number;
}
