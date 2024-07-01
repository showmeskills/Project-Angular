/**
 * 修稿账号请求参数
 */
export interface UserInfoUpdateParams {
  id: number;
  userName: string;
  state: string; // Disabled, Enabled, None
  tenantId: number | string;
  leaderId?: number;
  remark?: string;
  mail: string;
  isSuperAdmin: boolean; // 是否是超级管理员
  groupStatus?: boolean; // 群组状态 开启代表该账号是市场账号，可以被加入群组。关闭则不可以被加入群组
  isTenantSuperAdmin?: boolean; // 是否是商户超级管理员
  continentalities: { id: number; name: string }[]; // 地区 region
  userResources: { id: number; name: string }[]; // 用户资源
  userGroups?: { id: number; name: string }[]; // 用户群组
  userRoles: { id: number; name: string }[]; // 用户角色
  /** 是否是经理账号 */
  isAccountManager: boolean;
  /** 经理账号名称 */
  accountManagerName: string;
}

/**
 * 账号详情
 */
export interface UserInfoDetail extends Omit<UserInfoUpdateParams, 'state'> {
  isResetPassword: false;
  tenantCode: string; // 商户代码 字符串的商户id
  tenantId: number; // 商户id
  tenantName: string; // 商户名称
  status: string; // 账号状态 Disabled, Enabled, None
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
