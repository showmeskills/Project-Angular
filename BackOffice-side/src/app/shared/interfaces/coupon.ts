/**
 * 优惠券 - 类型枚举
 */
export enum CouponTypeEnum {
  CashCoupons = 1, // 现金券
  Voucher = 2, // 抵用券
  SVIPExperienceCoupon = 3, // SVIP体验券
  NonStickyBonus = 8, // 非粘性奖金
  FreeSpin = 9, // 免费旋转
}

/**
 * 优惠券 - 卷有效期类型枚举
 */
export enum CouponPeriodEnumType {
  Period = 0, // 相对时间
  Permanent = 5, // 永久有效
}

/**
 * 优惠券类型：抵用券 - 可用范围类型枚举
 */
export enum CouponVoucherLimitEnumType {
  Common = 0, // 全场通用
  Category = 4, // 指定游戏类型
  Provider = 5, // 指定游戏厂商
}

/**
 * 优惠券类型：非粘性奖金 - 可用范围类型
 */
export enum CouponNonStickyLimitEnumType {
  SlotGame = 'SlotGame', // 娱乐场投注
  LiveCasino = 'LiveCasino', // 真人娱乐场投注
}

/**
 * 优惠券:limits.type - 类型枚举
 */
export enum CouponlimitsValueEnumType {
  Multiple = 0, // 1.现金券 - 提款倍率 2.非粘性奖金 - 投注倍数
  GameCategory = 4, // 1.非粘性奖金 - 可用范围
  ProviderId = 5, // 1.Free Spin - 适用游戏的厂商ID
  GameCode = 6, // 1.Free Spin - 适用游戏Code

  VoucherMinBetLimit = 7, // 抵用券 - 最低投注金额

  SVIPRedemptionDays = 10, // SVIP体验券 - 兑换天数

  NonStickyMaxSpinAmount = 20, // 非粘性奖金 - 每次旋转的最大赌注(USDT)
  NonStickyBetTimes = 22, // 非粘性奖金 - 下注次数要求
  NonStickyActivationdays = 21, // 非粘性奖金 - 激活后持续时间
  NonStickyIsRisk = 23, // 非粘性奖金 - 是否风控

  FreeSpinTimes = 24, // Free Spin - 旋转的次数
  FreeSpinCoins = 25, // Free Spin - PNG厂商：硬币值
  FreeSpinLines = 26, // Free Spin - PNG厂商：旋转的乘数
  FreeSpinDenomination = 27, // Free Spin - PNG厂商：面额
  FreeSpinMinBet = 28, // Free Spin - 聚合厂商：最小投注金额
  FreeSpinBetLevel = 29, // Free Spin - 聚合厂商：投注级别
  FreeSpinIsNonSticky = 30, // Free Spin - 是否为非粘性
  FreeSpinGameId = 31, // Free Spin - 适用游戏的ID
  FreeSpinIsPng = 32, // Free Spin - 适用游戏是否为Png厂商，反之聚合厂商
  FreeSpinGameCategory = 33, // Free Spin - 适用游戏的厂商类别
  FreeSpinBonusCap = 34, // Free Spin - 奖金上限
}
