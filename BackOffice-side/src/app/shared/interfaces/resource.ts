import { BasePage } from './base.interface';
import { KYCRegionEnum } from 'src/app/shared/interfaces/kyc';

/**
 * 获取资源列表请求参数
 */
export interface ResourceListParams extends BasePage {
  code: string; // 资源代码
  order: string; // '1' 降序 '0' 升序 '' 默认
  name: string; // 资源名称
}

/**
 * 资源 - 地区列表（大洲）
 */
export interface ResourceRegionItem {
  id: number;
  code: string; // 资源代码
  name: KYCRegionEnum; // 资源名称
  typeName: string; // 资源類型
  remark: string; // 备注
}
