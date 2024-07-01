import { BaseInterface, BasePage } from './base.interface';

/**
 * 角色数据
 */
export interface Role extends BaseInterface {
  name: string;
  id?: string;
  permissions: RolePermissionList[];
  state: boolean;
  group: string;
}

/**
 * 角色权限列表
 */
export interface RolePermissionList extends BaseInterface {
  name: string;
  permissions: RolePermission[];
  subTitles: RolePermissionList[];
}

/**
 * 角色权限
 */
export interface RolePermission extends BaseInterface {
  id: number;
  name: string;
  access: boolean; // 是否选中
}

/**
 * 获取角色列表请求参数
 */
export interface RoleListParams extends BasePage {
  roleName: string; // 角色名称，馍糊搜寻
  stateOrder?: string; // DESC 降序 ASC升序
  groupId?: string;
}

/**
 * 更新角色请求参数
 */
export interface UpdateRoleParams {
  id: string;
  name: string;
  state: boolean;
  groupId: string;
}

/**
 * 创建角色权限请求参数
 */
export interface RoleCreateParams extends BaseInterface {
  roleId?: number;
  name: string;
  state: boolean; // 'Disabled' | 'Enabled';
  groupId?: number;
  permissionId: number[];
}

/**
 * 新增用户角色请求参数
 */
export interface CreateUserRoleParams extends BaseInterface {
  userId: number;
  roleId?: number;
}

/**
 * 更新用户角色请求参数
 */
export interface UpdateUserRoleParams {
  addUserRoles: CreateUserRoleParams[];
  removeUserRoles?: number[];
}
