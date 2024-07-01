import { Page } from 'src/app/shared/interfaces/page';
import { KYCAuditTypeEnum } from 'src/app/shared/interfaces/kyc';

/**
 * 审核 - 取消注单
 */
export interface CancelWagerAuditParams {
  orderId: string; // 订单ID
  /**
   * Pending:1, //待处理
   * Cancel:2, //已取消
   * Processing:3, //处理中
   * Rejected:4, //已拒绝
   * Finish:5, //已完成
   */
  status: string;
  remark?: string; // 备注
  auditId: number; // 审核记录Id，是gomoney 订单记录id
}

/**
 * 审核 - 类型
 */
export enum AuditType {
  UnKnown = 0, //未知
  AdjustWallet = 1, //后台调账
  ResetBindMobile = 2, //重置手机号码
  AbnormalMember = 3, //异常会员
  Activity = 4, //活动
  Edit = 5, //人工编辑
  Reversal = 6, //冲正撤单
  CancelDisbursement = 7, //取消出款
  CancelWager = 8, //取消注单
}

/**
 * 审核 - 详情通用体
 */
export interface AuditDetailCommon<T = any> {
  tenantId: number; // 商户Id
  orderId: string; // 订单ID
  uid: string; // 用户ID
  userName: string; // 会员名称
  category: AuditType; // 审核类型
  status: string; // 审核状态
  detail: T; // 审核详情数据
  createdTime: number; // 创建时间
  createdUserId: number; // 创建人ID
  createdUserName: string; // 创建人名称
  modifiedTime: number; // 更新审核时间
  modifiedUserId: string | null; // 修改者ID
  modifiedUserName: string | null; // 修改者名称
  remark: string | null; // 拒绝备注信息
}

/**
 * 审核 - 基本状态
 * PS：请勿修改，除非您知道在做什么！！！
 */
export const ReviewBaseStatusObjEnum = {
  // Freeze：基本的4个状态！！！请勿修改，除非您知道在做什么！！！
  Normal: 'Normal', // 待提交
  Pending: 'Pending', // 待审核
  Finish: 'Finish', // 通过
  Rejected: 'Rejected', // 不通过
} as const;

export type ReviewBaseStatusEnum = (typeof ReviewBaseStatusObjEnum)[keyof typeof ReviewBaseStatusObjEnum];

/******************************************************
 * 风控审核
 ******************************************************/
export const ReviewStatusObjEnum = {
  ...ReviewBaseStatusObjEnum,
} as const;

export type ReviewStatusEnum = (typeof ReviewStatusObjEnum)[keyof typeof ReviewStatusObjEnum];

/**
 * 审核 - 请求参数
 */
export interface MonitorReviewParams<S> extends Page {
  tenantId: number | string; // 商户Id
  uid?: string; // 用户ID
  status?: S | ''; // 订单状态 Normal, Pending, Finish, Rejected
  startTime?: number; // 开始时间
  endTime?: number; // 结束时间
  type?: number; // 类型 1=待审核 2=历史记录
}

/**
 * 审核 - 风控表单类型
 */
export const RiskFormTypeObjEnum = {
  RiskAssessment: 'RiskAssessment',
  WealthSource: 'WealthSource',
  FullAudit: 'FullAudit',
  ID: 'ID',
  POA: 'POA',
  PaymentMethod: 'PaymentMethod',
  WealthSourceDocument: 'WealthSourceDocument',
  EDD: 'EDD',
  KycIntermediate: 'KycIntermediate',
  KycAdvanced: 'KycAdvanced',
  Customize: 'Customize',
} as const;
export type RiskFormTypeEnum = (typeof RiskFormTypeObjEnum)[keyof typeof RiskFormTypeObjEnum];

/**
 * 审核 - 风控审核请求参数
 */
export interface RiskReviewParams extends MonitorReviewParams<ReviewStatusEnum> {
  formType?: RiskFormTypeEnum | ''; // 风控表单类型(审核文件的类型)
}

/**
 * 审核 - 风控审核类型
 */
export const RiskTypeObjEnum = {
  RiskAssessment: 'RiskAssessment', // 1, // 风险评估问卷
  WealthSource: 'WealthSource', // 2, // 财富来源证明
  FullAudit: 'FullAudit', // 3, // 全套审核
  ID: 'ID', // 4, // ID
  POA: 'POA', // 5, // POA
  PaymentMethod: 'PaymentMethod', // 6, // 支付方式
  WealthSourceDocument: 'WealthSourceDocument', // 7, // 补充财富来源证明
  EDD: 'EDD', // 10, // 风险评估问卷
  KycIntermediate: 'KycIntermediate', // 21, // kyc中级
  KycAdvanced: 'KycAdvanced', // 22, // kyc高级
  Customize: 'Customize', // 99, // 自定义
} as const;

export type RiskTypeEnum = (typeof RiskTypeObjEnum)[keyof typeof RiskTypeObjEnum];

/**
 * 审核 - 风控审核列表
 */
export interface RiskReviewList<D extends Object = any, F extends Object = any> {
  id: number; //
  tenantId: number; // 商户Id
  mid: number; // 会员Id
  type: RiskTypeEnum; // 风控表单类型

  kycLevel: string;
  // KycPrimary:0, // 初级认证
  // KycIntermediat:1, // 中级验证
  // KycAdvanced:2, // 高级验证

  status: ReviewStatusEnum; // 风控表单审核状态

  detail: string | null | D; // 风控表单详情
  remark: string | null; // 备注
  countryCode: string | null; // kyc国家
  auditUserId: number; // 审批者Id
  auditUserName: string | null; // 审批者
  auditTime: string | null; // 审批时间
  createdUserId: number; // 创建者Id
  createdUserName: string | null; // 创建者名称
  createdTime: string | null; // 创建时间
  lastModifiedUserId: number; // 更新者Id
  lastModifiedUserName: string | null; // 更新者名称
  lastModifiedTime: string | null; // 更新时间
  uid: string | null; // 用户UID
  form: F;
}

/******************************************************
 * 存款申述
 ******************************************************/
export const DepositAppealStatusObjEnum = {
  ...ReviewBaseStatusObjEnum,
  Supplement: 'Supplement', // 待补充资料
  Processing: 'Processing', // 处理中
  Cancel: 'Cancel', // 取消
  TimeOut: 'TimeOut', // 超时
} as const;

export type DepositAppealStatusEnum = (typeof DepositAppealStatusObjEnum)[keyof typeof DepositAppealStatusObjEnum];

/**
 * 审核 - 所有的类型 放service里
 */
export const AllRiskStatusObjEnum = {
  ...DepositAppealStatusObjEnum,
};

/**
 * 审核 - 存款申述请求参数
 */
export type DepositAppealParams = MonitorReviewParams<DepositAppealStatusEnum>;

/**
 * 审核 - 存款申述历史记录请求参数
 */
export interface DepositAppealHistoryParams extends Page {
  tenantId: number | string; // 商户Id
  status?: DepositAppealStatusEnum | '';
  type?: number; // 1:存款；2：提款
}

/**
 * 审核 - 存款申述列表类目
 */
export interface DepositAppealItem {
  tenantId: number; // 商户Id
  uid: string; // 用户ID
  appealId: string; // 申诉ID
  currency: string; // 币种
  amount: number; // 金额
  createTime: number; // 申诉时间
  status: DepositAppealStatusEnum; // 状态
  isDigital: boolean; // 是否是数字货币
}

/******************************************************
 * 操作审核
 ******************************************************/
export const OperationReviewStatusObjEnum = {
  ...ReviewBaseStatusObjEnum,

  Cancel: 'Cancel', // 取消
  Processing: 'Processing', // 处理中
} as const;

export type OperationReviewStatusEnum =
  (typeof OperationReviewStatusObjEnum)[keyof typeof OperationReviewStatusObjEnum];

/**
 * 操作审核 - 分类
 */
export const OperationReviewCategoryObjEnum = {
  UnKnown: 'UnKnown', // 未知
  AdjustWallet: 'AdjustWallet', // 后台调账
  ResetBindMobile: 'ResetBindMobile', // 重置手机号码
  AbnormalMember: 'AbnormalMember', // 异常会员
  Activity: 'Activity', // 活动
  Edit: 'Edit', // 人工编辑
  Reversal: 'Reversal', // 冲正撤单
  CancelDisbursement: 'CancelDisbursement', // 取消出款
  CancelWager: 'CancelWager', // 取消注单
  EnablePlayer: 'EnablePlayer', // 开启玩家
  Coupon: 'Coupon', // 券码
  SendCoupon: 'SendCoupon', // 发送优惠券的审核类型
  MemberBasicInfo: 'MemberBasicInfo', // 会员基本信息：修改
  NegativeClear: 'NegativeClear', // 负值清零
} as const;

export type OperationReviewCategoryEnum =
  (typeof OperationReviewCategoryObjEnum)[keyof typeof OperationReviewCategoryObjEnum];

/**
 * 操作审核 - 请求参数
 */
export interface OperationReviewParams extends MonitorReviewParams<OperationReviewStatusEnum> {
  orderId?: string; // 订单ID
  createdUserId?: number | string; // 创建者Id
  category?: OperationReviewCategoryEnum; // 分类
}

/**
 * 操作审核 - 列表类目
 */
export interface OperationReviewItem<T = any> {
  tenantId: null | number; // 商户Id
  orderId: string; // 订单ID
  uid: string; // 用户ID
  mid: number; // 会员Id
  userName: null | string; // 用户名称
  category: OperationReviewCategoryEnum; // 分类
  status: OperationReviewStatusEnum; // 状态
  detail: T & {};
  createdUserId: number; // 创建者Id
  createdUserName: string; // 创建者名称
  createdTime: number; // 创建时间
  modifiedUserId: null | string; // 更新者Id
  modifiedUserName: null | string; // 更新者名称
  modifiedTime: null | number; // 更新时间
}

/******************************************************
 * 负值清零
 ******************************************************/
export const NegativeClearStatusObjEnum = {
  ...ReviewBaseStatusObjEnum,

  Cancel: 'Cancel', // 取消
  Processing: 'Processing', // 处理中
} as const;

export type NegativeClearStatusEnum = (typeof NegativeClearStatusObjEnum)[keyof typeof NegativeClearStatusObjEnum];

/**
 * 负值清零 - 分类
 */
export const NegativeClearCategoryObjEnum = {
  UnKnown: 'UnKnown', // 0, // 未知
  NegativeClear: 'NegativeClear', // 1, // 负值清零
  CreditClear: 'CreditClear', // 2, //抵用金清零
  WithdrawalLimitClear: 'WithdrawalLimitClear', // 3, // 提款流水要求手动清零
  CreditExpired: 'CreditExpired', // 4, // 抵用金过期
  WithdrawalLimitAutoClear: 'WithdrawalLimitAutoClear', // 5, // 提款流水要求自动清零
} as const;

export type NegativeClearCategoryEnum =
  (typeof NegativeClearCategoryObjEnum)[keyof typeof NegativeClearCategoryObjEnum];

/**
 * 负值清零 - 请求参数
 */
export interface NegativeClearParams extends MonitorReviewParams<NegativeClearStatusEnum> {
  orderId?: string; // 订单ID
  category?: NegativeClearCategoryEnum; // 分类
}

/**
 * 负值清零 - 详情
 */
export interface NegativeClearDetail {
  riskLevel: number; // 信用风控等级
  currency: string; // 币种
  amount: number; // 金额
  usdtRate: number; // 汇率
}

/**
 * 负值清零 - 列表类目
 */
export interface NegativeClearItem {
  category: NegativeClearCategoryEnum; // 分类
  status: NegativeClearStatusEnum; // 状态
  detail: NegativeClearDetail;
  orderId: string; // 订单Id
  uid: string | null; // Uid
  userName: string | null; // 会员名称
  usdtTotal: number; // 累计usdt金额
  createdTime: number; // 创建时间
  modifiedUserId: number | null; // 修改者Id
  modifiedUserName: string | null; // 修改者
  modifiedTime: number | null; // 修改时间
}

export const AbnormalMemberStatusObjEnum = {
  ...ReviewBaseStatusObjEnum,

  Cancel: 'Cancel', // 取消
  Processing: 'Processing', // 处理中
} as const;

export type AbnormalMemberStatusEnum = (typeof AbnormalMemberStatusObjEnum)[keyof typeof AbnormalMemberStatusObjEnum];

/**
 * 异常会员 - 分类
 */
export const AbnormalMemberCategoryObjEnum = {
  ...OperationReviewCategoryObjEnum,
} as const;

export type AbnormalMemberCategoryEnum =
  (typeof AbnormalMemberCategoryObjEnum)[keyof typeof AbnormalMemberCategoryObjEnum];

/**
 * 异常会员 - 请求参数
 */
export interface AbnormalMemberParams extends MonitorReviewParams<AbnormalMemberStatusEnum> {
  orderId?: string; // 订单ID
  createdUserId?: number | string; // 创建者Id
  category?: AbnormalMemberCategoryEnum; // 分类
}

/**
 * 异常会员 - 列表类目
 */
export interface AbnormalMemberItem extends OperationReviewItem {
  category: AbnormalMemberCategoryEnum; // 分类
  status: AbnormalMemberStatusEnum; // 状态
}

/******************************************************
 * KYC审核
 ******************************************************/
export interface KYCReviewParams extends MonitorReviewParams<ReviewBaseStatusEnum> {
  countryCode?: string; // kyc国家
  formType?: RiskFormTypeEnum | ''; // 风控表单类型(审核文件的类型)
}

/**
 * KYC审核 - 列表类目
 */
export interface KYCReviewItem {
  id: number; // id
  uid: string; // 用户ID
  type: KYCAuditTypeEnum; // kyc审核等级类型
  status: ReviewBaseStatusEnum; // 状态
  countryCode: string; // kyc国家
  updateTime: string; // 更新时间
  operator: string; // 审核人
  createTime: string; // 提交时间
  auditInfo?: string | null; // 失败原因
  auditType: number; // 是否人工审核 1=人工审核 0=系统自动审核
}

/******************************************************
 * 反水审核
 ******************************************************/
/**
 * 反水审核 - 分类
 */
export const TransactionReviewCategoryObjEnum = {
  UnKnown: 'UnKnown', // 未知
  AdjustWallet: 'AdjustWallet', // 后台调账
  ResetBindMobile: 'ResetBindMobile', // 重置手机号码
  AbnormalMember: 'AbnormalMember', // 异常会员
  Activity: 'Activity', // 活动
  Edit: 'Edit', // 人工编辑
  Reversal: 'Reversal', // 冲正撤单
  CancelDisbursement: 'CancelDisbursement', // 取消出款
  CancelWager: 'CancelWager', // 取消注单
  EnablePlayer: 'EnablePlayer', // 开启玩家
  Coupon: 'Coupon', // 券码
  SendCoupon: 'SendCoupon', // 发送优惠券的审核类型
  MemberBasicInfo: 'MemberBasicInfo', // 会员基本信息：修改
  Transaction: 'Transaction', // 反水审核
} as const;

export type TransactionReviewCategoryEnum =
  (typeof TransactionReviewCategoryObjEnum)[keyof typeof TransactionReviewCategoryObjEnum];

/**
 * 反水审核 - 列表类目
 */
export interface TransactionReviewItem<T = any> {
  tenantId: null | number; // 商户Id
  orderId: string; // 订单ID
  uid: string; // 用户ID
  mid: number; // 会员Id
  userName: null | string; // 用户名称
  category: TransactionReviewCategoryEnum; // 分类
  status: OperationReviewStatusEnum; // 状态
  detail: T & {};
  createdUserId: number; // 创建者Id
  createdUserName: string; // 创建者名称
  createdTime: number; // 创建时间
  modifiedUserId: null | string; // 更新者Id
  modifiedUserName: null | string; // 更新者名称
  modifiedTime: null | number; // 更新时间
  auditRemark: null | string; //审核时候的备注，如果有的话
}
/*****************************************************************************
 *                                待补充列表
 ****************************************************************************/

export const PendingedCategoryObjEnum = {
  Risk: 'Risk',
  Kyc: 'Kyc',
} as const;

export type PendingedCategoryEnum = (typeof PendingedCategoryObjEnum)[keyof typeof PendingedCategoryObjEnum];
