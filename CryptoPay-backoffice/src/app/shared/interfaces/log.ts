import { Page } from 'src/app/shared/interfaces/page';

/**
 * 查询操作日志请求参数（后端查看操作日志）
 */
export interface LogParams extends Page {
  operationType?: string; // 操作日志类型 (传空查全部) Available values : None, Auth, Financial, Payment, System, Wallet
  userName?: string; // 操作人
  tenantId?: number | string; // 商户ID
  startTime?: number; // 开始时间
  endTime?: number; // 结束时间
  isExport?: boolean; // 是否导出
}

/**
 * 操作日志类型类目
 */
export interface OperationTypeItem {
  operationTypeCode: OperationType;
  operationTypeDescription: string;
}

/**
 * 操作日志类型
 */
export enum OperationType {
  None = 'None',
  Auth = 'Auth',
  Financial = 'Financial',
  Payment = 'Payment',
  System = 'System',
  Wallet = 'Wallet',
}

/**
 * 操作日志类目
 */
export interface OperationLogItem {
  tenantId: number;
  tenantName: string; // 商户名
  userName: string; // 操作人
  operationType: string; // 日志操作类型
  content: string; // 操作内容
  createdTime: number; // 时间
}
