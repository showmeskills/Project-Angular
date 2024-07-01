import { BaseInterface } from './base.interface';

export interface IChannelAccountParams extends BaseInterface {
  pageIndex: number;
  pageSize: number;
  merchantId?: number;
  currency?: string; // 币种
  paymentProvider?: string; // 支付通道：主渠道
  sortCategory?: string; // 排序字段 asc/desc
  status?: boolean | undefined;
  methods?: string;
}
