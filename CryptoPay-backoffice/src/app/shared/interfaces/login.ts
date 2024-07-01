/**
 * 登录返回值
 */
export interface LoginResult {
  isDefaultPassword: boolean;
  token: string;
}

/**
 * 修改密码模态框返回值
 */
export interface ModifyPasswordModalResult {
  success: boolean;
  newPassword;
}

/**
 * 登录流程自定义错误枚举
 */
export enum LoginErrorEnum {
  // 这里值自定义的，不是后端返回，但需要枚举值为字符串
  Normal = 'Normal',
  RestPassword = 'RestPassword',
}

/**
 * 登录请求参数
 */
export interface Login {
  tenantId: number;
  userName: string;
  password: string;
  passwordKey: string;
}
