import { BaseInterface } from './base.interface';
import BigNumber from 'bignumber.js';

/**
 * 汇率指令 - 转换详情
 */
export interface ExchangeConvertDetail {
  readonly value: BigNumber.Value; // 转换值
  readonly sourceCurrency: string; // 源币种
  convertCurrency: string; // 转换币种
  source?: Exchange; // 源汇率
  convert?: Exchange; // 转换汇率
  result: BigNumber; // 转换结果值
}

/**
 * 汇率列表请求
 */
export interface ExchangeParams extends BaseInterface {
  filter?: string; // 筛选币种的符号(一个或多个（用逗号分隔）)
  isDigital?: boolean; // 是否是加密货币
  pageIndex: number;
  pageSize: number;
}

/**
 * 汇率
 */
export interface ExchangeItem extends BaseInterface {
  currency: string; // 币种
  rate: number; // 汇率中间价
  buyRateSpread: number; // 买入价差百分比
  sellRateSpread: number; // 卖出价差百分比
  isDigital: boolean; // 是否数字货币
  isEnable: boolean; // 货币兑换开关
  sort: number; // 排序
}

/**
 * 汇率下拉
 */
export interface Exchange extends BaseInterface {
  currency: string;
  rate: number;
  isDigital: boolean;
  buyRateSpread: number; // 买入价差百分比
  sellRateSpread: number; // 卖出价差百分比
}

export interface IChannnelConfigParams extends BaseInterface {
  page: number;
  pageSize: number;
  isOpened?: boolean; // 筛选状态
  channelId?: string; // 筛选渠道名称
  methods?: string; // 筛选支付方式 多选，逗号分隔
}

export interface IAllocatedListParams extends BaseInterface {
  merchantId?: number | string;
  page: number;
  pageSize: number;
}

/**
 * 更新汇率兑换状态
 */
export interface ExchangeStatusParams {
  currency: string;
  isEnable: boolean;
}
