import { BasePage } from './base.interface';

/**
 * 获取资源列表请求参数
 */
export interface ResourceListParams extends BasePage {
  code: string; // 资源代码
  order: string; // '1' 降序 '0' 升序 '' 默认
  name: string; // 资源名称
}
