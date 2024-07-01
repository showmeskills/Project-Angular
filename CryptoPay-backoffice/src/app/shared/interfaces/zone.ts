import { BaseInterface } from './base.interface';

/**
 * 语言 接口返回
 */
export interface Language extends BaseInterface {
  id?: number;
  name: string;
  code: string; // 提交所用值 例:zh-cn
  enabled?: boolean;
}
