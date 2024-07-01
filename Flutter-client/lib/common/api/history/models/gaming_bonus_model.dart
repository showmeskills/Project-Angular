import 'dart:convert';

import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/helper/time_helper.dart';

enum GamingBonusModelStatus {
  unclaimed('Unclaimed'),
  inUse('InUse'),
  used('Used'),
  invalid('Invalid'),
  received('Received');

  const GamingBonusModelStatus(this.value);
  final String value;
}

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingBonusModel {
  GamingBonusModel({
    required this.grantTime,
    required this.bonusOrderId,
    required this.bonusName,
    required this.currency,
    required this.amount,
    required this.grantType,
    required this.grantName,
    required this.vipLevel,
    required this.statusName,
    required this.cardStatus,
    required this.currentBetTurnover,
    required this.nonStickyStatus,
    required this.prizeName,
    required this.balance,
    required this.betProgress,
    required this.betCount,
    required this.lastUpdateTime,
    required this.withdrawAmount,
    required this.gameName,
    required this.providerId,
    required this.providerName,
    required this.maxSpinNum,
    required this.isNonStickyChange,
    required this.bonusAmount,
  });

  factory GamingBonusModel.fromJson(Map<String, dynamic> json) =>
      GamingBonusModel(
        grantTime: GGUtil.parseInt(json['grantTime']),
        bonusOrderId: GGUtil.parseStr(json['bonusOrderId']),
        bonusName: GGUtil.parseStr(json['bonusName']),
        currency: GGUtil.parseStr(json['currency']),
        amount: GGUtil.parseDouble(json['amount']),
        grantType: GGUtil.parseStr(json['grantType']),
        grantName: GGUtil.parseStr(json['grantName']),
        vipLevel: GGUtil.parseInt(json['vipLevel']),
        statusName: GGUtil.parseStr(json['statusName']),
        cardStatus: GGUtil.parseStr(json['cardStatus']),
        currentBetTurnover: GGUtil.parseDouble(json['currentBetTurnover']),
        nonStickyStatus: GGUtil.parseStr(json['nonStickyStatus']),
        prizeName: GGUtil.parseStr(json['prizeName']),
        balance: GGUtil.parseDouble(json['balance']),
        betProgress: GGUtil.parseDouble(json['betProgress']),
        betCount: GGUtil.parseStr(json['betCount']),
        lastUpdateTime: GGUtil.parseInt(json['lastUpdateTime']),
        withdrawAmount: GGUtil.parseDouble(json['withdrawAmount']),
        gameName: GGUtil.parseStr(json['gameName']),
        providerId: GGUtil.parseStr(json['providerId']),
        providerName: GGUtil.parseStr(json['providerName']),
        maxSpinNum: GGUtil.parseInt(json['maxSpinNum']),
        isNonStickyChange: GGUtil.parseBool(json['isNonSticky']),
        bonusAmount: GGUtil.parseDouble(json['bonusAmount']),
      );

  int grantTime;
  String bonusOrderId;
  String bonusName;
  String currency;
  double amount;
  double currentBetTurnover;
  String nonStickyStatus;
  String prizeName;
  double balance;
  double betProgress;
  int lastUpdateTime;
  String betCount;
  String grantType;
  String grantName;
  int vipLevel;
  String statusName;
  // 卡片状态 Unclaimed, Received, InUse, Used, Invalid
  String cardStatus;
  double withdrawAmount;
  String gameName;
  String providerId;
  String providerName;
  int maxSpinNum;
  bool isNonStickyChange;
  double bonusAmount;

  String get iconUrl {
    return CurrencyService.sharedInstance.getIconUrl(currency);
  }

  String get timeToMM {
    String format = "yyyy-MM-dd HH:mm";
    DateTime aTime = DateTime.fromMillisecondsSinceEpoch(grantTime);
    return DateFormat(format).format(aTime).toString();
  }

  String get timeToSS {
    String format = "yyyy-MM-dd HH:mm:ss";
    DateTime aTime = DateTime.fromMillisecondsSinceEpoch(grantTime);
    return DateFormat(format).format(aTime).toString();
  }

  String get lastUpdateTimeToSS {
    String format = "yyyy-MM-dd HH:mm:ss";
    DateTime aTime = DateTime.fromMillisecondsSinceEpoch(lastUpdateTime);
    return DateFormat(format).format(aTime).toString();
  }

  bool get isDigital {
    return CurrencyService.sharedInstance.isDigital(currency);
  }

  bool get isNonsticky {
    return grantType == 'NonSticky';
  }

  bool get isFreeSpin {
    return grantType == 'FreeSpin';
  }

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'grantTime': grantTime,
        'bonusOrderId': bonusOrderId,
        'bonusName': bonusName,
        'currency': currency,
        'amount': amount,
        'grantType': grantType,
        'grantName': grantName,
        'vipLevel': vipLevel,
        'statusName': statusName,
        'cardStatus': cardStatus,
        'currentBetTurnover': currentBetTurnover,
        'nonStickyStatus': nonStickyStatus,
        'prizeName': prizeName,
        'balance': balance,
        'betProgress': betProgress,
        'betCount': betCount,
        'lastUpdateTime': lastUpdateTime,
        'withdrawAmount': withdrawAmount,
        'gameName': gameName,
        'providerId': providerId,
        'maxSpinNum': maxSpinNum,
        'bonusAmount': bonusAmount,
      };
}
