/**
 * 闪兑预览返回
 */
export interface TradePreview {
  finalPrice: number;
  isFromTo: boolean;
  positivePrice: number;
}

/**
 * 闪兑预览参数
 */
export interface TradePreviewParams {
  fromAddress: string;
  fromNetwork: string;
  fromCoin: string;
  fromAmount: number;
  toAddress: string;
  toNetwork: string;
  toCoin: string;
}

/**
 * 闪兑提交参数
 */
export interface TradeParams extends TradePreviewParams {
  previewRate: number;
  finalPrice: number;
}

/**
 * 闪兑列表参数
 */
export interface TradeListParams {
  TxNum?: string;
  Address?: string;
  Network?: string;
  Coin?: string;
  Status?: string;
  BeginCreateTime?: number;
  EndCreateTime?: number;
  PageIndex: number;
  PageSize: number;
}

/**
 * 闪兑列表Item
 */
export interface TradeItem {
  id: number; // 记录ID
  txNum: string; // 交易号
  fromAddress: string; // 源钱包地址
  fromAmount: number; // 源兑换数量
  fromCoin: string; // 源币种
  fromNetwork: string; // 源网络
  previewRate: number; // 预览汇率
  realRate: number; // 真实汇率
  toAddress: string; // 目标钱包地址
  toAmount: number; // 目标兑换数量
  toCoin: string; // 目标币种
  toNetwork: string; // 目标网络
  totalFee: number; // 总消耗交易手续费
  status: TradeStatusEnum; // 订单状态
  completedTime: number; // 兑换完成时间
  createdTime: number; // 订单创建时间
}

/**
 * 闪兑详情
 */
export interface TradeDetail {
  id: number; // 记录ID
  txNum: string; // 交易号
  fromAddress: string; // 源钱包地址
  fromNetwork: string; // 源网络
  fromCoin: string; // 源币种
  fromAmount: number; // 源兑换数量
  toAddress: string; // 目标钱包地址
  toNetwork: string; // 目标网络
  toCoin: string; // 目标币种
  toAmount: number; // 目标兑换数量
  previewRate: number; // 预览汇率
  realRate: number; // 真实汇率
  totalFee: number; // 总消耗交易手续费
  status: TradeStatusEnum; // 闪兑状态
  conversionDetail: TradeDetailTransaction; // 交易详情
  createdTime: number;
  completedTime: number;
  remarks: TradeDetailRemarks[];
}

/**
 * 闪兑详情 - 交易详情
 */
export interface TradeDetailTransaction {
  outTxHash: string; // 兑换后的hash
  outTxStatus: number; // 兑换后的状态
  outFee: number; // 兑换后的手续费
  depositAddress: string; // 兑换后的地址
  inTxHash: string; // 兑换前的hash
  inTxStatus: number; // 兑换前的状态
  inFee: number; // 兑换前的手续费
  tradeInOrderNum: string; // 兑换前的订单号
  tradeSuccess: boolean; // 兑换是否成功
  isReturn: boolean; // 是否退回
}

/**
 * 闪兑详情 - 备注
 */
export interface TradeDetailRemarks {
  stage: TradeDetailRemarksStageEnum; // 兑换阶段
  tradeStatus: TradeDetailRemarksStatusEnum; // 交易状态
  updateTime: number; // 更新时间
  code: number; // 交易状态码
  msg: string; // 交易状态描述
}

/**
 * 闪兑详情 - 兑换阶段备注枚举
 */
export enum TradeDetailRemarksStageEnum {
  HotWalletTransferOut = 'HotWalletTransferOut', // 热钱包转出
  HotWalletTransferReturn = 'HotWalletTransferReturn', // 热钱包转出退回
  Trade = 'Trade', // 闪兑
  HotWalletTransferIn = 'HotWalletTransferIn', // 热钱包转入
}

/**
 * 闪兑详情 - 交易备注状态枚举
 */
export enum TradeDetailRemarksStatusEnum {
  Pending = 'Pending',
  Success = 'Success',
  Failed = 'Failed',
}

/**
 * 闪兑状态枚举
 */
export enum TradeStatusEnum {
  Created = 'Created',
  Processing = 'Processing',
  Success = 'Success',
  Failed = 'Failed',
}
