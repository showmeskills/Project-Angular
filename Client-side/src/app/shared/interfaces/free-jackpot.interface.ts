import { BaseInterface } from './base.interface';

/**活动基础资讯 (活动header顶部) */
export interface ActivityBaseInfo extends BaseInterface {
  activityCode: string;
  activityName: string;
  startTime: number;
  endTime: number;
  settleTime: number;
  correctScore: boolean;
  winLoss: boolean;
  overUnder: boolean;
  sbv: number;
  correctScorePoints: number;
  winLossPoints: number;
  overUnderPoints: number;
  bonusType: number;
  picture: string;
  optionAmount: number;
  isJoined: boolean;
  status: number;
  maxScore: number;
  maxTotalScore: number;
}

/**活动奖励范围 (活动header中间部分) */
export interface BonusSetting extends BaseInterface {
  activityId: number;
  rankingMax: number;
  rankingMin: number;
  currency: string;
  bonus: number;
}

/**使用者参与且已结算的活动详细记录 （历史竞猜） */
export interface HistoryDetail extends BaseInterface {
  points: number;
  scoreHome: number;
  scoreAway: number;
  correctScore: boolean;
  winLoss: boolean;
  overUnder: boolean;
  scoreHomeResult: number;
  scoreAwayResult: number;
  homeIcon: string;
  awayIcon: string;
  teamLangs: TeamLangs[];
  canceled: boolean;
  isSettled: boolean;
}

/**指定使用者的参与列表 历时竞猜下拉框\排行榜列表下拉框*/
export interface HistoryList extends BaseInterface {
  activityCode: string;
  activityName: string;
}

/**使用者是否已参与和选择项目的资讯 (当前竞猜)---userOptions*/
export interface UserUoList extends BaseInterface {
  id: number;
  scoreHome: number;
  scoreAway: number;
  createdTime: string;
  modifiedTime: string;
}

/**使用者是否已参与和选择项目的资讯 (当前竞猜)---gameOptions*/
export interface UserGameList extends BaseInterface {
  id: number;
  home: string;
  away: string;
  homeIcon: string;
  awayIcon: string;
  canceled: boolean;
  teamLangs: TeamLangs[];
}

/**竞猜球队的数据类型*/
export interface TeamLangs extends BaseInterface {
  away: string;
  home: string;
  lang: string;
}

/**使用者是否已参与和选择项目的资讯 (当前竞猜)*/
export interface UserOptions extends BaseInterface {
  activityName: string;
  status: number;
  isJoined: boolean;
  lastUpdate: number;
  gameOptions: UserGameList[];
  userOptions: UserUoList[];
}

/**指定活动ID的排行榜 （排行榜列表）*/
export interface LeaderBoard extends BaseInterface {
  totalAmount: number;
  userRank: LeaderUserRank;
  leaderboardDetails: LeaderUserRank[];
}

/**指定活动ID的排行榜 （排行榜列表）当前用户置顶*/
export interface LeaderUserRank extends BaseInterface {
  ranking: number;
  userId: string;
  userAccount: string;
  correctScoreValue: number;
  winLossValue: number;
  overUnderValue: number;
  totalValue: number;
  userAvatar: string;
}

/**最近活动*/
export interface RecentActivity extends BaseInterface {
  haveRunningActivity: boolean;
  recentActivityId: string;
  activityName: string;
  runningActivityId: string;
}

/**竞猜提交*/
export interface OnUserOptions extends BaseInterface {
  id: number;
  scoreHome: number;
  scoreAway: number;
}

/**竞猜活动 ==》指定使用者的参与列表*/
export interface DetailWithList extends BaseInterface {
  currentActivityCode: string;
  activityCodes: [];
  currentActivityName: string;
  userDetails: HistoryDetail[];
  activityInfos: HistoryList[];
}
