/**
 * 调账记录状态枚举
 */
export enum BillStatusEnum {
  PENDING = 'Pending', // 等待中
  CANCEL = 'Cancel', // 已取消
  PROCESSING = 'Processing', // 进行中
  REJECTED = 'Rejected', // 已拒绝
  FINISH = 'Finish', // 已完成
}

/**
 * 更新用户角色请求参数
 */
export interface BillParams {
  Uid?: string; // 用户ID
  TenantId?: number; // 商户ID
  CreatedUserId?: number; // 申请人ID
  Type?: number; // 类型，1表示待审核，2表示历史记录
  OrderId?: string; // 订单ID
  Category?: CategoryEnum; // 类别，可选值为 UnKnown, AdjustWallet, ResetBindMobile, AbnormalMember, Activity, Edit, Reversal, CancelDisbursement, CancelWager, EnablePlayer, Coupon, SendCoupon, MemberBasicInfo
  Status: keyof typeof BillStatusEnum | string; // 状态，可选值为 Pending, Cancel, Processing, Rejected, Finish
  StartTime?: number; // 开始时间（时间戳）
  EndTime?: number; // 结束时间（时间戳）
  Page?: number; // 页码
  PageSize?: number; // 每页记录数
}

/**
 * 类别枚举
 */
export enum CategoryEnum {
  UnKnown = 'UnKnown', // 未知
  AdjustWallet = 'AdjustWallet', // 后台调账
  ResetBindMobile = 'ResetBindMobile', // 重置手机号码
  AbnormalMember = 'AbnormalMember', // 异常会员
  Activity = 'Activity11', // 活动
  Edit = 'Edit', // 人工编辑
  Reversal = 'Reversal', // 冲正撤单
  CancelDisbursement = 'CancelDisbursement', // 取消出款
  CancelWager = 'CancelWager', // 取消注单
  EnablePlayer = 'EnablePlayer', // 开启玩家
  Coupon = 'Coupon', // 券码
  SendCoupon = 'SendCoupon', // 发送券码
  MemberBasicInfo = 'MemberBasicInfo', // 用户基本信息
}

export interface BillItem {
  list: BillListInfo[];
  total: number;
}

export interface BillStatus {
  code: keyof typeof BillStatusEnum | string;
  description: string;
}

export interface QueryData {
  uid: string;
  order: string;
  time: string;
  status: keyof typeof BillStatusEnum | string;
}

/**
 * 调账列表详情
 */
interface BillListInfo {
  tenantId: number; // 商户Id
  orderId?: string; // OrderId
  uid?: string; // Uid
  mid: number; // 会员Id
  userName?: string; // 会员名称
  category: CategoryEnum; // 操作类别
  status: BillStatusEnum; // 状态
  detail?: DetailInfo; // 详情
  createdUserId?: number; // 创建者Id
  createdUserName?: string; // 创建者
  createdTime?: number; // 创建时间
  modifiedUserId?: number; // 修改者Id
  modifiedUserName?: string; // 修改者
  modifiedTime?: number; // 修改时间
}

/**
 * 列表详情信息
 */
interface DetailInfo {
  activityCode: number; // 活动code
  name: string; // 活动名称
  status: number; // 增减状态
  type: string;
}

/**
 * 提款信息
 */
export interface WithdrawalInfo {
  uid: string;
  userName: string; // 用户名
  realName: string; // 真实姓名
  bankCardList: WithdrawalInfoBankCardInfo[];
  addressList: WithdrawalInfoAddressInfo[];
}

/**
 * 提款信息 - 银行卡信息
 */
export interface WithdrawalInfoBankCardInfo {
  currency: string; // 币种
  createTime: number; // 绑定时间
  bankName: string; // 银行名称
  cardNumber: string; // 银行卡号
}

/**
 * 提款信息 - 数字货币地址信息
 */
export interface WithdrawalInfoAddressInfo {
  currency: string | null; // 币种
  createTime: number; // 绑定时间
  network: string | null; // 网络
  address: string | null; // 地址
  isEWallet: boolean; // 是否电子钱包
  paymentMethod: string | null; // 支付方式
}
