import { BaseInterface } from './base.interface';

/**
 * 充值方式
 */
export interface DepositTypeInterface extends BaseInterface {
  id: number; // id
  category?: string; // 分类
  name: string; // 名称
  remark: string; // 疑似简介
  sequence?: number; // 排序
  icon?: string; // 图标 (客户端添加)
  router?: string; // 路由 (客户端添加)
}

/**
 * 币种
 */
export interface CurrenciesInterface extends BaseInterface {
  currency: string;
  name: string;
  icon: string;
  symbol: string;
  minDeposit: number;
  isDigital: boolean;
  /**是否是可用的 */
  isVisible: boolean;
  /**是否显示在顶部 */
  display?: boolean;
  /**排序 */
  sort: number;
}

/**
 * 获取所有虚拟货币网络 参数
 */
export interface TokenNetworksParamInterface extends BaseInterface {
  category?: string; // 存款/提款/所有 Deposit, Withdraw
}

/**
 * 获取转账钱包余额 参数
 */
export interface TranserWalletBalanceParamInterface extends BaseInterface {
  platformGroupCode: string;
  currency: string;
}
/**
 * 获取转账钱包余额 参数
 */
export interface TranserWalletListParamInterface extends BaseInterface {
  providerId: string;
  pageIndex: number;
  pageSize: number;
}

/**
 * 获取转账钱包余额 callback
 */
export interface TranserWalletBalanceCallBack extends BaseInterface {
  availBalanceForWithdraw: number;
  totalBalance: number;
}

/**
 * 虚拟货币网络
 */
export interface NetworksInterface extends BaseInterface {
  network: string;
  name: string;
  desc: string;
  addressRegex: string;
  depositExpectedBlock: number;
  depositExpectedUnlockBlock: number;
  withdrawArrivalTime: number;
  minAmount: number;
  maxAmount: number;
  withdrawFee: number;
  feeUnit: string;
}
/**
 * 获取所有虚拟货币网络 返回内容
 */
export interface TokenNetworksInterface extends BaseInterface {
  currency: string;
  name: string;
  icon: string;
  symbol: string;
  minDeposit: number;
  isEnableWithdraw: boolean;
  isEnableDeposit: boolean;
  networks: NetworksInterface[];
}

/**
 * 获取所有虚拟货币网络 返回内容
 */
export interface AllNetWorks extends BaseInterface {
  addressRegex: string;
  depositExpectedBlock: number;
  depositExpectedUnlockBlock: number;
  desc: string;
  name: string;
  network: string;
  withdrawArrivalTime: number;
  isVailed?: boolean;
}

/**
 * 主网络弹出框list
 */
export interface MainNetWork extends BaseInterface {
  name: string;
  network: string;
  desc: string;
  isActive: boolean;
  isValied: boolean;
}

/**
 * 把返回的内容拉平方便渲染,networks 变为 networkInfo 对象
 */
export interface TokenNetworksFlatInterface extends BaseInterface {
  currency: string;
  name: string;
  icon: string;
  symbol: string;
  minDeposit: number;
  isEnableWithdraw: boolean;
  isEnableDeposit: boolean;
  networkInfo: NetworksInterface;
}

/**
 * 获取虚拟币存款地址 参数
 */
export interface DepositAddressParamInterface extends BaseInterface {
  currency: string;
  network: string;
}
/**
 * 获取虚拟币存款地址 返回内容
 */
export interface DepositAddressInterface extends BaseInterface {
  token: string;
  network: string;
  address: string;
  expectedBlock: number;
  expectedUnlockBlock: number;
  minDeposit: number;
}

/**
 * 获取法币存取款支付方式
 */
export interface PaymentListInferface extends BaseInterface {
  currency: string;
  category: string;
}

export interface PaymentListResponse extends BaseInterface {
  code: string;
  type: string[];
  category: 'Deposit' | 'Withdraw';
  name: string;
  minAmount: number;
  maxAmount: number;
  fee: number;
  desc: string;
  icons: string[];
  actionType: number;
  needBankCode: boolean;
  tipsInfo: TipInfo[];
  /** 固定金额 来自后台配置 */
  fixedAmounts: number[];
  /**是否推荐 */
  isRecommend: boolean;
}

export interface TipInfo extends BaseInterface {
  tipsType: string;
  content: string;
}

/**
 * 存款
 */
export interface PostDepositCryptoInferface extends BaseInterface {
  amount: number;
  currency?: string;
  paymentCode: string;
  actionType?: string;
  userName: string;
  bankCode?: string;
  activityNo?: string;
  callbackUrl?: string;
}

/**
 * 存款post回传数据
 */
export interface DepositCryptoCallBackData extends BaseInterface {
  statue: number;
  limitMinute: number;
  canUseTime: number;
  orderId: string;
  amount: number;
  currency: string;
  expireTime: number;
  actionType: number;
  bankInfo: {
    bankName: string;
    bankAccountNumber: string | any;
    bankAccountHolder: string | any;
    desc: string | any;
    transaferAddress: string | any;
  };
  html?: string;
  redirectUrl?: string;
  remark?: string;
}

/**
 * 存款订单状态
 */
export interface DepositOrderStatusCallBackData extends BaseInterface {
  orderId: string;
  state: string;
  expiredTime: number;
}
/**
 * 获取购买币种链接
 */
export interface CurrencyPurchaseInferface extends BaseInterface {
  currency: string;
  token: string;
  amount: number;
}

export interface WalletInfor extends BaseInterface {
  currency: string;
  type: string;
  balance: number;
  isSelected: boolean;
  icon: string;
  isDigital: boolean;
  minDeposit: number;
  name: string;
  symbol: string;
}

export interface CryptoNetWorkItem extends BaseInterface {
  addressRegex: string;
  depositExpectedBlock: number;
  depositExpectedUnlockBlock: number;
  desc: string;
  feeUnit: string;
  isActive?: boolean;
  isValied?: boolean;
  maxAmount: number;
  minAmount: number;
  name: string;
  network: string;
  withdrawArrivalTime: number;
  withdrawFee: number;
  transferAmount?: any;
}

/** 存虚得法的汇率接口 */
export interface VirtualRate extends BaseInterface {
  rateId: string;
  expireTimestamp: number;
  baseCurrency: string;
  rates: Array<{
    rate: number;
    currency: string;
  }>;
}

/** 提交存法得虚 */
export interface ToCurrency extends BaseInterface {
  /** 充值金额 */
  amount: number;
  /** 支付方式Code */
  paymentCode: string;
  /** 虚拟货币 */
  currency?: string;
  /** 支付货币 */
  paymentCurrency?: string;
  /** 网络 */
  network?: string;
  /** 汇率id */
  rateId: string;
  /** 支付方式返回的 */
  actionType: string;
  /** 红利 */
  activityNo?: string;
}

/** 提交存法得虚返回值 */
export interface ResponseToCurrency extends BaseInterface {
  /** 创建订单是否成功 1、创建成功，金额是输入金额 2、创建成功，金额调整为建议金额 3、上一笔订单未完成，返回上一笔订单信息 4、多笔订单未支付，需要等待N分钟才能操作 5、创建订单失败，提示用户更改虚拟货币存款 6、您所选的银行暂时不可用，请更换银行后重试上一笔交易还在处理中，需要间隔10秒重新请求 */
  statue: number;
  /** 限制等待多长时间（分钟） */
  limitMinute: number;
  /** 限制后什么时候可以使用 */
  canUseTime: number;
  /** 订单号 */
  orderId: string;
  /** 转账金额 */
  amount: number;
  /** 货币 */
  currency: string;
  /** 支付方式Code */
  paymentCode: string;

  /** 创建时间 */
  createTime: number;
  /** 过期时间（如果小于等于0则没有过期时间）(过期时间-当前时间=倒计时) */
  expireTime: number;
  /** 支付动作 1、网银支付（显示银行信息） 2、在线银行支付（html 跳转） 3、电子钱包支付（url 跳转） */
  actionType: number;
  bankInfo: {
    /** 转账银行 */
    bankName: string;
    /** 转账账号 */
    bankAccountNumber: string;
    /** 转账姓名 */
    bankAccountHolder: string;
  };
  /** ActionType=2时使用 （该html 是一个表单html，客户端用页面打开允许跳转，会跳转到第三方存款页面） */
  html: string;
  /** ActionType =3 时使用 （直接使用该参数跳转） */
  redirectUrl: string;
  /** 备注说明 */
  remark: string;
  /** 支付虚拟货币 */
  paymentCurrency: string;
  /** 支付虚拟币数量 */
  paymentAmount: number;
  /** 支付虚拟币数量 */
  depositAddress: string;
  /** 虚拟币充值地址 */
  network: string;
  /** 预计到账（N网络确认） */
  expectedBlock: number;
  /** 预计解锁（N网络确认） */
  expectedUnlockBlock: number;
  /** 支付汇率 */
  rate: number;
}
