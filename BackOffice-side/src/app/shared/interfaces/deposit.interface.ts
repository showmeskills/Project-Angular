import { BaseInterface, BasePage } from './base.interface';

/**
 * 获取存款记录列表参数
 */
export interface getDepositListParam extends BasePage {
  OrderNumber?: string; // 订单号
  UID?: string; // UID
  OrderStatus?: string; // 订单状态
  IsDigital?: boolean; // 是否为虚拟货币
  Currency?: string; //币种
  CreateTimeStart?: number; //申请时时间(起)
  CreateTimeEnd?: number; //申请时时间(结束)
  CompleteTimeStart?: number; //币种
  CompleteTimeEnd?: number; //币种
}

/**
 * 修改备注
 */
export interface updateRemarkParam extends BaseInterface {
  id: number;
  remark: string;
}

/**
 * 交易记录订单状态下拉列表
 */
export interface TransactionOrderStatus {
  categoryCode: string;
  categoryDescription: string;
}
export interface TransactionOrderStatusCustom extends TransactionOrderStatus {
  langText: string;
}
