import { Page } from 'src/app/shared/interfaces/page';

/**
 * 返回数据 - SMS&&email查询页面 - 操作类型接口数据
 */
export interface SMSEmailTypeItem {
  code: SMSEmailDto; // 操作类型code码
  description: string; // 操作类型名称
}

/**
 * 返回数据 - SMS&&email查询页面 - 列表数据
 */
export interface SMSEmailItem {
  uid: string; // 用户id
  otpCategory: string; // 验证类型,Mobile手机，Email邮箱
  otpType: SMSEmailDto; // 操作类型
  sendNumber: string; // 手机号或邮箱
  createdTime: string; // 发送时间
  status: string; // 状态 ,success:成功 ,fail:失败
  failReason: string; // 原因
}

/**
 * SMS&&email查询页面-列表数据查询参数
 */
export interface SMSEmailListParams {
  TenantId: string; // 商户id
  OtpCategory: string; // 验证类型,Mobile手机，Email邮箱
  Uid: string; // 用户id
  SendNumber: string; // 手机号或邮箱
  OtpType: SMSEmailDto; // 操作类型
  StartTime: number; // 开始时间
  EndTime: number; // 结束时间
  Status: string; // 状态 ,success:成功 ,fail:失败
  Page?: number;
  PageSize?: number;
}

/**
 * 操作类型
 */
export type SMSEmailDto = OtpTypeBase | '';
/**
 * 操作类型（接口）
 */
export type OtpTypeBase =
  | 'AddBankCard' // 添加银行卡
  | 'Withdraw' // 提款
  | 'DeleteTokenAddress' // 删除数字货币地址
  | 'JoinWhiteList' // 数字货币地址(加入白名单)
  | 'RemoveWhiteList' // 数字货币地址(移出白名单)
  | 'WhiteListSwitch' // 白名单开关
  | 'BindEmail' // 绑定邮箱
  | 'UnBindEmail' // 解绑邮箱
  | 'UnbindSocial' // 解绑社交账号
  | 'Register' // 注册
  | 'Login' // 登录
  | 'ResetPwd' // 重置密码
  | 'BindGoogleVerify' // 绑定/解绑谷歌验证码
  | 'KycMiddleVerify' // kyc中级验证
  | 'BindMobile' // 绑定/修改/解绑手机
  | 'ModifyUserName' // 修改用户名
  | 'AddTokenAddress' // 添加数字货币地址
  | 'DelBankCard' // 删除银行卡
  | 'BatchDelBankCard'; // 批量删除银行卡

/**
 *  更新会员创建渠道和推荐码接口-查询参数
 */
export interface updateChannelCodeParams {
  type: 'MyAffiliate'; // 渠道 只有MA渠道
  inviteCode: string; // 推荐码
  uidList: string; // 会员集合
}

/**
 * 日志类型类目
 */
export interface OperationTypeItem {
  operationTypeCode: string;
  operationTypeDescription: string;
}

/**
 * 日志请求参数
 */
export interface LogParams extends Page {
  operationType?: string; // 操作日志类型 (传空查全部) Available values : None, Member, Vip, Game, Auth, Common, Financial, Content, System, Bonus, Agent, UserNotice, Payment, Marketing, Wallet, RiskControl, Origin, WithdrawPass, WithdrawNotPass, WithdrawOnHold, WithdrawView
  userName?: string; // 操作人
  tenantId?: number | string; // 商户ID
  startTime?: number; // 开始时间
  endTime?: number; // 结束时间
}

/**
 * 日志类目
 */
export interface LogItem {
  content: string;
  createdTime: number;
  operationType: string;
  params: string;
  tenantId: number;
  tenantName: string;
  userName: string;
}

/**
 * OTP列表
 */
export interface OTPItem {
  tenantName: string; // 商户名称
  ipsName: string; // 服务商名称
  sendTime: number; // 请求时间戳
  countryName: string; // 国家
  mobileNo: string; // 手机号
  status: string; // 发送状态
  verifyCode: string; // 验证码
}
