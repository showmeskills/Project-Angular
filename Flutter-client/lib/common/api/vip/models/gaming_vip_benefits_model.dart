import 'dart:convert';
import 'package:gogaming_app/widget_header.dart';

T? asT<T>(dynamic value) {
  if (value is num) {
    value = value.stripTrailingZerosNum();
  }
  if (value is T) {
    return value;
  }
  return null;
}

class GamingVipBenefitsModel {
  const GamingVipBenefitsModel({
    this.promotion,
    this.keep,
    this.birthdayBenefit,
    this.promotionBenefit,
    this.keepBenefit,
    this.depositBenefit,
    this.rescueMoney,
    this.loginRedPackage,
    this.returnBouns,
  });

  final List<GamingVipBenefitPoint>? promotion;
  final List<GamingVipBenefitPoint>? keep;
  final List<GamingVipBenefitAmount>? birthdayBenefit;
  final List<GamingVipBenefitAmount>? promotionBenefit;
  final List<GamingVipBenefitAmount>? keepBenefit;
  final List<GamingVipDepositBenefit>? depositBenefit;
  final List<GamingVipRescueMoney>? rescueMoney;
  final List<GamingVipBenefitAmount>? loginRedPackage;
  final List<GamingVipReturnBonus>? returnBouns;

  GamingVipReturnBonus? returnBonusLevel(int vipLevel) {
    return returnBouns
        ?.firstWhereOrNull((e) => e.vipLevel == vipLevel.toString());
  }

  GamingVipDepositBenefit? depositBenefitLevel(int vipLevel) {
    return depositBenefit
        ?.firstWhereOrNull((e) => e.vipLevel == vipLevel.toString());
  }

  GamingVipRescueMoney? rescueMoneyLevel(int vipLevel) {
    return rescueMoney
        ?.firstWhereOrNull((e) => e.vipLevel == vipLevel.toString());
  }

  GamingVipBenefitPoint? promotionLevel(int vipLevel) {
    return promotion
        ?.firstWhereOrNull((e) => e.vipLevel == vipLevel.toString());
  }

  GamingVipBenefitPoint? keepLevel(int vipLevel) {
    return keep?.firstWhereOrNull((e) => e.vipLevel == vipLevel.toString());
  }

  GamingVipBenefitAmount? birthdayBenefitLevel(int vipLevel) {
    return birthdayBenefit
        ?.firstWhereOrNull((e) => e.vipLevel == vipLevel.toString());
  }

  GamingVipBenefitAmount? promotionBenefitLevel(int vipLevel) {
    return promotionBenefit
        ?.firstWhereOrNull((e) => e.vipLevel == vipLevel.toString());
  }

  GamingVipBenefitAmount? keepBenefitLevel(int vipLevel) {
    return keepBenefit
        ?.firstWhereOrNull((e) => e.vipLevel == vipLevel.toString());
  }

  GamingVipBenefitAmount? loginRedPackageLevel(int vipLevel) {
    return loginRedPackage
        ?.firstWhereOrNull((e) => e.vipLevel == vipLevel.toString());
  }

  // String upgradeValue(int vipLevel) {
  //   final points =
  //       promotion?.firstWhere((e) => e.vipLevel == vipLevel.toString()).points;
  // }

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'promotion': promotion,
        'keep': keep,
        'birthdayBenefit': birthdayBenefit,
        'promotionBenefit': promotionBenefit,
        'keepBenefit': keepBenefit,
        'depositBenefit': depositBenefit,
        'rescueMoney': rescueMoney,
        'loginRedPackage': loginRedPackage,
        'returnBouns': returnBouns,
      };
}

class GamingVipBenefitPoint {
  const GamingVipBenefitPoint({
    this.vipLevel,
    this.points,
    this.period,
  });

  factory GamingVipBenefitPoint.fromJson(Map<String, dynamic> json) =>
      GamingVipBenefitPoint(
        vipLevel: asT<String?>(json['vipLevel']),
        points: asT<num?>(json['points']),
        period: asT<int?>(json['period']),
      );

  final String? vipLevel;
  final num? points;
  final int? period;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'vipLevel': vipLevel,
        'points': points,
        'period': period,
      };
}

class GamingVipBenefitAmount {
  const GamingVipBenefitAmount({
    this.vipLevel,
    this.amount,
  });

  factory GamingVipBenefitAmount.fromJson(Map<String, dynamic> json) =>
      GamingVipBenefitAmount(
        vipLevel: asT<String?>(json['vipLevel']),
        amount: asT<num?>(json['amount']),
      );

  final String? vipLevel;
  final num? amount;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'vipLevel': vipLevel,
        'amount': amount,
      };
}

class GamingVipDepositBenefit {
  const GamingVipDepositBenefit({
    this.vipLevel,
    this.bonusRate,
    this.bonusMax,
    this.period,
  });

  factory GamingVipDepositBenefit.fromJson(Map<String, dynamic> json) =>
      GamingVipDepositBenefit(
        vipLevel: asT<String?>(json['vipLevel']),
        bonusRate: asT<num?>(json['bonusRate']),
        bonusMax: asT<num?>(json['bonusMax']),
        period: asT<int?>(json['period']),
      );

  final String? vipLevel;
  final num? bonusRate;
  final num? bonusMax;
  final int? period;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'vipLevel': vipLevel,
        'bonusRate': bonusRate,
        'bonusMax': bonusMax,
        'period': period,
      };
}

class GamingVipRescueMoney {
  const GamingVipRescueMoney({
    this.amountMax,
    this.vipLevel,
    this.amount,
  });

  factory GamingVipRescueMoney.fromJson(Map<String, dynamic> json) =>
      GamingVipRescueMoney(
        amountMax: asT<num?>(json['amountMax']),
        vipLevel: asT<String?>(json['vipLevel']),
        amount: asT<num?>(json['amount']),
      );

  final num? amountMax;
  final String? vipLevel;
  final num? amount;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'amountMax': amountMax,
        'vipLevel': vipLevel,
        'amount': amount,
      };
}

class GamingVipReturnBonus {
  const GamingVipReturnBonus({
    this.vipLevel,
    this.sportsReturn,
    this.personReturn,
    this.casinoCashback,
    this.lotteryReturn,
    this.cardReturn,
    this.limitMoney,
    this.dayWithdrawLimitMoney,
  });

  // factory GamingVipReturnBonus.fromJson(Map<String, dynamic> json) =>
  //     GamingVipReturnBonus(
  //       vipLevel: asT<String?>(json['vipLevel']),
  //       sportsReturn: asT<num?>(json['sportsReturn']),
  //       personReturn: asT<num?>(json['personReturn']),
  //       casinoCashback: asT<num?>(json['gameReturn']),
  //       lotteryReturn: asT<num?>(json['lotteryReturn']),
  //       cardReturn: asT<num?>(json['cardReturn']),
  //       limitMoney: asT<num?>(json['limitMoney']),
  //       dayWithdrawLimitMoney: asT<num?>(json['dayWithdrawLimitMoney']),
  //     );

  /// vip等级
  final String? vipLevel;

  /// 体育返还
  final num? sportsReturn;

  /// 真人返还
  final num? personReturn;

  /// 娱乐场返还
  final num? casinoCashback;

  /// 彩票返还
  final num? lotteryReturn;

  /// 棋牌返还
  final num? cardReturn;

  /// 单日返回上限
  final num? limitMoney;

  /// 单日提款限额
  final num? dayWithdrawLimitMoney;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'vipLevel': vipLevel,
        'sportsReturn': sportsReturn,
        'personReturn': personReturn,
        'casinoCashback': casinoCashback,
        'lotteryReturn': lotteryReturn,
        'cardReturn': cardReturn,
        'limitMoney': limitMoney,
        'dayWithdrawLimitMoney': dayWithdrawLimitMoney,
      };
}
