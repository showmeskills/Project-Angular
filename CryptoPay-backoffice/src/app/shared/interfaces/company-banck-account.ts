import { BaseInterface } from './base.interface';

export interface ICreateComBankAccountParams extends BaseInterface {
  merchantId?: number;
  currency: string;
  payeeName: string;
  beneficiaryAccountNumber: string;
  beneficiaryBank: string;
  bankBranches?: string;
  swiftCode?: string;
  payeeAddress?: string;
  receivingBankAddress?: string;
  correspondentBankInfo?: string;
  singleDayDepositUpperLimit?: number;
  balanceUpperLimit?: number;
  singleDepositUpperLimit?: number;
  singleDepositLowerLimit?: number;
  isEnable?: boolean;
}

export interface IComBanckAccountParams extends BaseInterface {
  pageIndex: number;
  pageSize: number;
  merchantId?: number;
  currency?: string;
  payType?: string;
}
