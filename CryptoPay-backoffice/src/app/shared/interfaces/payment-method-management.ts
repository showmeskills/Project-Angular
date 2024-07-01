import { BaseInterface } from './base.interface';

/**
 * 支付列表参数
 */
export interface PaymentMethodParams extends BaseInterface {
  pageIndex?: number;
  pageSize?: number;
  paymentMethod?: string;
  isEnabled?: boolean;
  id?: number;
}

/**
 * 更新支付方式
 */
export interface UpdatePaymentMethodParams extends BaseInterface {
  id: number;
  paymentMethodNameEn: string;
  paymentMethodNameLocal: string;
  isEnable: boolean;
  images: Array<string>;
  fixedAmounts?: Array<number>;
}

/**
 * 支付方式列表类目
 */
export interface PaymentMethodItem {
  createTime: number;
  fixedAmounts: null | number[];
  id: number;
  images: string[];
  imagesHost: string;
  isEnable: boolean;
  paymentMethod: string;
  paymentMethodNameEn: string;
  paymentMethodNameLocal: string;
  supportedCurrencies: string[];
  supportedPaymentService: string[];
}
