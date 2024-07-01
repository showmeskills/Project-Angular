enum HistoryType {
  // 充值
  deposit('deposit'),
  // 提现
  withdraw('withdraw'),
  // 划转
  transfer('transfer'),
  //红利
  bonus('bonus'),
  // 调账
  adjust('adjust'),
  // 佣金
  commission('commission'),
  // 抽奖
  luckyDraw('lucky_draw');

  const HistoryType(this.value);
  final String value;
}
