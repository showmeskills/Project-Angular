import { BaseInterface, BasePage } from './base.interface';
import { PaymentType } from 'src/app/shared/interfaces/transaction';
import { FormControl, FormGroup } from '@angular/forms';
import { TurntableTypeEnum } from 'src/app/shared/interfaces/activity';

/**
 * 获取商户列表请求参数
 */
export interface MerchantsListParams extends BasePage {
  Id: string; // MID
  Name?: string; // 商户名称
}

/**
 * 获取商户列表请求参数
 */
export interface UpdateMerchantsStatusParams {
  Id: string;
}

/**
 * 商户详情返回数据
 */
export interface MerchantDetail {
  id: number;
  status: number;
  iconAddress: string;
  name: string;
  email: string;
  url: string;
  serviceFee: number | null;
  googleVerifyName: string;
  gogamingConfig: {
    ledLockRatio: number;
    ledMinAmount: number;
    gameHubID: string;
    gameHubKey: string;
    requiredFreeWithdrawFeeMultiples: number; // 免提款手续费所需流存比例
    openedSocialLogin: Array<string>;
    turntableType: TurntableTypeEnum;
    withdrawSingleThreshold: number | null; // 提款单笔金额 超过多少进入二次审核
    withdraw24hThreshold: number | null; // 提款总金额（24小时内） 超过多少进入二次审核
    limitAmount: number | null | undefined; // 限额金额，0和空为无限制
    supportLangList: Array<string>; // 支持的语系
    notDivision: string; // NOTO
    riskControlNoAudit: boolean; // 更改风控级别
  };
  gomoneyConfig: { securityKey: string; systemID: string };
  gosportsConfig: string;
  golotteryConfig: string;
  openedService: Array<string>;
}

/**
 * 商户新增请求参数
 */
export interface AddMerchantsParams extends BaseInterface {
  name: string;
  email: string;
  url: string;
  googleVerifyName?: string;
  gogamingConfig: {
    gameHubID: string;
    gameHubKey?: any;
    requiredFreeWithdrawFeeMultiples: number;
    openedSocialLogin: string[];
    ledLockRatio: number | null;
    ledMinAmount: number | null;
    turntableType: TurntableTypeEnum;
    withdrawSingleThreshold: number | null; // 提款单笔金额 超过多少进入二次审核
    withdraw24hThreshold: number | null; // 提款总金额（24小时内） 超过多少进入二次审核
    limitAmount: number | null | undefined; // 限额金额，0和空为无限制
    supportLangList: string[] | null | undefined; // 支持的语系
    notDivision: string; // NOTO
    riskControlNoAudit: boolean | null | undefined; // 更改风控级别
  };
  gomoneyConfig: MerchantGoMoneyConfig;
  gosportsConfig: string;
  golotteryConfig: string;
  openedService: Array<string>;
}

/**
 * 商户GoMoney配置
 */
export interface MerchantGoMoneyConfig extends BaseInterface {
  securityKey?: string;
  systemID?: string;
  // interfaceUrl?: string;
  // callBackUrl: string;
  // whitelist: string[];
  // isNegative: boolean;
  // rateCategory: string;
  // isFiatMoneyEnable: boolean; // 法币是否启用
  // isVirtualMoneyEnable: boolean; // 虚拟币是否启用
  // isVirtualToFiatMoneyEnable: boolean; // 存虚拟币得法币是否启用
  // rates: MerchantGoMoneyRate[];
}

/**
 * 商户GoMoney配置 - 费率
 */
export interface MerchantGoMoneyRate extends BaseInterface {
  currencyType: string;
  paymentMethodConfigs: MerchantGoMoneyPaymentMethodConfig[];
}

/**
 * 商户GoMoney配置 - 费率 - 支付方式配置
 */
export interface MerchantGoMoneyPaymentMethodConfig extends BaseInterface {
  chargeCategory: keyof typeof MerchantRateCurrencyType;
  paymentCategory: string;
  paymentMethodId: string;
  smallRate: number;
  largeRate: number;
  feeMin: number;
  feeMax: number;
}

/**
 * 商户静态配置文件字段
 */
export interface MerchantStaticConfig extends BaseInterface {
  key: string;
  value: string;
}

/**
 * 商户资金统计
 */
export interface MerchantMoneyCountItem {
  merchantId: number; // 商户ID
  currency: string; // 币种
  currentTime: number; // 日期
  currentTimeStr?: string; // 日期
  depositAmount: number; // 存款金额
  depositNum: number; // 存款数
  withdrawAmount: number; // 提款金额
  withdrawNum: number; // 提款数
  payoutAmount: number; // 支出金额
  fee: number; // 手续费
  adjustmentAmount: number; // 调整金额
  profitAmountIncome: number; // 盈利收入金额
  profitAmountOutcome: number; // 盈利支出金额
  managePayoutAmount: number; // 集团支出金额
  lastBalance: number; // 最新余额
}

export interface UpdateMerchantsParams extends AddMerchantsParams {
  id: string;
}

/**
 * 获取商户汇率可配置的币种
 */
export interface MerchantRateCurrency {
  chargeCategory: keyof typeof MerchantRateCurrencyType;
  currencies: MerchantRateCurrencyItem[];
}

/**
 * 获取商户汇率可配置的币种 - 自定义类型
 */
export interface MerchantRateCurrencyCustom extends MerchantRateCurrency {
  data: MerchantRateCurrencyItemDataCustom[];
}

/**
 * 获取商户汇率配置 - 自定义类型
 */
export interface MerchantRateCurrencyItemDataCustom {
  currency: string;
  deposit: MerchantRateCurrencyItemCustom[];
  withdrawal: MerchantRateCurrencyItemCustom[];
}

/**
 * 获取商户汇率配置 - 自定义类型
 */
export interface MerchantRateCurrencyItemCustom {
  smallRate: any;
  largeRate: any;
  feeControl: FormGroup<{ feeMin: FormControl<any>; feeMax: FormControl<any> }>;
  name: string;
  paymentCategory: PaymentType;
  paymentMethodId: string;
}

/**
 * 获取上回汇率可配置的币种列表
 */
export interface MerchantRateCurrencyItem {
  currency: string;
  payments: { paymentCategory: PaymentType; paymentMethodId: string }[];
}

/**
 * 商户汇率币种类型
 */
export enum MerchantRateCurrencyType {
  Unknown, // 未知
  FiatMoney, // 法币
  VirtualMoney, // 虚拟币
  VirtualToFiatMoney, // 存虚得法币
}

/**
 * 币种类型
 */
export type CurrencyType = keyof typeof MerchantRateCurrencyType;
