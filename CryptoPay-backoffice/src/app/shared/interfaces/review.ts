/**
 * 审核 - 取消注单
 */
import { Page } from 'src/app/shared/interfaces/page';

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
export enum ReviewType {
  UnKnown = 'Unknown', // 未知
  Edit = 'Edit', // 人工编辑
  Reversal = 'Reversal', // 冲正撤单
  ManualDeposit = 'ManualDeposit', // 手动上分
}

/**
 * 审核 - 详情通用体
 */
export interface AuditDetailCommon<T = any> {
  tenantId: number; // 商户Id
  orderId: string; // 订单ID
  uid: string; // 用户ID
  userName: string; // 会员名称
  category: ReviewType; // 审核类型
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

export enum ReviewCategory {
  Unknown = 'Unknown', // 未知
  Order = 'Order', // 订单
}

/**
 * 审核审核状态
 */
export enum ReviewStatus {
  Unknown = 'Unknown', // 未知
  Processing = 'Processing', // 审核中
  Success = 'Success', // 审核成功
  Fail = 'Fail', // 审核失败
}

/**
 * 审核列表请求参数
 */
export interface MonitorListParams extends Page {
  category?: ReviewCategory;
  status?: ReviewStatus;
  startTime?: number;
  endTime?: number;
  merchantId?: string;
}

/**
 * 审核列表返回数据
 */
export interface ReviewItem {
  id: number; // 审核记录Id编号
  externalId: number; // 业务本身Id编号
  auditCategory: ReviewCategory; // 审核分类
  auditStatus: ReviewStatus; // 审核状态
  auditTime: number; // 审核时间
  auditType: ReviewType; // 审核类型
  auditUserId: number; // 审核者Id
  auditUserName: string; // 审核者姓名
  createdTime: number; // 申请时间
  createdUserId: number; // 申请者Id
  createdUserName: string; // 申请者姓名
  extraInfo: ReviewOrderInfo; // 审核的信息
  remark: string; // 备注
}

/**
 * 审核订单详情
 */
export interface ReviewOrderInfo {
  orderId: string; // 订单ID
  currency: string; // 币种
  orderAmount: number; // 订单金额
  receiveAmount: number; // 到账金额
  merchantUserAccount: string; // 商户关联的用户uid
  imagePath: string[]; // 图片路径
}

/**
 * 审核操作
 */
export interface ReviewParams {
  id: number; // 审核记录Id
  auditStatus: ReviewStatus;
  remark: string; // 备注
}
