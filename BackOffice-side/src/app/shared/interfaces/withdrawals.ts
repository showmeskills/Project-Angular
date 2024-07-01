/**
 * 获取 提款配置策略分组
 */
export interface WithdrawalConfigGroup {
  id: number;
  tenantId: number; // 商户id
  groupName: string; // 分组名称
  remark: string; // 备注
  priority: number; // 排序值
}

/**
 * 排序 提款配置策略分组
 */
export interface WithdrawalConfigGroupSortItemParams {
  tenantId: number; // 商户id
  groupId: number; // 分组id
  priority: number; // 排序值
}

/**
 * 提款配置策略 - KYC枚举 （Parker自定义的 不通用kyc的枚举）
 */
export const WithdrawalStrategyKycObjEnum = {
  KycPrimary: 'KycPrimary', // 初级认证 = 0
  KycIntermediat: 'KycIntermediat', // 中级验证 = 1
  KycAdvanced: 'KycAdvanced', // 高级验证 = 2
} as const;

export type WithdrawalStrategyKycEnum =
  (typeof WithdrawalStrategyKycObjEnum)[keyof typeof WithdrawalStrategyKycObjEnum];

/**
 * 提款配置策略 - 时间单位枚举
 */
export const WithdrawalStrategyTimeUnitObjEnum = {
  Minute: 'Minute', // 分钟 = 0
  Hour: 'Hour', // 小时 = 1
  Day: 'Day', // 天 = 2
} as const;

export type WithdrawalStrategyTimeUnitEnum =
  (typeof WithdrawalStrategyTimeUnitObjEnum)[keyof typeof WithdrawalStrategyTimeUnitObjEnum];

/**
 * 提款策略 - 条件
 */
export interface WithdrawalStrategyCondition {
  isTest?: boolean; // 是否测试用户
  firstWithdrawal?: boolean; // 是否首次提款
  firstWithdrawalAttempt?: boolean; // 首次提款尝试（失败/过期/未分配到PSP）
  ipAddress?: string; // IP地址
  ipCountry?: string[]; // ip国家
  locationMatch?: string; // 地址条件符合
  ngrComparison?: string; // ngr比较
  ngrValue?: number; // ngr值
  ngrIsNegative?: boolean; // ngr是否为负数
  kycLevels?: WithdrawalStrategyKycEnum[];
  riskControls?: string[]; // 风控等级
  amountMorethen?: number; // 订单交易金额大于
  amountLessthen?: number; // 订单交易金额小于
  currencyType?: string; // 订单交易币种
  vipLevelMorethen?: number; // vip等级大于
  vipLevelLessthen?: number; // vip等级小于
  paymentMethod?: string; // 支付方式
  totalTime?: number; // 总计时间范围内
  timeUnit?: WithdrawalStrategyTimeUnitEnum; // 时间单位
  totalAmountMorethen?: number; // 单位时间内总提款大于
  totalAmountLessthen?: number; // 单位时间内总提款小于
  totalWithdrawalCount?: number; // 单位时间总成功提款参数
}

/**
 * 提款策略 - 枚举审核类型
 */
export const WithdrawalStrategyApprovalObjEnum = {
  Approved: 'Approved', // 通过 = 0
  NoApproved: 'NoApproved', // 拒绝 = 1
} as const;

export type WithdrawalStrategyApprovalEnum =
  (typeof WithdrawalStrategyApprovalObjEnum)[keyof typeof WithdrawalStrategyApprovalObjEnum];

/**
 * 提款策略 - 枚举审核方式
 */
export const WithdrawalStrategyApprovalMethodObjEnum = {
  Auto: 'Auto', // 自动 = 0
  First: 'First', // 一审 = 1
  Secend: 'Secend', // 二审 = 2
} as const;

export type WithdrawalStrategyApprovalMethodEnum =
  (typeof WithdrawalStrategyApprovalMethodObjEnum)[keyof typeof WithdrawalStrategyApprovalMethodObjEnum];

/**
 * 提款策略 - 操作
 */
export interface WithdrawalStrategyAction {
  operation: WithdrawalStrategyApprovalEnum; // 审核操作
  auditOperationMethod: WithdrawalStrategyApprovalMethodEnum | null; // 审核操作方式
  delay: number; // 延迟时间设定 如果是 0 表示立即执行
  timeUnit: WithdrawalStrategyTimeUnitEnum;
}

/**
 * 提款配置策略 - 类目
 */
export interface WithdrawalStrategyItem {
  withdrawalConditions: WithdrawalStrategyCondition;
  withdrawalActions: WithdrawalStrategyAction;
  tenantId: number; // 商户id
  policyName?: string | null; // 策略名称
  enabled: boolean; // 是否启用
  groupId: number; // 分组id
  remark?: string; // 备注
}

/**
 * 提款配置策略 - 响应
 */
export interface WithdrawalStrategyResponse extends WithdrawalStrategyItem {
  priority: number; // 优先级(排序值)
}

/**
 * 提款配置策略 - 参数
 */
export interface WithdrawalStrategyParams {
  tenantId: number; // 商户id
  groupId: number; // 分组id
  withdrawalConfigItems: WithdrawalStrategyItem[]; // 策略列表 - 商户配置列表
}
