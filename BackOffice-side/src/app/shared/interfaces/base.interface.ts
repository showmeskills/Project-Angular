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
export type ThemeType = ThemeTypeEnum;
export enum ThemeTypeEnum {
  Success = 'success',
  Primary = 'primary',
  Danger = 'danger',
  Warning = 'warning',
  Default = 'default',
  Yellow = 'yellow',
  Info = 'info',
  Blue = 'blue',
  // Brown = 'brown', // 棕色
}

/**
 * Code和Name的数据
 */
export interface CodeName {
  code: string;
  name: string;
}

/**
 * Code和Description的数据
 */
export interface CodeDescription {
  code: string;
  description: string;
}

/**
 * Key和Name的数据
 */
export interface KeyName {
  key: string;
  name: string;
}

/**
 * Name和Lang和Value的数据
 * 应用: tabs和自定义下拉列表
 */
export interface Tabs {
  name?: string; // 中文名称
  lang?: string; // 翻译
  value: string | number; // 值
}

/**
 * 分页返回通用体
 */
export interface PageResponse<T> {
  list: T[];
  total: number;
}

/**
 * 子服务JAVA返回通用体
 */
export interface SubServiceBaseResponse<T> {
  code?: string;
  data: T;
  message?: null | string;
}

/**
 * 基本返回体
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

/**
 * 活动资格返回体
 */
export interface QualificationsResponse<T = any> {
  code: string;
  data: T;
  message?: null | string;
}

/**
 * java 返回通用体
 */
export interface JResponse<T = any> {
  code: string;
  data: T;
  message?: null | string;
}

/**
 * java 返回体2
 */
export interface JResponse2<T = any> extends JResponse<T> {
  success: boolean;
}

/**
 * java MybatisPlus PageHelper 分页返回数据通用体
 */
export interface JPage<I extends Object = {}, T = I[]> {
  code: string | number;
  data?: {
    current: number;
    records: T;
    size: number;
    total: number;
  };
  message: string;
  success: boolean;
}
