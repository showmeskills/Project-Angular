import { BaseInterface } from './base.interface';
import { PaymentCategoryEnum } from 'src/app/shared/interfaces/transaction';

/**
 * 支付列表参数
 */
export interface PaymentMethodGoMoneyParams extends BaseInterface {
  pageIndex?: number;
  pageSize?: number;
  paymentMethod?: string;
  isEnabled?: boolean;
  id?: number;
}

/**
 * 更新支付方式
 */
export interface UpdatePaymentMethodGoMoneyParams extends BaseInterface {
  id: number;
  paymentMethodNameEn: string;
  paymentMethodNameLocal: string;
  isEnable: boolean;
  images: Array<string>;
}

/**
 * 支付方式请求参数
 */
export interface PaymentMethodParams {
  tenantId: string | number; // 商户Id
  name?: string; // 支付方式名称
  category?: PaymentCategoryEnum; // 支付方式分类
  status?: boolean | string; // 状态 是否开启 因为是get参数所以支持string
}

/**
 * 支付方式列表返回体
 */
export interface PaymentMethodResponse<T = PaymentMethodItem> {
  iconAddress: string; // 图片域名
  list: T[]; // 支付方式列表
}

/**
 * 支付方式
 */
export interface PaymentMethodItem {
  category: PaymentCategoryEnum; // 支付方式分类：Withdraw/Deposit 提现/充值
  fee: number; // 手续费（没有*100）
  feeEnabled: boolean; // 手续费是否开启
  icon: string[]; // 图片路径
  iconAddress: null | string; // 图片域名
  id: number; // 支付方式Id
  labelInfo: null | PaymentMethodLabel[]; // 标签列表
  maxAmount: number; // 金额上限
  minAmount: number; // 金额下限
  name: string; // 支付方式名称
  paymentId: string; // GoMoney存取款方式代号
  remark: null | string; // 支付方式描述
  selectLabel: null | { [key: string]: string }; // 选择的标签    key=标签id value=标签名称
  status: boolean; // 状态 是否开启
  tipsInfo: null | PaymentMethodTips[]; // 文案提示信息
  type: PaymentMethodTypeEnum; // 支付方式类型
  isRecommend: boolean; // 是否推荐
}

export interface PaymentMethodCustomItem extends Omit<PaymentMethodItem, 'selectLabel'> {
  selectLabel: null | string[];
}

/**
 * goMoney支付方式列表类目
 * > 以下字段为goMoney的，部分不用
 */
export interface PaymentMethodGoMoneyItem {
  id: number; // 支付方式Id
  key: string; // 匹配到goMoney的支付方式id paymentId
  images: string[]; // 图片路径
  nameEn: string; // 支付方式En名称
  nameLocal: string; // 支付方式Local名称
  action: string; // goMoney用的，这里不用
  currencies: PaymentMethodGoMoneyCurrencyItem[];
  needWalletAddress: boolean;
  walletAddressValid: string;
  fixedAmounts: number[];
  isDigital: boolean; // 是否为虚拟币
}

/**
 * goMoney支付方式币种类目
 */
export interface PaymentMethodGoMoneyCurrencyItem {
  currency: string; // 币种
  countries: string[];
  isMaintaining: boolean;
  amount: {
    begin: number;
    end: number;
  } | null;
  fee: {
    begin: number;
    end: number;
  } | null;
  needBankCode: boolean;
  vipLevelLimit: number; // 0:不限制 VIP等级限制
}

/**
 * 支付方式获取
 */
export interface PaymentMethodDetail extends PaymentMethodItem {
  labelInfo: {
    item: { name: string; languageCode: string }[];
    labelId: number;
    sort: number;
  }[];
}

/**
 * 支付方式标签
 */
export interface PaymentMethodLabel {
  labelId: number; // 标签Id
  sort: number; // 排序
  item: PaymentMethodLabelLang[];
}

/**
 * 支付方式标签 - 多语言
 */
export interface PaymentMethodLabelLang {
  name: string; // 标签名称
  languageCode: string; // 语言Code
}

/**
 * 支付方式类型
 */
export interface PaymentMethodTypeEnum {
  Recommend: 'Recommend'; // 推荐 = 0
  BankCard: 'BankCard'; // 银行卡 = 1
  EWallet: 'EWallet'; // 电子钱包 = 2
  QrPay: 'QrPay'; // QR扫码 = 3
  OnlinePay: 'OnlinePay'; // 在线支付 = 4
  EGift: 'EGift'; // 电子礼券 = 5
}

/**
 * 支付方式提示
 */
export interface PaymentMethodTips {
  languageCode: string; // 语言Code
  tipsInfoItem: PaymentMethodTipsItem[];
}

/**
 * 支付方式提示 - 详情
 */
export interface PaymentMethodTipsItem {
  tipsType: PaymentMethodTipsTypeEnum; // 提示类型
  content: string; // 提示内容
}

/**
 * 支付方式提示 - 详情类型
 */
export interface PaymentMethodTipsTypeEnum {
  Operate: 'Operate'; // 操作 = 1
  Deposit: 'Deposit'; // 存款 = 2 存款页提示
  Detail: 'Detail'; // 详情 = 3
}

/**
 * 支付方式管理 - 更新
 */
export interface PaymentMethodUpdateParams {
  id?: number;
  tenantId: number;
  paymentId?: string; // 存取款方式代号
  category?: string; // Enum [ Deposit, Withdraw ]
  fee: number; // 手续费（没有*100）
  feeEnabled: boolean; // 手续费是否开启
  selectLabel: number[]; // 选择的标签id集合
  tipsInfo: null | PaymentMethodTips[]; // 文案提示信息
  isRecommend: boolean; // 是否显示推荐
}
