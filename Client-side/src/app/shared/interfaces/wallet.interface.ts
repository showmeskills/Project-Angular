import { BaseInterface } from './base.interface';

/** 获取可清除的提款限额币种 */
export interface ClearWithdrawallimitCurrency extends BaseInterface {
  currency: string;
  withdrawLimit: number;
}

/**
 * 钱包总览api返回数据
 */
export interface WalletViewData extends BaseInterface {
  uid: string;
  totalAsset: number;
  totalBonus: number;
  bonusDetail?: {
    bonusName: string;
    amount: number;
    currency: string;
  }[];
  /**主钱包 */
  overviewWallet: OverviewWallet;
  /**转账制钱包 */
  transferWallet: TransferwWallet[];
  /** 非粘性 */
  totalNonStickyBonus: number;
  nonStickyBonusWallet: Array<NonStickyBonusWallet>;
}

/** 非粘性 总览 额度字段， NSLiveCasino 真人娱乐场卡券， NSSlotGame 娱乐场卡券*/
export interface NonStickyBonusWallet {
  category: 'NSLiveCasino' | 'NSSlotGame';
  amount: number;
  totalAmount: number;
  currency: string;
  /** 自定义属性 */
  title: string;
}

export interface TransferwWallet extends BaseInterface {
  category: string;
  /**供应商分类 */
  providerCategorys: number[];
  providerId: string;
  isFirst: boolean;
  currencies: {
    currency: string;
    isActivate: boolean;
  }[];
}

export interface OverviewWallet extends BaseInterface {
  category: string;
  totalBalance: number;
  /**总冻结金额USDT */
  totalFreezeAmount: number;
  currencies: {
    currency: string;
    balance: number;
    withdrawLimit: number;
    /**可解锁金额，LED才有 */
    unlockedAmount: number;
    /**冻结金额 */
    freezeAmount: number;
  }[];
}

/**转账制钱包余额 */
export interface Transerwalletbalance extends BaseInterface {
  /**总金额 */
  totalBalance: number;
  /**可用金额 */
  availBalanceForWithdraw: number;
  /**当前币种转USDT汇率 */
  rate: number;
}

/**
 * 主钱包api返回数据
 */
export interface MainWalletData extends BaseInterface {
  uid: string;
  totalAsset: number;
  mainCurrencies: CurrencyItemData[];
}

/**
 * 用户所有币种余额api返回数据
 */

// 原始数据
export interface CurrencyBalance extends BaseInterface {
  isDigital: boolean;
  currency: string;
  balance: number;
  sort: number;
  /** 非粘性 新增参数*/
  walletCategory: 'Main' | 'NSSlotGame' | 'NSLiveCasino';
  /** 自定义属性 展示非粘性币种和余额 */
  isShowNonSticky: boolean;
  nsSlotGame: {
    isDigital: boolean;
    currency: string;
    balance: number;
  } | null;
  nsLiveCasino: {
    isDigital: boolean;
    currency: string;
    balance: number;
  } | null;
  nonStickyBalance: number;
}

export interface CurrencyItemData extends BaseInterface {
  currency: string;
  total: number;
  canUseAmount: number;
  freezeAmount: number;
}

/**
 * 兑换汇率api返回数据
 */
export interface ExchangeRateData extends BaseInterface {
  rateId: string;
  expiredTime: number;
  fromCurrency: any;
  toCurrency: any;
  buyRate: number;
}

/**
 * 所有汇率api返回数据
 */
export interface AllRateData extends BaseInterface {
  baseCurrency: string;
  expiredTime?: number;
  rates: RateItem[];
}
export interface RateItem extends BaseInterface {
  currency: string;
  rate: number;
}

/**
 * 支付方式状态api返回数据
 */
export interface CheckPaymentAvailResult {
  /**是否验证通过 */
  isValid: boolean;
  /**用户真实姓名 成功时会返回 */
  userName: string;
  /**用户kyc类型 (2050错误时需要)/成功时会返回 KycPrimary = 初级、KycIntermediat = 中级、KycAdvanced = 高级 */
  kycType: string;
  /**用户kyc 认证的国家 (2052错误时需要) */
  kycCountry: string;
  /**支付渠道关联的国家(2052错误时需要) */
  country: string;
  /**是否需要钱包地址 */
  isNeedWalletAddress: boolean;
  /**钱包地址验证规则 */
  walletAddressValid: string;
}

/**
 * 划转钱包列表
 */
export interface TransferWalletListData extends BaseInterface {
  category: string;
  /**供应商分类 */
  providerCategorys: number[];
  currencies: CurrencyData[];
  isFirst: boolean;
  providerId: string;
  walletName: string;
  outMinAmount: number;
}
export interface CurrencyData extends BaseInterface {
  balance: number;
  currency: string;
  minAmount: number;
  isActivate: boolean;
}
/**
 * 划转返回
 */
export interface TransferWalletCallBackData extends BaseInterface {
  result: any;
  data: any;
  timeStamp: any;
}

export interface OverViewWalletItem extends BaseInterface {
  category: string;
  currencie: [];
  providerId: string;
  totalBalance: number;
}

/**
 * 游戏钱包信息
 */
export interface GameWalletInforCallBackData extends BaseInterface {
  category: string;
  currencies: unknown;
  currency: string;
  isFirst: boolean;
  isTransfer: boolean;
}

/**佣金历史记录返回数据 */
export interface CommissionParam extends BaseInterface {
  /**返还类型 */
  returnType: string;
  /**页码 */
  pageIndex: number;
  /**页码尺寸 */
  pageSize: number;
  /**开始时间 */
  startTime: number;
  /**结束时间 */
  endTime: number;
}

/**佣金历史记录返回数据 */
export interface Commissionhistory extends BaseInterface {
  /**返还类型 */
  returnTyp: string;
  /**多币种 key：币种 value :金额 */
  multipleCurrenc: { [key: string]: number };
  /**金额 */
  amoun: number;
  /**佣金发放时间 */
  createTim: number;
}

/**佣金类型下拉选单 */
export interface ReturnTypeSelect extends BaseInterface {
  code: string;
  description: string;
}

/**
 * 当前钱包最小金额 数据重组
 */
export interface currenMinitWalletInfor extends BaseInterface {
  currency: string;
  balance?: number;
  minAmount: number;
}

export interface TransferDataList extends BaseInterface {
  amount: number; //交易金额
  balance: number; //余额
  createdTime: number; //交易时间
  currency: string;
  transactionId: string; //交易单号
  transferType: string; //划转类型 TransferInto:1, 转入 TransferOut:2, 转出
}
