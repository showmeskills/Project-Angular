import { PaginatorState } from '../../_metronic/shared/crud-table';

export interface BaseInterface {
  [key: string]: any;
}

export type Nullable<T> = {
  [P in keyof T]?: T[P] | null;
};

export type ExcludeNullable<T> = {
  [P in keyof T]: Exclude<T[P], null>;
};

export interface BasePage extends Pick<PaginatorState, 'page' | 'pageSize'>, BaseInterface {}

/**
 * 主题类型
 */
export type ThemeType = 'success' | 'primary' | 'danger' | 'warning' | 'default' | 'yellow' | 'info';

/**
 * Code和Name的数据
 */
export interface CodeName {
  code: string;
  name: string;
}

/**
 * 分页返回通用体
 */
export interface PageResponse<T> {
  list: T[];
  total: number;
}

/**
 * 通用返回体
 */
export interface Response<T> {
  code?: number;
  data: T;
  message?: null | string;
  success: boolean;
}

/**
 * 活动返回通用体
 */
export type ActivityResponse<T = any> = Response<T>;

/**
 * 活动返回通用体分页
 */
export interface ActivityResponsePage<T> extends ActivityResponse {
  data: {
    activities: T;
    totalCount: number;
  };
}
