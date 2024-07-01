import { BaseInterface } from './base.interface';
export interface Page extends BaseInterface {
  page?: number;
  pageSize?: number;
}

export interface PageIndex extends BaseInterface {
  pageIndex?: number;
  pageSize?: number;
}
