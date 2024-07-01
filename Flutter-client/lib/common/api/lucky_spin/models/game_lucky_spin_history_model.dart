import 'dart:convert';

import 'package:gogaming_app/common/components/number_precision/number_precision.dart';

import '../../../service/currency/currency_service.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GameLuckySpinHistoryModel {
  GameLuckySpinHistoryModel({
    required this.userId,
    required this.userName,
    required this.userAvatar,
    required this.orderId,
    required this.prizeId,
    required this.prizeFullName,
    required this.prizeShortName,
    required this.prizeType,
    required this.amount,
    required this.currency,
    required this.svipDays,
    required this.times,
    required this.picture,
    required this.drawTime,
  });

  factory GameLuckySpinHistoryModel.fromJson(Map<String, dynamic> json) =>
      GameLuckySpinHistoryModel(
        userId: asT<String?>(json['userId']),
        userName: asT<String?>(json['userName']),
        userAvatar: asT<String?>(json['userAvatar']),
        orderId: asT<int?>(json['orderId']),
        prizeId: asT<int?>(json['prizeId']),
        drawTime: asT<int?>(json['drawTime']),
        prizeFullName: asT<String?>(json['prizeFullName']),
        prizeShortName: asT<String?>(json['prizeShortName']),
        prizeType: asT<int?>(json['prizeType']),
        amount: asT<num?>(json['amount']),
        currency: asT<String>(json['currency']) ?? '',
        svipDays: asT<int?>(json['svipDays']),
        times: asT<int?>(json['times']),
        picture: asT<String?>(json['picture']),
      );

  String? userId;
  String? userName;
  String? userAvatar;
  int? orderId;
  int? prizeId;
  int? drawTime;
  String? prizeFullName;
  String? prizeShortName;
  int? prizeType;
  num? amount;
  String currency;
  int? svipDays;
  int? times;
  String? picture;

  String get iconUrl {
    return (picture?.isNotEmpty ?? false)
        ? picture!
        : CurrencyService.sharedInstance.getIconUrl(currency);
  }

  bool get isDigital {
    return CurrencyService.sharedInstance.isDigital(currency);
  }

  String get prizeText {
    if ((prizeType ?? 0) > 3) {
      return prizeFullName ?? '';
    } else {
      return amountText;
    }
  }

  String get amountText => NumberPrecision(amount).displayNum(2);

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'userId': userId,
        'userName': userName,
        'userAvatar': userAvatar,
        'orderId': orderId,
        'prizeId': prizeId,
        'prizeFullName': prizeFullName,
        'prizeShortName': prizeShortName,
        'prizeType': prizeType,
        'amount': amount,
        'currency': currency,
        'svipDays': svipDays,
        'times': times,
        'picture': picture,
        'drawTime': drawTime,
      };
}
