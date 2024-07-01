/**
 * PSP自动分配策略、
 */

import { PaymentTypeEnum } from 'src/app/shared/interfaces/transaction';
import { KYCLevelEnum } from 'src/app/shared/interfaces/kyc';

/**
 * PSP规则时间单位枚举
 */
export enum TimeUnitEnum {
  Minute = 'Minute', // 分钟
  Hour = 'Hour', // 小时
  Day = 'Day', // 天
}

/**
 * PSP基础信息
 */
export interface PSPGroupBase {
  groupNameEn: string | null; // 分组名称
  groupNameLocal: string | null; // 分组名称
  remark: string; // 备注
  sort: number; // 排序
}

/**
 * PSP策略分组新增
 */
export interface PSPGroupAdd extends PSPGroupBase {
  merchantId: number;
}

/**
 * PSP策略分组更新
 */
export interface PSPGroupUpdate extends PSPGroupBase {
  id: number; // 分组id
  groupNameEn: string | null; // 分组名称
  groupNameLocal: string | null; // 分组名称
  merchantId: number | string;
}

/**
 * PSP策略分组
 */
export interface PSPGroup extends PSPGroupBase {
  id: number;
}

/**
 * PSP规则
 */
export interface PSPRuleBase {
  groupId: number; // 分组id
  ruleNameLocal?: string | null; // 规则名称
  ruleNameEn?: string | null; // 规则名称
  paymentCategory: PaymentTypeEnum; // 支付类型
  paymentMethodId: string; // 支付方式id
  isEnabled: boolean; // 是否启用
  sort: number; // 排序
  conditions: PSPRuleCondition; // 规则条件
  actions?: PSPRuleAction[]; // 规则动作
  remark?: string; // 备注
}

/**
 * PSP规则
 */
export interface PSPRuleItem extends PSPRuleBase {
  id: number; // 规则id
}

/**
 * PSP规则新增 - 请求参数
 */
export interface PSPRuleAddParams extends PSPRuleBase {
  merchantId: number;
  id?: number;
}

/**
 * PSP规则排序 - 请求参数
 */
export interface PSPRuleSortParams {
  merchantId: number;
  id: number;
  groupId: number;
  sort: number;
}

/**
 * PSP规则条件
 */
export interface PSPRuleCondition {
  currencyType?: string[];
  kycLevel?: KYCLevelEnum[]; // KYC等级
  firstDeposit?: boolean; // 首次存款
  firstPaymentMethod?: boolean; // 首次使用该支付方式存款
  vipLevelGreaterEqual?: number; // VIP等级大于等于
  vipLevelLessthenEqual?: number; // VIP等级小于等于
  depositCountGreaterEqual?: number; // 存款笔数大于等于
  depositCountLessthenEqual?: number; // 存款笔数小于等于
  withdrawalCountGreaterEqual?: number; // 提款笔数大于等于
  withdrawalCountLessthenEqual?: number; // 提款笔数小于等于

  depositAmountGreaterEqual?: number; // 存款金额大于等于
  depositAmountLessthenEqual?: number; // 存款金额小于等于
  withdrawalAmountGreaterEqual?: number; // 提款金额大于等于
  withdrawalAmountLessthenEqual?: number; // 提款金额小于等于

  depositAmountGreaterCurrency?: number; // 存款金额大于等于 - 币种单位
  depositAmountLessthenCurrency?: number; // 存款金额小于等于 - 币种单位
  withdrawalAmountGreaterCurrency?: number; // 提款金额大于等于 - 币种单位
  withdrawalAmountLessthenCurrency?: number; // 提款金额小于等于 - 币种单位

  timeUnit?: TimeUnitEnum; // 时间单位
  totalTime?: number; // 时间 接口文档定义不可空 0为立即
  totalDepositCountGreaterEqual?: number; // 总存款笔数大于等于
  totalDepositCountLessthenEqual?: number; // 总存款笔数小于等于
  totalWithdrawalCountGreaterEqual?: number; // 总提款笔数大于等于
  totalWithdrawalCountLessthenEqual?: number; // 总提款笔数小于等于
  totalDepositAmountGreaterEqual?: number; // 总存款金额大于等于
  totalDepositAmountLessthenEqual?: number; // 总存款金额小于等于
  totalWithdrawalAmountGreaterEqual?: number; // 总提款金额大于等于
  totalWithdrawalAmountLessthenEqual?: number; // 总提款金额小于等于

  totalDepositAmountGreaterCurrency?: number; // 总存款金额大于等于 - 币种单位
  totalDepositAmountLessthenCurrency?: number; // 总存款金额小于等于 - 币种单位
  totalWithdrawalAmountGreaterCurrency?: number; // 总提款金额大于等于 - 币种单位
  totalWithdrawalAmountLessthenCurrency?: number; // 总提款金额小于等于 - 币种单位
}

/**
 * PSP规则动作
 */
export interface PSPRuleAction {
  isFirst: boolean; // 是否首选
  channelId: string; // 渠道id
  channelAccountId: string; // 子渠道id
}
