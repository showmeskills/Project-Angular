import { BaseInterface } from './base.interface';
import BigNumber from 'bignumber.js';

/**
 * 汇率列表请求
 */
export interface ExchangeParams extends BaseInterface {
  filter?: string; // 筛选币种的符号(一个或多个（用逗号分隔）)
  pageIndex: number;
  pageSize: number;
}

/**
 * 汇率指令 - 转换详情
 */
export interface ExchangeConvertDetail {
  readonly value: BigNumber.Value; // 转换值
  readonly sourceCurrency: string; // 源币种
  convertCurrency: string; // 转换币种
  source?: ExchangeItem; // 源汇率
  convert?: ExchangeItem; // 转换汇率
  result: BigNumber; // 转换结果值
}

/**
 * 汇率
 */
export interface ExchangeItem extends BaseInterface {
  buyRateSpread: number;
  createdTime: number;
  currency: string;
  modifiedTime: number;
  rate: number;
  sellRateSpread: number;
}

export interface IChannnelConfigParams extends BaseInterface {
  page: number;
  pageSize: number;
  isOpened?: boolean; // 筛选状态
  channelId?: number; // 筛选渠道名称
}

export interface IAllocatedListParams extends BaseInterface {
  merchantId?: number | string;
  page: number;
  pageSize: number;
}
