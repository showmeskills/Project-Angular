import { BaseInterface } from './base.interface';

/**
 * 币种管理类目
 */
export interface CurrencyForm extends BaseInterface {
  id?: number;
  currency: string; // 币种
  type: number; // 种类
  name: string; // 币种全称
  icon: string; // 币种Icon
  isReverse: boolean; // 是否反向
  systemRate: string; // 系统汇率
  isEnableCryptoCurrency: boolean; // 是否启用加密货币(存加密货币得法币)
  buyFloat: string; // 买入浮动
  sellFloat: string; // 卖出浮动
}

/**
 * 币种列表
 */
export interface Currency extends BaseInterface {
  code: string; // 币种
  description?: string; // 币种全称
  icon?: string; // 币种Icon
  isDigital?: boolean; // 是否是数字货币
}

/**
 * 币种列表参数
 */
export interface CurrencyParams extends BaseInterface {
  TenantId: number; // 商户ID
  Name?: string; // 币种或名称查询
  Status?: 'Disabled' | 'Enabled' | 'None' | string; // 状态查询
  IsDigital?: boolean; // 是否是数字货币
}

/**
 * 币种创建参数
 */
export interface CurrencyCreateParams extends BaseInterface {
  currency: string;
  name: string;
  icon: string;
  isDigital: boolean;
}

/**
 * 更新币种参数
 */
export interface UpdateCurrencyParams {
  currencyType: string; // 币种
  name: string; // 名称(全名）
  icon: string; // 图标
  isDigital: boolean; // 是否是数字货币
  isEnableCryptoCurrency: boolean; // 是否启用加密货币功能(存加密货币得法币)
  isAutoCatch: boolean; // 知否自动采集
  systemRate: number; // 系统汇率
  minWithdraw: number; // 最低提币金额
  maxWithdraw: number; // 最高提币金额
  minDeposit: number; // 最低存款金额
  maxDeposit: number; // 最高存款金额
  countryCode: string[]; // 币种支持国家编码
  buyRateSpread: number; // 买入价差百分比
  sellRateSpread: number; // 卖出价差百分比
}

/**
 * 更新币种状态参数
 */
export interface UpdateCurrencyStatusParams {
  tenantId: number;
  currency: string;
  isEnable: boolean;
}

/**
 * 币种列表类目
 */
export interface TenantCurrency extends BaseInterface {
  tenantId: number; // 商户Id
  currency: string; // 币种
  name?: string | null; // 名称(全名）
  icon?: string | null; // 图标
  iconAddress?: string | null; // 图标host地址
  systemRate: number; // 系统汇率
  realRate: number; // 实时汇率
  minWithdraw: number; // 最低提币金额
  maxWithdraw: number; // 最高提币金额
  minDeposit: number; // 最低存款金额
  maxDeposit: number; // 最高存款金额
  isDigital: boolean; // 是否数字货币;
  isEnable: boolean; // 是否开启;
  isEnableCryptoCurrency: boolean; // 是否启用加密货币功能(存加密货币得法币);
  countryCode: string[]; // 国家代码
  buyRateSpread: number; // 买入价差百分比
  sellRateSpread: number; // 卖出价差百分比
}
