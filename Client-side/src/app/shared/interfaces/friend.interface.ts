import { BaseInterface } from './base.interface';

/** 推荐链接下好友列表 */
export interface GetRelationList extends BaseInterface {
  total: number;
  list: Array<{
    /** 成为好友时间 */
    time: number;
    /** 关联的好友UID */
    userId: string;
  }>;
}

/** 数据总览 */
export interface DataView extends BaseInterface {
  count: number;
  countDiff: number;
  profit: number;
  profitDiff: number;
  reward: number;
  trading: number;
  tradingDiff: number;
}

/**  顶级推荐人排行榜-个人排行情况 */
export interface TopOne extends BaseInterface {
  commission: number;
  reward: number;
  uId: string;
}
/** 三个接口参数 昨日 实时 顶级推荐人排行榜-按日期查询 */
export interface TopRankParams extends BaseInterface {
  day: string;
  page: number;
  pageSize: number;
}

/** 顶级推荐人接口返回 */
export interface TopRankRepsonse extends BaseInterface {
  total: number;
  list: Array<{
    commission: number;
    date: string;
    reward: number;
    top: number;
    name: string;
    avatar: string;
    uId: string;
  }>;
}
export interface GetDataViewParams extends BaseInterface {
  beginTime: number;
  endTime: number;
}

/** 联盟总数据表格 */
export interface AgentDataView extends BaseInterface {
  adjust: number;
  bonus: number;
  income: number;
  incomeCurrency: { [key: string]: string };
  pay: number;
  platform: number;
  rebate: number;
  rebateCurrency: { [key: string]: string };
  sum: number;
  venue: number;
}

/** 默认链接返回的数据接口 */
export interface DefaultLink extends BaseInterface {
  commissionRate: number;
  commissionRatio: number;
  friendCommission: number;
  inviteCode: string;
  inviteUrl: string;
  relationSize: number;
  isDefault?: boolean;
}

/** 全部推荐接口返回数据 */
export interface GetList extends BaseInterface {
  total: number;
  list: DefaultLink[];
}

export interface GetCommissionReturnParams extends BaseInterface {
  gameType: string;
  page: number;
  pageSize: number;
}

export interface GetCommissionInviteParams extends BaseInterface {
  gameType: string;
  page: number;
  pageSize: number;
}

export interface GetCommissionTrendParams extends BaseInterface {
  type: number;
  gameType: string;
  beginTime: number;
  endTime: number;
}

export interface PostCreateLinkBody extends BaseInterface {
  FriendRate: number;
  IsDefault: boolean;
  Remark: string;
}

export interface GetRelationParams extends BaseInterface {
  inviteCode: string;
  page: number;
  pageSize: number;
}

export interface GetListParams extends BaseInterface {
  page: number;
  pageSize: number;
}

export interface UpdateRemarkBody extends BaseInterface {
  inviteCode: string;
  remark: string;
}
export interface SetUserApplyBody extends BaseInterface {
  UserId: string;
  ApplyId: string;
  IsAgreed: boolean;
}

export interface AgentApplyBody extends BaseInterface {
  channelManager: string;
  circle: string;
  contact: string;
  fansNumber: string;
  fansNumberProveUrl: string;
  industryMedia: string;
  nickname: string;
  platformAddress: string;
  platformOverview: string;
  proxyType: string;
  remarks: string;
  telegramGroup: string;
  transactionPlatform: string;
  transactionRegion: string;
  userAddress: string;
  wechat: string;
  weibo: string;
}

export interface UserApplyListParams extends BaseInterface {
  page: number;
  pageSize: number;
}

export interface CreateUserApplyBody extends BaseInterface {
  userId: string;
  mobile: string;
  inviteCode?: string;
}

export interface ShareImg extends BaseInterface {
  affiliateType: number;
  deviceType: string;
  language: string;
  proportion: string;
}
