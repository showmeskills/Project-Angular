import { BaseInterface } from './base.interface';

export interface IChannelAccountParams extends BaseInterface {
  pageIndex: number;
  pageSize: number;
  merchantId?: number;
  paymentProvider?: string;
  status?: boolean | undefined;
}
