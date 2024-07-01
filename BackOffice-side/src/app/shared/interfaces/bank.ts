import { BaseInterface } from './base.interface';

/**
 * 银行列表请求参数
 */
export interface BankParams extends BaseInterface {
  TenantId: string;
  UID?: string;
  Currency?: string;
  Name?: string;
  IsLocked?: boolean;
  BankName?: string;
  CardNum?: string;
  CreatedTimeStart?: number;
  CreatedTimeEnd?: number;
  PageIndex: number;
  PageSize: number;
}

/**
 * 银行列表配置请求参数
 */
export interface BankListConfigParams extends BaseInterface {
  bankName: string;
  currency: string;
  pageIndex: number;
  pageSize: number;
}

/**
 * 新增银行列表配置请求参数
 */
export interface AddBankListConfigParams extends BaseInterface {
  bankCode: string;
  bankNameLocal: string;
  bankNameEn: string;
  currencyType: string[];
}

/**
 * 更新银行列表配置请求参数
 */
export interface UpdateBankListConfigParams extends AddBankListConfigParams {
  id: number;
}

/**
 * 获取银行映射列表请求参数
 */
export interface BankMapListParams extends BaseInterface {
  channelId?: string;
  isOpen?: boolean;
  currency?: string;
  paymentMethodId?: string;
  pageIndex: number;
  pageSize: number;
}

/**
 * 新增银行映射请求参数
 */
export interface BankMapParams extends BaseInterface {
  channelId: string;
  currencyType: string;
  paymentMethodId: string;
  bankCode: string;
  bankCodeMapping: string;
  isEnable: boolean;
}
