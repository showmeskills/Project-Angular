class GamingContestRankModel {
  String title;
  bool kycCheck;
  bool isClose;
  String activitiesNo;
  String period;
  int endTime;
  int nowTime;
  GamingContestBonusInfo? bonusInfo;

  GamingContestRankModel({
    this.title = '',
    this.activitiesNo = '',
    this.period = '',
    this.endTime = 0,
    this.nowTime = 0,
    this.kycCheck = false,
    this.isClose = false,
    this.bonusInfo,
  });

  factory GamingContestRankModel.fromJson(Map<String, Object?> json) {
    return GamingContestRankModel(
      title: json['title'] as String? ?? '',
      activitiesNo: json['activitiesNo'] as String? ?? '',
      period: json['period'] as String? ?? '',
      endTime: json['endTime'] as int? ?? 0,
      nowTime: json['nowTime'] as int? ?? 0,
      kycCheck: json['kycCheck'] as bool? ?? false,
      isClose: json['isClose'] as bool? ?? false,
      bonusInfo: GamingContestBonusInfo.fromJson(
          json['bonusInfo'] as Map<String, Object?>? ?? {}),
    );
  }

  Map<String, Object?> toJson() => {
        'title': title,
        'activitiesNo': activitiesNo,
        'period': period,
        'endTime': endTime,
        'nowTime': nowTime,
        'kycCheck': kycCheck,
        'isClose': isClose,
      };
}

class GamingContestBonusInfo {
  num bonusMoney;
  String bonusCurrency;
  num bonusUsdtMoney;
  String uid;
  String userName;
  String avatar;
  int rankNumber;
  num rankMoney;

  GamingContestBonusInfo({
    this.bonusMoney = 0,
    this.bonusCurrency = '',
    this.bonusUsdtMoney = 0,
    this.uid = '',
    this.userName = '',
    this.avatar = '',
    this.rankNumber = 0,
    this.rankMoney = 0,
  });

  factory GamingContestBonusInfo.fromJson(Map<String, Object?> json) {
    return GamingContestBonusInfo(
      bonusMoney: json['bonusMoney'] as num? ?? 0,
      bonusCurrency: json['bonusCurrency'] as String? ?? '',
      bonusUsdtMoney: json['bonusUsdtMoney'] as num? ?? 0,
      uid: json['uid'] as String? ?? '',
      userName: json['userName'] as String? ?? '',
      avatar: json['avatar'] as String? ?? '',
      rankNumber: json['rankNumber'] as int? ?? 0,
      rankMoney: json['rankMoney'] as num? ?? 0,
    );
  }

  Map<String, Object?> toJson() => {
        'bonusMoney': bonusMoney,
        'bonusCurrency': bonusCurrency,
        'bonusUsdtMoney': bonusUsdtMoney,
        'uid': uid,
        'userName': userName,
        'avatar': avatar,
        'rankNumber': rankNumber,
        'rankMoney': rankMoney,
      };

  bool isDataNull() {
    /// 排行为 0 则认为是空数据
    return rankNumber <= 0;
  }
}
