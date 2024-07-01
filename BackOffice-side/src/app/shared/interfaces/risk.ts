// import { BaseInterface, BasePage } from './base.interface';

import { Page } from 'src/app/shared/interfaces/page';
import { PageResponse } from 'src/app/shared/interfaces/base.interface';
import {
  AdjustmentCategoryEnum,
  AdjustmentCategoryKeyEnum,
  AdjustmentTypeEnum,
  AdjustmentTypeKeyEnum,
} from 'src/app/shared/interfaces/member.interface';

/**
 * 批量类型
 */
export enum BatchTypeEnum {
  Risk = 1, // 批量风控
  Remarks = 2, // 批量备注
  Adjustment = 3, // 批量调账
  Prohibited = 4, // 批量禁用
}

/**
 * 批量操作风控 - 信息
 */
export interface BatchRiskInfo {
  uid?: string; // 用户id
  riskLevel: string; // 风控等级 Enum: [R1, R2, R3, R4, R5]
  remarks?: string; // 备注
}

/**
 * 批量操作风控 - 响应体
 */
export interface BatchRiskResponse {
  batchId?: string; // 批次号
  info: BatchRiskInfo[];
}

/**
 * 批量操作调账 - 请求参数
 */
export interface BatchAdjustmentParams {
  tenantId: number; // 商户Id
  info: BatchAdjustmentInfo[];
}

/**
 * 批量操作调账 - 信息
 */
export interface BatchAdjustmentInfo {
  uid: string;
  category: AdjustmentCategoryEnum; // 调账种类: Main:1=主钱包   Bonus:6=红利钱包  WithdrawLimit:99=提款流水要求  Ag:20006=AG钱包  Ky:40010=开元钱包  Rg:40016=雷竞技钱包
  currency: string; // 币种
  amount: number; // 调账金额
  withdrawLimit: number; // 提款流水要求
  remark: string; // 备注
  adjustType: AdjustmentTypeEnum; // 调账类型
  baseId?: string; // 厂商分类id
  providerId?: string; // 厂商id
  gameCategory?: string; // Enum: [ SportsBook, Esports, Lottery, LiveCasino, SlotGame, Chess ]
  attachmentList: string[]; // 附件
}

/**
 * 批量操作备注 - 响应体
 */
export interface BatchRemarkResponse {
  batchId?: string; // 批次号
  info: BatchRemarkInfo[];
}

/**
 * 批量操作备注 - 信息
 */
export interface BatchRemarkInfo {
  uid?: string | null; // 用户id
  remarks?: string | null; // 备注
}

/**
 * 批量操作禁用 - 请求参数
 */
export interface BatchProhibitedParams {
  tenantId: number; // 商户Id
  info: BatchProhibitedInfo[];
  batchId?: string; // 批量ID
  isExcel?: boolean;
}

/**
 * 批量操作禁用 - 响应体
 */
export interface BatchSubmitResponse {
  batchId: string; // 批量ID
  message: null | string;
  succes: boolean;
}
/**
 * 批量操作禁用 - 响应体
 */
export interface BatchUpSubmitResponse {
  batchId: string; // 批量ID
  info: BatchProhibitedInfo[];
}
/**
 * 批量操作禁用 - 信息
 */
export interface BatchProhibitedInfo {
  uid: string;
  isLoginDisable: boolean; // 是否禁用登录
  isForbidLoginForever: boolean; // 是否终生禁止登陆 （不是终生，那么就是指定开始，结束时间） true：是 false：否
  forbidLoginStartTime: number; // 禁用开始时间 （终生禁止给0 ）
  forbidLoginEndTime: number; // 禁用结束时间 （终生禁止给0 ）
  isForbidGameForever: boolean; // 是否终生禁止游戏 （不是终生，那么就是指定开始，结束时间） true：是 false：否
  forbidGameStartTime: number; // 禁用游戏开始时间 （终生禁止给0 ）
  forbidGameEndTime: number; // 禁用游戏结束时间 （终生禁止给0 ）
  gameCodes: string[]; // 用户禁用游戏的厂商id
  isForbidPaymentForever: boolean; // 是否终生禁止支付方式 （不是终生，那么就是指定开始，结束时间） true：是 false：否
  forbidPaymentStartTime: number; // 禁用支付方式开始时间 （终生禁止给0 ）
  forbidPaymentEndTime: number; // 禁用支付方式结束时间 （终生禁止给0 ）
  depositType: string[]; // 存款方式 Legal:1    BankCard:2
  withdrawType: string[]; // 提款方式  Legal:1    Encryption:2
  isPaymentDisable?: boolean;
}

/**
 * 批量操作列表 - 请求参数
 */
export interface BatchListParams extends Page {
  tenantId: string | number; // 商户Id
  batchId?: string; // 批次号
  applicant?: string; // 操作人
  batchType?: string; // 类型，给空是查全部
  startTime?: number; // 开始时间
  endTime?: number; // 结束时间
}

/**
 * 批量操作列表 - 返回体
 */
export interface BatchListItem<T extends Object = any> {
  id: number;
  tenantId: number; // 商户Id
  mid: number;
  uid: string; // 用户Id
  batchId: string; // 批量id
  applicant: string; // 操作人
  status: string; // 状态
  batchType: BatchTypeEnum; // 类型
  applicationDate: number; // 提交时间
  completionDate: number; // 完成时间
  info: BatchListInfo<T>[]; // 批量下信息
}

/**
 * 批量操作列表 - 信息
 */
export interface BatchListInfo<T extends Object = any> {
  applicationDate: number; // 提交时间
  batchId: string; // 批量id
  completionDate: number; // 完成时间
  detail: T;
  id: number;
  mid: number;
  status: string; // 批量状态  Pending:1 Failed:2 Partially:3 Success:4
  tenantId: number; // 商户Id
  uid: string; // 会员Id
}

/**
 * 批量操作列表 - 调账产品
 */
export interface BatchListAdjustmentProduct {
  baseId: null | string; // 厂商分类id
  providerId: null | string; // 厂商id
  gameCategory: null | string; // Enum: [ SportsBook, Esports, Lottery, LiveCasino, SlotGame, Chess ]
}

/**
 * 批量操作列表 - 调账详情
 */
export interface BatchListAdjustmentDetail {
  amount: number; // 调账金额
  balance: number; // 调账后余额
  category: AdjustmentCategoryKeyEnum; // 调账种类
  currency: string; // 币种
  rejectRemark: string | null; // 驳回原因
  remark: string; // 备注
  withdrawLimit: number; // 提款流水要求
  adjustType: AdjustmentTypeKeyEnum;
  attachmentList: string[]; // 附件
  adjustTypeSubclass: BatchListAdjustmentProduct;
}

/**
 * 批量操作列表 - 风控详情
 */
export interface BatchListRiskDetail {
  originalRiskControl: string; // 原风控等级
  rejectRemark: string; // 驳回原因
  remark: string | null; // 备注
  riskControl: string; // 调整后的风控等级
}

/**
 * 批量操作列表 - 禁用详情
 */
export interface BatchListProhibitedDetail {
  isLoginDisable: boolean; // 是否禁用登录
  isForbidLoginForever: boolean; // 是否终生禁止登陆 （不是终生，那么就是指定开始，结束时间） true：是 false：否
  forbidLoginStartTime: number; // 禁用开始时间 （终生禁止给0 ）
  forbidLoginEndTime: number; // 禁用结束时间 （终生禁止给0 ）
  isForbidGameForever: boolean; // 是否终生禁止游戏 （不是终生，那么就是指定开始，结束时间） true：是 false：否
  forbidGameStartTime: number; // 禁用游戏开始时间 （终生禁止给0 ）
  forbidGameEndTime: number; // 禁用游戏结束时间 （终生禁止给0 ）
  gameCodes: string[]; // 用户禁用游戏的厂商id
  isForbidPaymentForever: boolean; // 是否终生禁止支付方式 （不是终生，那么就是指定开始，结束时间） true：是 false：否
  forbidPaymentStartTime: number; // 禁用支付方式开始时间 （终生禁止给0 ）
  forbidPaymentEndTime: number; // 禁用支付方式结束时间 （终生禁止给0 ）
  depositType: string[]; // 存款方式 Legal:1    BankCard:2
  withdrawType: string[]; // 提款方式  Legal:1    Encryption:2
}

/**
 * 批量操作列表 - 备注详情
 */
export interface BatchListRemarkDetail {
  remark: string | null; // 备注
}

/*********************************************************************************************
 * 批量操作审核列表 - 请求参数
 */
export interface BatchReviewListParams extends Page {
  tenantId: string | number; // 商户Id
  batchId?: string; // 批量id
  batchType?: string; // 类型，给空是查全部
  startTime?: number; // 开始时间
  endTime?: number; // 结束时间
  type?: number; // 类型 =1待审核 =2历史记录
}

/**
 * 批量操作审核列表 - 返回体
 */
export type BatchReviewListItem<T extends Object = any> = BatchListItem<T>;

/**
 * 批量审核 - 请求参数
 */
export interface BatchReviewParams {
  id: number; // 审核id
  tenantId: number; // 商户id
  batchType: BatchTypeEnum; // 批量类型
  info: BatchReviewInfoParams[];
}

/**
 * 批量审核 - 信息参数
 */
export interface BatchReviewInfoParams {
  status: string; //  Pending:1 Failed:2 Partially:3 Success:4 批量状态
  reviewId: number; // 每个子项的id
  remark: string; // 拒绝，备注
}

/********************************************************************************************
 * 更新用户角色请求参数
 */
export interface UploadIdVerificationParams {
  id: number;
  country: string; // 国家
  idType: string; // 证件类型
  frontImage: string; // 正面照片
  backImage?: string; // 反面照片
  originalFrontImageName: string | undefined; // 正面照片文件名
  originalBackImageName?: string | undefined; // 反面照片文件名
}

/**
 * 最优胜的用户和厂商报表 枚举排序字段
 */
export enum WinnerTopSortEnum {
  payout = 0, // 下注流水
  wager = 1, // 输赢
  margin = 2, // 盈利率
}

/**
 * 最优胜的日期报表 枚举排序字段
 */
export enum WinnerTopSortByDateEnum {
  payout = 0, // 下注流水
  wager = 1, // 输赢
  margin = 2, // 盈利率
  date = 3, // 日期
}

/**
 * 最优胜的用户报表 会员最优胜列表 - 请求参数
 */
export interface WinnerTopBaseParams extends Page {
  tenantId: string | number; // 商户Id
  uid?: string | number; // 用户Id
  beginDate?: string; // 开始时间
  endDate?: string; // 结束时间
  sort?: number | ''; // 排序  0=降序 1=升序
}

export interface WinnerTopByUserParams extends WinnerTopBaseParams {
  sortBy?: WinnerTopSortEnum | ''; // 排序字段 排序0=输赢   1=流水   2=盈利率
}

/**
 * 最优胜的厂商报表 - 请求参数
 */
export interface WinnerTopByProviderParams extends WinnerTopBaseParams {
  sortBy?: WinnerTopSortEnum | ''; // 排序字段 排序0=输赢   1=流水   2=盈利率
}

/**
 * 最优胜的日期报表 - 请求参数
 */
export interface WinnerTopByDateParams extends WinnerTopBaseParams {
  sortBy?: WinnerTopSortByDateEnum | ''; // 排序字段 排序0=输赢   1=流水   2=盈利率  3=日期
}

/**
 * 最优胜的用户报表 会员最优胜列表 - 返回体类目
 */
export interface WinnerTopByUserItem {
  uid: string; // Uid
  wager: number; // 下注流水
  payout: number; // 输赢
  margin: number; // 盈利率
  sort: number; // 序号
  playedGameInfo: null | string;
  totalDeposit: number; // 总存款
  totalWithdraw: number; // 总提款
  totalActiveFlowUsdt: number; // 总有效流水
  totalBonus: number; // 总红利
  vipGrade: number; // VIP等级
  registerTime: number; //注册日期
  ngrTotal: number; //NGR (赌博净利总额)
}

/**
 * 最优胜的厂商报表 - 返回体类目
 */
export interface WinnerTopByProviderItem {
  uid: string; // Uid
  provider: string | null; // 厂商
  wager: number; // 下注流水
  payout: number; // 输赢
  margin: number; // 盈利率
  sort: number; // 序号
}

/**
 * 最优胜的日期报表 - 返回体类目
 */
export interface WinnerTopByDateItem {
  uid: string; // Uid
  date: string | null; // 日期
  wager: number; // 下注流水
  payout: number; // 输赢
  margin: number; // 盈利率
  sort: number; // 序号
  playedGameInfo: null | string;
  totalDeposit: number; // 总存款
  totalWithdraw: number; // 总提款
  totalActiveFlowUsdt: number; // 总有效流水
  totalBonus: number; // 总红利
  vipGrade: number; // VIP等级
  registerTime: number; //注册日期
  ngrTotal: number; //NGR (赌博净利总额)
}

/**
 * 最优胜的用户报表 会员最优胜列表 - 返回体 统计
 */
export interface WinnerTopByUserStat {
  wagerTotal: number; // 下注流水总计
  payoutTotal: number; // 输赢总计
  marginAvg: number; // 平均盈利率
}

/**
 * 最优胜报表 - 返回体+统计
 */
export interface WinnerTopResponse<T> extends PageResponse<T> {
  statData: WinnerTopByUserStat; // 统计
}

/**
 * 风控列表
 */
export interface RiskLevelItem {
  label: string;
  value: string;
}

/** 获取风控配置 */
export interface RiskControlConfig {
  r1: {
    activityCodes: string[];
  };
  r2: {
    activityCodes: string[];
  };
  r3: {
    activityCodes: string[];
  };
  r4: {
    activityCodes: string[];
  };
  r5: {
    activityCodes: string[];
  };
}

export interface RiskControlConfigParams extends RiskControlConfig {
  tenantId: string;
}

/**
 * 设备指纹 - 列表类目
 */
export interface FingerprintItem {
  fingerprint: string;
  createTime: number;
  userCount: number;
  expand: boolean | undefined;
}

/**
 * 设备指纹 - 详情列表类目
 */
export interface FingerprintDetialItem {
  uid: string;
  createTime: number;
  dispostAmountUsdt: number;
  withdrawalAmountUsdt: number;
  status: string;
}
