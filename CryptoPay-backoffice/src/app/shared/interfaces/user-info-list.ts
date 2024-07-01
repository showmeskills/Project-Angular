export interface UserInfoUpdateParams {
  id: number;
  userName: string;
  state: string;
  tenantId: number;
  leaderId: number;
  remark: string;
  mail: string;
}

/**
 * 修改密码请求参数
 */
export interface UpdatePasswordParams {
  id?: string;
  oriPassword: string;
  newPassword: string;
  PasswordKey: string;
}

/**
 * 账号列表Item
 * @usageNotes
 *  > 该接口仅用于账号列表的item，获取详情下面部分字段不会是null
 * @Annotation
 */
export interface UserItemCustom {
  groupStatus: boolean;
  id: number;
  isResetPassword: boolean; // 根据当前权限：是否允许重置密码
  isSuperAdmin: boolean; // 是否超级管理员
  leaderId: number; // 上级id
  mail: string; // 邮箱
  remark: null; // 备注
  roleNames: string[]; // 角色名称数组
  status: any; // 'Enabled' | 'Disabled'
  tenantCode: string; // 商户Code string类型绑定的商户ID
  tenantId: number; // 商户ID number类型绑定的商户ID
  tenantName: string; // 商户名称
  userGroups: null;
  userName: string; // 用户名
  userResources: null;
  userRoles: null;
}
