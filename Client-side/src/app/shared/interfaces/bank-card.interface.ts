import { BaseInterface } from './base.interface';

/**
 * 银行卡
 */
export interface BankCard extends BaseInterface {
  id: number;
  name: string;
  cardNum: string;
  bankCode: string;
  isDefault: boolean;
}
/**
 * 根据币种获取银行卡
 */
export interface SystemBankCard extends BaseInterface {
  bankCode: string;
  bankNameLocal: string;
  bankNameEn: string;
}

export interface AddBankCardPost extends BaseInterface {
  currencyType: string;
  name: string;
  bankCode: string;
  cardNum: string;
  key: string;
}

export interface BatchdeleteParam extends BaseInterface {
  ids: number[];
  key: string; //2fa返回的key
}

export interface DeleteParam extends BaseInterface {
  id: number;
  key: string; //2fa返回的key
}

/**获取法币存款可用红利活动下拉列表 接口参数 */
export interface GetBonusActivitParam extends BaseInterface {
  /**币种 */
  currency: string;
  /**金额 */
  amount: number;
}

export interface BonusActivitCallBackData extends BaseInterface {
  activityType: string;
  bonusActivitiesNo: string;
  bonusActivityName: string;
  grantType: string;
  projectedIncome: number;
  returnPercentage: number;
  releaseCardTypeCode: string;
  labels: string[];
  bonusMaxUsdt: number;
  prizeType: number;
  projectedCurrency: string;
  projectedOrdNum: number;
  bonusFixedUsdt: number;
  prizeAmountType: number;
  projectedTotalNum: number;
  rateVos: Array<{
    minDepositUsdt: number;
    rate: number;
  }>;
}

/** 获取银行卡信息 */
export interface VerifyInfoParams extends BaseInterface {
  currencyType: string;
  cardNum: string;
}

/** 获取校验银行卡返回值 */
export interface VerifyInfoResponse extends BaseInterface {
  bankCode: string;
  bankNameLocal: string;
  bankNameEn: string;
}
