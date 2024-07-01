enum GGGameProviderCategory {
  /// 体育
  sportsBook('SportsBook', '1'),

  /// 电子竞技
  esports('Esports', '2'),

  /// 彩票
  lottery('Lottery', '3'),

  /// 真人娱乐场
  liveCasino('LiveCasino', '4'),

  /// 老虎机
  slotGame('SlotGame', '5'),

  /// 棋牌
  chess('Chess', '6');

  const GGGameProviderCategory(this.title, this.value);

  final String title;
  final String value;

  factory GGGameProviderCategory.fromValue(String value) {
    return GGGameProviderCategory.values.firstWhere(
      (element) => element.value == value,
      orElse: () => sportsBook,
    );
  }
}
