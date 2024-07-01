import { BaseInterface, CodeName, ThemeType } from './base.interface';
import { CommonSelect } from 'src/app/shared/interfaces/select.interface';

/**
 * 代理返回数据通用体
 */
export interface AgentResponse<T = any> {
  code: number;
  data: {
    current: number;
    pages: number;
    records: T;
    size: number;
    total: number;
  };
  message: string;
  success: boolean;
}

/**
 * 团队
 */
export interface Team extends BaseInterface {
  groupName: string;
  id: number;
}

/** 审批状态 */
export type ApprovalState = CodeName;

/** 订单状态 */
export interface OrderState extends CommonSelect {
  name: string;
}

/**
 * 带主题颜色的标签类目
 */
export interface LabelItem {
  code: string;
  name: string;
  colorType: ThemeType;
}

/** 带颜色的审批状态 */
export interface LabelApprovalState extends LabelItem {
  langKey: string;
}

/** 带颜色的订单状态 */
export type LabelOrderState = LabelItem;

/**
 * 获取会员管理列表参数
 */
export interface GetMemberListParams {
  beginTime?: number; //	统计时间开始
  endTime?: number; //	统计时间结束
  registerBeginTime?: number; //	注册时间开始
  registerEndTime?: number; //	注册时间
  uid?: string; //	会员id
  page: number; //	页数
  pageSize: number; //	单页大小
  proxyId: number; // 代理id integer(int64)
}

/**
 * 获取游戏记录列表参数
 */
export interface GetGameRecordListParams {
  betBeginTime?: number; // 投注时间开始 integer(int64)
  betEndTime?: number; // 投注时间结束 integer(int64)
  providerCode?: string; // 场馆code string
  status?: number; // 状态 0未结算 1:已结算 integer(int64)
  uid?: string; // 会员id string
  page: number; // 页数	query integer(int32)
  pageSize: number; // 单页大小 integer(int32)
  proxyId: number; // 代理id integer(int64)
}
