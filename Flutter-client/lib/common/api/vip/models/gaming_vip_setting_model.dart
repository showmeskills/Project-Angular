class GamingVipSettingModel {
  String? vipLevel;
  int promotionBonus;
  int keepBonus;
  int birthdayBonus;
  int loginRedPackage;
  int firstDepositBonus;
  int rescueMoney;
  double sportsReturn;
  double personReturn;
  double gameReturn;
  double lotteryReturn;
  double cardReturn;
  // double totalBonus;
  int dayWithdrawLimitMoney;

  GamingVipSettingModel({
    this.vipLevel,
    this.promotionBonus = 0,
    this.keepBonus = 0,
    this.birthdayBonus = 0,
    this.loginRedPackage = 0,
    this.firstDepositBonus = 0,
    this.rescueMoney = 0,
    this.sportsReturn = 0,
    this.personReturn = 0,
    this.gameReturn = 0,
    this.lotteryReturn = 0,
    this.cardReturn = 0,
    // this.totalBonus = 0,
    this.dayWithdrawLimitMoney = 1,
  });

  @override
  String toString() {
    return 'GamingVipSettingModel(vipLevel: $vipLevel, promotionBonus: $promotionBonus, keepBonus: $keepBonus, birthdayBonus: $birthdayBonus, loginRedPackage: $loginRedPackage, firstDepositBonus: $firstDepositBonus, rescueMoney: $rescueMoney, sportsReturn: $sportsReturn, personReturn: $personReturn, gameReturn: $gameReturn, lotteryReturn: $lotteryReturn, cardReturn: $cardReturn, dayWithdrawLimitMoney: $dayWithdrawLimitMoney)';
  }

  factory GamingVipSettingModel.fromJson(Map<String, Object?> json) {
    return GamingVipSettingModel(
      vipLevel: json['vipLevel'] as String?,
      promotionBonus: (json['promotionBonus'] as num).toInt(),
      keepBonus: (json['keepBonus'] as num).toInt(),
      birthdayBonus: (json['birthdayBonus'] as num).toInt(),
      loginRedPackage: (json['loginRedPackage'] as num).toInt(),
      firstDepositBonus: (json['firstDepositBonus'] as num).toInt(),
      rescueMoney: (json['rescueMoney'] as num).toInt(),
      sportsReturn: (json['sportsReturn'] as num).toDouble(),
      personReturn: (json['personReturn'] as num).toDouble(),
      gameReturn: (json['gameReturn'] as num).toDouble(),
      lotteryReturn: (json['lotteryReturn'] as num).toDouble(),
      cardReturn: (json['cardReturn'] as num).toDouble(),
      // totalBonus: (json['totalBonus'] as num).toDouble(),
      dayWithdrawLimitMoney: (json['dayWithdrawLimitMoney'] as num).toInt(),
    );
  }

  Map<String, Object?> toJson() => {
        'vipLevel': vipLevel,
        'promotionBonus': promotionBonus,
        'keepBonus': keepBonus,
        'birthdayBonus': birthdayBonus,
        'loginRedPackage': loginRedPackage,
        'firstDepositBonus': firstDepositBonus,
        'rescueMoney': rescueMoney,
        'sportsReturn': sportsReturn,
        'personReturn': personReturn,
        'gameReturn': gameReturn,
        'lotteryReturn': lotteryReturn,
        'cardReturn': cardReturn,
        // 'totalBonus': totalBonus,
        'dayWithdrawLimitMoney': dayWithdrawLimitMoney,
      };

  GamingVipSettingModel copyWith({
    String? vipLevel,
    int? promotionBonus,
    int? keepBonus,
    int? birthdayBonus,
    int? loginRedPackage,
    int? firstDepositBonus,
    int? rescueMoney,
    double? sportsReturn,
    double? personReturn,
    double? gameReturn,
    double? lotteryReturn,
    double? cardReturn,
    // double? totalBonus,
    int? dayWithdrawLimitMoney,
  }) {
    return GamingVipSettingModel(
      vipLevel: vipLevel ?? this.vipLevel,
      promotionBonus: promotionBonus ?? this.promotionBonus,
      keepBonus: keepBonus ?? this.keepBonus,
      birthdayBonus: birthdayBonus ?? this.birthdayBonus,
      loginRedPackage: loginRedPackage ?? this.loginRedPackage,
      firstDepositBonus: firstDepositBonus ?? this.firstDepositBonus,
      rescueMoney: rescueMoney ?? this.rescueMoney,
      sportsReturn: sportsReturn ?? this.sportsReturn,
      personReturn: personReturn ?? this.personReturn,
      gameReturn: gameReturn ?? this.gameReturn,
      lotteryReturn: lotteryReturn ?? this.lotteryReturn,
      cardReturn: cardReturn ?? this.cardReturn,
      // totalBonus: totalBonus ?? this.totalBonus,
      dayWithdrawLimitMoney:
          dayWithdrawLimitMoney ?? this.dayWithdrawLimitMoney,
    );
  }
}
