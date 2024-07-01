import { BaseInterface, BasePage } from './base.interface';

/**
 * 虚拟地址加密货币列表请求参数
 */
export interface VirtualParams extends BaseInterface, BasePage {
  TenantId: string;
  Uid: string;
  CurrentName: string;
  Network: string;
  BindingStartTime?: number;
  BindingEndTime?: number;
  LockStartTime?: number;
  LockEndTime?: number;
  LockStatus?: boolean;
}

/**
 * 虚拟币补单请求参数
 */
export interface ReplenishmentParams extends BaseInterface {
  merchantId: number;
  userId?: string;
  token: string;
  network: string;
  txHash?: string;
}
