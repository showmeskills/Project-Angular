/**
 * VIPA 等级配置列表
 */
export interface VIPAItem {
  levelId: number; // 等级ID
  upgradePoints: number; // 升级所需积分
  vipLevel: number; // 等级
  vipName: string; // 等级名称
}

/**
 * VIPC 等级配置列表
 */
export interface VIPCItem {
  birthdayBonus: 120;
  cardReturn: 0.58;
  createTime: '2022-03-29 10:41:37';
  customer: 1;
  dayLimit: 12000;
  dayWithdrawLimitMoney: 2;
  firstDepositBonus: 30;
  firstDepositBonusPeriod: 2;
  firstDepositMax: 120;
  gameReturn: 0.58;
  isReturn: 1;
  keepBonus: 60;
  keepCalculatePoints: 30000;
  levelStatus: 0;
  loginRedPackage: 6;
  lotteryReturn: 0;
  optionOne: null;
  optionTwo: null;
  personReturn: 0.48;
  promotionBonus: 12000;
  promotionCalculatePoints: 50000;
  rescueMoney: 23;
  rescueMoneyMax: 200;
  sportsReturn: 0.48;
  tenantId: '1';
  updateTime: '2023-10-02 09:39:25';
  validPeriod: 1;
  validPeriodEnd: '2022-03-29 10:52:44';
  validPeriodStart: '2022-03-29 10:52:19';
  vipBasicKeepPeriod: 90;
  vipBasicNo: '2c387316-633b-43bd-807a-a2cb46c0ac661648521047264';
  vipBasicUpgradePeriod: 30;
  vipLevel: 6;
  vipLevelId: 10;
  vipLevelNo: '2c387316-633b-43bd-807a-a2cb46c0ac661648521040006';
  vipName: null;
}

/**
 * VIPA/C - 成长值配置列表项目
 */
export interface VipPointsItem {
  pointsId: number;
  tenantId: number;
  createTime: string;
  updateTime: string;
  vipTemplateId: number;
  points: number;
  pointsName: string;
  pointsType: number;
  dailyMaxPoints: number;
  pointsNameI8ncode: string;
}

/**
 * （VIPA/VIPC）会员详情：会员成长系统 - 积分记录和升级记录列表项目
 */
export interface VipPointsLevelsRecordItem {
  recordId: number;
  tenantId: number;
  createTime: string;
  createTimeTimestamp: number;
  uid: string;
  points: number;
  sourcePoints: string;
  currentTotalPoints: number;
  vipTemplateId: number;
  sourceId: string;
  currentVipLevel: number;
  id: string;
  optionOne: string;
  optionTwo: string;
  updateTime: string;
  beforeLevel: number;
  afterLevel: number;
  remark: string;
  totalPoints: number;
  upgradePoints: number;
}

/**
 * （VIPA/VIPC）会员详情：会员成长系统 - 积分统计
 */
export interface VipPointsRecordSum {
  betPoints: number;
  depositPoints: number;
  keepCycleDeadlineTime: string;
  keepCycleDeadlineTimestamp: number;
  totalPorints: number;
  upgradeEndCycleDeadlineTime: string;
  upgradeEndCycleDeadlineTimestamp: number;
  upgradeStartCycleDeadlineTime: string;
  upgradeStartCycleDeadlineTimestamp: number;
  depositWithdrawPoints: number;
  downgradeCycleDeadlineTime: string;
  downgradeCycleDeadlineTimestamp: number;
  otherPoints: number;
  totalPoints: number;
  tradPoints: number;
}
