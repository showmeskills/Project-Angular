/**
 * 竞赛-列表数据查询参数
 */
export interface ContestListParams {
  Current: number; // 页数
  Size: number; // 单页数量
  TenantId: number | string; // 商户 ID
  TmpStartTime?: string; // 模板开始执行时间
  TmpEndTime?: string; // 模板结束执行时间
  TmpName?: string; // 活动名称(非多语言)
}

/**
 * 竞赛-列表返回数据
 */
export interface ContestListItem {
  current: number; // 当前页数
  pages: number; // 总页数
  size: number; // 每页数量
  total: number; // 总记录数
  records: PageRecordsInfo[]; // 记录列表
}
export interface PageRecordsInfo {
  country: string[]; // 国家列表
  currency: string[]; // 货币列表
  executeType: number; // 执行类型
  gameTypeNumber: number; // 游戏类型编号
  id: string; // 记录ID
  period?: number; // 期数
  periodEnd?: string; // 期数结束时间
  periodStart?: string; // 期数开始时间
  rankNum: number[]; // 排名
  tenantId: number; // 商户ID
  tmpCode?: string; // 模板代码
  tmpEndTime?: string; // 模板结束时间
  tmpName?: string; // 模板名称
  tmpStartTime?: string; // 模板开始时间
  tmpState?: string; // 模板状态
  tmpTypeName?: string; // 模板类型名称
}
/**
 * 竞猜-列表数据查询参数
 */
export interface QuizListParams {
  TenantId?: number | string; // 商户id
  ActivityName?: string; // 模板名称
  StartTime?: number; // 活动开始时间戳（单位：毫秒）
  EndTime?: number; // 活动结束时间戳（单位：毫秒）
  PageIndex?: number; // 页码（默认:1）
  PageSize?: number; // 一页数量（默认：50）
}

/**
 * 竞猜-列表数据查询参数
 */
export interface QuizListItem {
  totalCount: number; // 总活动数量
  activities: ActivitiesInfo[]; // 活动列表
}

export interface ActivitiesInfo {
  activityCode?: string; // 活动代码
  activityName?: string; // 活动名称
  endTime: number; // 活动结束时间戳（单位：毫秒）
  id: number; // 活动ID
  startTime: number; // 活动开始时间戳（单位：毫秒）
  status: number; // 活动状态
  templateName?: string; // 模板名称
}
