import { BaseInterface } from './base.interface';
export interface Page extends BaseInterface {
  page?: number;
  pageSize?: number;
}

export interface PageIndex {
  pageIndex?: number;
  pageSize?: number;
}

/**
 * 奖品发放记录分页
 */
export interface PrizePage<T = any> {
  sendDetail: T[];
  totalCount: number;
}
