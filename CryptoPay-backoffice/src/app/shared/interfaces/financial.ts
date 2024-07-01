/**
 * 付款申请类型
 */
export enum PaymentApplyType {
  Manual = 0,
  Batch = 1,
}

/**
 * 付款申请 - 交易详情
 */
export interface PaymentApplyDetail {
  bankAccountHolder?: string; // 收款人
  bankName?: string; // 收款银行
  bankCode?: string; // 收款银行编码
  bankAccountNumber?: string; // 收款账号(虚拟币为收款地址)
  exchangeCurrency?: string; // 兑换币种
  exchangeNetwork?: string; // 兑换网络
  exchangeRate?: number; // 兑换汇率
  exchangeAmount?: number; // 若有换汇，则为换汇后的金额
  presetAmount: number; // 预设金额(虚拟币为数量)
  amount?: number; // 实际金额(虚拟币为数量)
  channelFee?: number; // 渠道收费
  integrals?: number; // 订单积分;
  txHash?: number; // 交易哈希;
  exchangeMerchantId?: number; // 兑换的商户ID;
}

/**
 * 订单 - 人工取消原因
 */
export type OrderCancelReason = 'Customer' | 'Fail' | 'Other';
