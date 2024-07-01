import { PageIndex } from 'src/app/shared/interfaces/page';

/**
 * 新增IP白名单参数
 */
export interface AddWhite {
  merchantId: number; // 商户ID
  merchantWhiteList: string[]; // 商户API白名单
  adminWhiteList: string[]; // 商户后台白名单
  description: string; // 描述
}

/**
 * 白名单列表请求参数
 */
export interface WhiteListParams extends PageIndex {
  merchantId?: number | string;
  ip?: string;
  category?: IPCategory; // Unknown, Merchant, Admin
}

/**
 * IP类型
 */
export enum IPCategory {
  Unknown = 'Unknown',
  Merchant = 'Merchant',
  Admin = 'Admin',
}

/**
 * 白名单列表返回数据
 */
export interface WhiteItem {
  id: number;
  merchantId: number; // 商户ID
  ip: string; // 白名单IP
  category: IPCategory; // IP类型
  description: string; // 描述
  createdUserId: number; // 创建人ID
  createdUserName: string; // 创建人
  createTime: number; // 创建时间（时间戳）
}
