import { CodeName } from 'src/app/shared/interfaces/base.interface';

/**
 * toast提示
 */
export interface Toast {
  reactivateDuration?: number; // 重新激活的持续显示时间，mouseleave会重新激活持续时间，不写为duration
  duration?: number; // 持续显示时间
  successed?: boolean; // 是否成功
  msg?: string; // 提示信息
  msgChildren?: string[]; // 折叠子信息
  msgLang?: LangKey | Array<LangKey>; // 翻译的key
  msgArgs?: LangParams; // 翻译的参数
  only?: boolean; // 相同的内容只会显示一次（每次都会重置duration显示时间）
  key?: string; // only为undefined 会自动设置为true，多个带有相同key弹出只会显示一个并后续会覆盖内容（每次都会重置duration显示时间）
  type?: 'success' | 'danger' | 'warning'; // 类型
}

/**
 * goMoney币种列表
 */
export type GoMoneyCurrency = CodeName;

/**
 * UserInfo信息
 */
export interface UserInfo {
  id: number;
  isSuperAdmin: boolean;
  leaderId: number;
  mail: string;
  remark: string;
  status: 'Enabled' | 'Disabled';
  tenantCode: string;
  tenantId: number;
  tenantName: string;
  userGroups: Array<{ id: number; name: string }>;
  userName: string;
  userResources: Array<{ id: number; name: string }>;
  userRoles: Array<any>;
}

/**
 * UserInfo信息存放数据
 */
export interface UserInfoData extends UserInfo {
  isGB: boolean;
}

/**
 * 面包屑
 */
export interface Breadcrumbs {
  name: string;
  link?: string;
  lang?: string;
  langArgs?: string;
  click?: (Breadcrumbs) => void;
}

/**
 * 语言Key
 */
export type LangKey = string;

/**
 * 语言参数
 */
export type LangParams =
  | { $path: string | number; $defaultValue: undefined | string; [key: string]: any }
  | string
  | number
  | any;

/**
 * 权限不足
 */
export interface PermissionNotEnough {
  path: string;
  name: string;
}

export type PermissionNotEnoughList = Array<PermissionNotEnough>;
