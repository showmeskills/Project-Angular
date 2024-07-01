import { BaseInterface } from './base.interface';

/**
 * 请求返回数据
 */
export interface ResponseData<T> extends BaseInterface {
  success: boolean;
  message: string;
  code: string | number;
  data: T;
}

/**
 * 请求返回数据,常见的分页格式
 */
export interface ResponseListData<T> extends BaseInterface {
  success: boolean;
  message: string;
  code: string;
  data: {
    total: number;
    list: T;
  };
}
