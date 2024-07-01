/**
 * KYC地区
 */
export enum KYCRegionEnum {
  Unknown = '', // 未知
  Asia = 'Asia', // 亚洲
  Europe = 'Europe', // 欧洲
}

/**
 * KYC认证类型
 */
export enum KYCTypeEnum {
  Base = 0, // 初级
  Intermediate = 1, // 中级
  Advanced = 2, // 高级
  LiveBiometricAuthentication = 3, // 活体认证
}

/**
 * KYC审核 - 认证类型
 */
export enum KYCAuditTypeEnum {
  Primary = 'Primary', // 初级
  Intermediate = 'Intermediate', // 中级
  Senior = 'Senior', // 高级
}

/**
 * 身份认证 - tabs类型
 */
export enum AutTabsTypeEnum {
  BasisInfo = -1, // 基础信息
  Basis = 0, // KYC基础
  Intermediate = 1, // KYC中级
  Advanced = 2, // KYC高级
  RequestForDoc = 3, // 发送文件请求
  UploadSpecified = 4, // 上传指定文件
  Edd = 5, // 风险评估问卷
  RiskControl = 6, // 风控评估问卷
  WealthTitle = 7, // 财富来源证明
}

/**
 * KYC审核 - 风控审核类型
 */
export enum KYCRiskTypeEnum {
  RiskAssessment = 'RiskAssessment', // 风险评估问卷
  WealthSource = 'WealthSource', // 财富来源证明
  FullAudit = 'FullAudit', // 上传审核文件
  ID = 'ID', // 发送文件请求 - 地址证明
  POA = 'POA', // 发送文件请求 - 发送文件请求
  WealthSourceDocument = 'WealthSourceDocument', // 发送文件请求 - 补充财富来源证明
  PaymentMethod = 'PaymentMethod', // 发送文件请求 - 风险评估问卷
  Customize = 'Customize', // 发送文件请求 - 自定义
  EDD = 'EDD', // 风险评估问卷
}

/**
 * KYC审核 - 审核状态类型
 */
export enum KYCReviewTypeEnum {
  Normal = 'Normal', // 待提交
  Pending = 'Pending', // 待审核
  Rejected = 'Rejected', // 审核失败
  Finish = 'Finish', // 审核通过
  Supplement = 'Supplement', // 待补充
  Processing = 'Processing', // 审核中
  Cancel = 'Cancel', // 已取消
  TimeOut = 'TimeOut', // 已超时/已过期/已失效
}

/**
 * KYC审核列表请求参数
 */
export interface KYCProcessParams {
  uid?: string;
  updateTimestampStart?: number;
  updateTimestampEnd?: number;
  processState?: string; // 2:排除自动待审批 3:排除手动待审批
  kycType?: KYCTypeEnum; // 0-初级 1-中级 2-高级 3-活体认证
  size: number;
  page: number;
}

/**
 * KYC列表类目
 */
export interface KYCProcessItem {
  auditInfo: string | null; // 审核抛出的信息
  auditType: number; // 1-待审核
  clientKey: string; // 商户key
  clientName: string | null; // 商户名称
  createTime: string; // 创建时间
  createTimestamp: number; // 创建时间戳
  id: number;
  kycArea: string; // kyc区域
  kycCode: string; // kyc编码
  kycThirdCode: string | null; // 第三方认证类型
  kycType: KYCTypeEnum; // 0-初级 1-中级 2-高级 3-活体认证
  kycUrl: string | null; // kyc地址
  operator: string; // 操作人
  processState: number; // 审核状态
  uid: string; // 用户id
  updateTime: string; // 更新时间
  updateTimestamp: number; // 更新时间戳
}

/**
 * KYC返回通用体
 */
export interface KYCReviewResponse<T extends Object = any> {
  currPage: number;
  endNav: number;
  firstPage: number;
  lastPage: number;
  nextPage: number;
  pageCount: number;
  pageData: T[];
  pageSize: number;
  prevPage: number;
  rowCount: number;
  startNav: number;
}

/**
 * KYC报表参数
 */
export interface KYCReportParams {
  createTimeEnd?: number;
  createTimeStart?: number;
  kycType: number;
  region: KYCRegionEnum;
}
