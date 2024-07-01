/**
 * 兑换券状态
 */
export enum VoucherStatus {
  ReviewFail = 0, // -送审失败(可再次送审)
  Reviewing = 1, // 审核中
  ReviewReject = 2, // 审核拒绝
  IssueFail = 3, // 表示发放失败
  Unclaimed = 4, // 待领取(审核通过待领取)：Unclaimed
  Received = 5, // 已领取(发放)：Received
  InUse = 6, // 使用中：InUse
  Used = 7, // 已使用：Used
  Invalid = 8, // 已失效：Invalid
  Expired = 9, // 已过期
}

export type VoucherStatusKey = keyof typeof VoucherStatus;
export type VoucherStatusValue = (typeof VoucherStatus)[VoucherStatusKey];

/**
 * 兑换券查询请求参数
 */
export interface VoucherParams {
  createBy?: string; // 发放人员
  createTimeEnd?: string | number; // 创建时间
  createTimeStart?: string | number; // 创建时间
  current?: number; // 当前页
  gtReleaseStatus?: VoucherStatusValue; // 状态大于
  inReleaseStatus?: VoucherStatusValue[]; // 状态包含
  orderBy?: string; // 排序字段
  receivedTimeEnd?: string | number; // 领取时间
  receivedTimeStart?: string | number; // 领取时间
  releaseStatus?: VoucherStatusValue | '';
  releaseType?: number | string; // 兑换券类型 1-现金优惠券 2-投注抵用金 3-SVIP领用卷
  size?: number; // 单页数量
  sort?: string; // 排序方式 desc-倒序 asc-正序
  tenantId: number; // 商户 ID
  tmpCode?: string; // 关联模板 code
  tmpId?: number; // 关联模板 ID
  uact?: string; // 用户登录名
  uid?: string; // Uid
  voucherName?: string; // 模板名字(非多语言) 只用于后台显示
}

/**
 * 兑换券查询结果
 */
export interface VoucherItem {
  agencyId: number | null; // 关联代理表 ID
  agencyUid: string | null; // 代理的 uid
  createBy?: string | null; // 发放人员
  createTime: string; // 创建时间
  expiryTime: string; // 过期时间
  id: string;
  money: number; // 兑换券金额
  moneyType: string; // 兑换券币种
  receivedTime: string; // 领取时间
  referralCode: string | null; // 代理的 推荐码
  releaseStatus: VoucherStatusValue; // 兑换券状态 0-送审失败(可再次送审) 1-审核中 2-审核拒绝 3-表示发放失败 4-待领取(审核通过待领取)：Unclaimed 5-已领取(发放)：Received 6-使用中：InUse 7-已使用：Used 8-已失效：Invalid 9-已过期
  releaseType: number; // 兑换券类型 1-现金优惠券 2-投注抵用金 3-SVIP领用卷
  tenantId: number; // 商户id
  tmpCode: string; // 关联模板 code
  tmpId: number; // 关联模板 ID
  tmpTimes: number; // 发送次数
  uact: string; // 用户登录名
  uid: string; // UID
  updateTime: string; // 最后更新时间
  vipLevel: string | null; // VIP等级
  voucherCode: string; // 优惠券编码
  voucherName: string; // 优惠券名称
}
/**
 * 活动唯一标识枚举
 */
export enum HistoricalActivityEnum {
  NewUserFirstDepositBonus = 'f5dacf49-7870-4c68-bf36-26afe0a473821650784563336', // 新用户50%首存红利
  AllianceProgramActivity = 'f5dacf49-7870-4c68-bf36-26afe0a473821650784563333', // 联盟计划活动
  LiveBaccaratWinStreakActivity = 'f5dacf49-7870-4c68-bf36-26afe0a473821650784568428', // 真人百家乐连赢活动
  SportsCashbackUpgradePromotion = 'f5dacf49-7870-4c68-bf36-26afe0a473821650784563334', // 体育返水升级优惠
  EveryoneIsSVIP = 'everyone_svip', // 人人都是SVIP
  VIPBenefitsUpgrade = 'vipbonus_plus', // VIP福利全新升级
  NewUserSportsInsuranceBetting = 'f5dacf49-7870-4c68-bf36-26afe0a473821650784563335', // 新用户体育保险投注
  IdentityVerificationActivity = 'f5dacf49-7870-4c68-bf36-26afe0a473821650784563337', // 身份认证活动
  ReferFriend = 'recommend_friends', // 推荐好友
  TopReferences = 'top_references', // 顶级推荐人
  SportsKeepWin = 'c08d6fb8-8b5f-455f-8975-6eb1a94be24b1709617918889', //体育8连胜
  Reward = '65d60db6-5c43-4770-9f59-bd187a8eb5031711351937123', //Reward活动
}
