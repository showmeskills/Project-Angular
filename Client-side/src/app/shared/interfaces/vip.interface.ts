export interface UserVipData {
  /**用户生日 yyyy-MM-dd */
  birthDayTime: string;
  /**创建时间 */
  createTime: number;
  /**当前用户存款 */
  currentDeposit: number;
  /**当前用户流水 */
  currentFlows: number;
  /**当前用户积分 */
  currentPoints: number;
  /**当前累计点数 */
  currentTotalPoints: number;
  /**当前vip失效时间 */
  currentVipInvalidTime: number;
  /**当前用户等级 */
  currentVipLevel: number;
  /**降级更新时间 */
  downgradeUpdateTime: number;
  /**kyc认证 验证类型 1：初级验证 2：中级验证 3：高级验证 */
  isCertType: number;
  /**是否svip 0不是 1是 */
  isSvip: number;
  /**保级点数 */
  keepPoints: number;
  /**保级到期日 */
  keepTime: number;
  /**保级更新时间 */
  keepUpdateTime: number;
  /**距离下一级所需要的点数*/
  nextLevelPoints: number;
  /**备用字段1 */
  optionOne: string;
  /**备用字段2 */
  optionTwo: string;
  /**升级进度 */
  process: number;
  /**保级进度 */
  processKeep: number;
  /**svip的生效时间 */
  svipCreateTime: number;
  /**svip的失效时间 */
  svipInvalidTime: number;
  /**商户ID */
  tenantId: number;
  /**Uid */
  uid: string;
  /**更新时间 */
  updateTime: number;
  /**升级更新时间 */
  upgradeUpdateTime: number;
  /**用户状态 1有效 2禁用 3异常用 */
  userStatus: number;
  /**等级注额 */
  vipBet: number;
  /**等级存款 */
  vipDeposit: number;
  /**会员名 */
  userName: string;
  /**vip总红利 usdt */
  totalBonus: number;
}

export interface VipSimpleListData {
  /**等级Id */
  levelId: number;
  /**VIP等级 */
  vipLevel: number;
  /**VIP等级名称 */
  vipName: string;
  /**晋级成才值 */
  upgradePoints: number;
}

export interface VipDetailListData {
  /**生日红利 */
  birthdayBonus: number;
  /**娱乐场反水 */
  casinoCashback: number;
  /**棋牌反水 */
  chessCashback: number;
  /**创建时间 */
  createTime: number;
  /**单日反水上限 */
  dailyCashbackLimit: number;
  /**单日上限 */
  dayLimit: number;
  /**日累计提款限额 */
  dayWithdrawLimitMoney: number;
  /**首存红利比例 */
  firstDepositBonus: number;
  /**周存款福利 */
  firstDepositBonusPeriod: number;
  /**首存红利上限 */
  firstDepositMax: number;
  /**保级红利 */
  keepBonus: number;
  /**保级成才值 */
  keepPeriodPoints: number;
  /**等级主键 */
  levelId: number;
  /**级别状态 1:无效 2:有效 */
  levelStatus: number;
  /**真人反水 */
  liveCashback: number;
  /**登陆红包 */
  loginRedPackage: number;
  /**彩票返水 */
  lotteryCashback: number;
  /**救援金 */
  rescueMoney: number;
  /**救援金最大 */
  rescueMoneyMax: number;
  /**小游戏返水 */
  slotCashback: number;
  /**体育返水 */
  sportsCashback: number;
  /**商户号 */
  tenantId: number;
  /**更新时间 */
  updateTime: number;
  /**升级红包 */
  upgradeBonus: number;
  /**晋级成才值 */
  upgradePoints: number;
  /**有效周期 */
  validPeriod: number;
  /**有效期结束 */
  validPeriodEnd: number;
  /**有效期开始 */
  validPeriodStart: number;
  /**VIP分组ID */
  vipGroupId: number;
  /**VIP级别 */
  vipLevel: number;
  /**VIP级别名称 */
  vipName: string;
  /**模板ID */
  vipTemplateId: number;
}

export interface VipTemplateInfo {
  /**创建时间 */
  createTime: number;
  /**首存红利周期 */
  depositBonusPeriod: number;
  /**模板有效期结束 */
  endDate: number;
  /**模板是否为默认 0:不默认 1：默认 */
  isDefault: number;
  /**模板保级周期 */
  keepPeriod: number;
  /**登陆红包周期 */
  loginRedPackagePeriod: number;
  /**救援周期 */
  rescuePeriod: number;
  /**模板有效期开始 */
  startDate: number;
  /**模板SVIP再邀请时间 */
  svipInviteTime: number;
  /**模板SVIP持续时间 */
  svipKeepTime: number;
  /**模板ID */
  templateId: number;
  /**模板名称 */
  templateName: string;
  /**模板编号 */
  templateNo: string;
  /**模板状态 1:禁用 2:启用 */
  templateStatus: number;
  /**模板类型 模板A:1 模板B:2 模板C:3 */
  templateType: number;
  /**更新时间 */
  updateTime: number;
  /**模板单次晋级级数 */
  upgradeNum: number;
  /**模板晋级周期 */
  upgradePeriod: number;
}
