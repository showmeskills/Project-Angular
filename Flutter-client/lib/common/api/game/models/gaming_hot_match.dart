T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingGameHotMatchModel {
  /// 球种
  int? sportId;

  /// 联赛 id
  String? tournamentId;

  /// 联赛名称
  String? tournament;

  /// 比赛 id
  String? matchId;

  /// 主队编号
  String? home;

  /// 主队名称
  String? homeName;

  /// 主队 logo
  String? homeLogo;

  /// 客队编号
  String? away;

  /// 客队名称
  String? awayName;

  /// 客队 logo
  String? awayLogo;

  /// 比赛时间
  num? matchTime;

  /// 现在时间
  num? gameTime;

  /// 1 prematch 2 live
  num? matchType;

  /// 状态
  num? matchStage;

  String? matchStageName;

  /// 赔率
  num? homeOdds;
  num? drawOdds;
  num? awayOdds;

  GamingGameHotMatchModel({
    this.sportId,
    this.tournamentId,
    this.tournament,
    this.matchId,
    this.home,
    this.homeName,
    this.away,
    this.awayName,
    this.awayLogo,
    this.homeLogo,
    this.matchTime,
    this.gameTime,
    this.matchType,
    this.matchStageName,
    this.matchStage,
    this.homeOdds,
    this.drawOdds,
    this.awayOdds,
  });

  factory GamingGameHotMatchModel.fromJson(Map<String, Object?> json) {
    return GamingGameHotMatchModel(
      sportId: asT<int?>(json['sportId']),
      tournamentId: asT<String?>(json['tournamentId']),
      tournament: asT<String?>(json['tournament']),
      matchId: asT<String?>(json['matchId']),
      home: asT<String?>(json['home']),
      homeName: asT<String?>(json['homeName']),
      away: asT<String?>(json['away']),
      awayName: asT<String?>(json['awayName']),
      awayLogo: asT<String?>(json['awayLogo']),
      homeLogo: asT<String?>(json['homeLogo']),
      matchTime: asT<num?>(json['matchTime']),
      gameTime: asT<num?>(json['gameTime']),
      matchType: asT<num?>(json['matchType']),
      matchStageName: asT<String?>(json['matchStageName']),
      matchStage: asT<num?>(json['matchStage']),
      homeOdds: asT<num?>(json['homeOdds']),
      drawOdds: asT<num?>(json['drawOdds']),
      awayOdds: asT<num?>(json['awayOdds']),
    );
  }
}
