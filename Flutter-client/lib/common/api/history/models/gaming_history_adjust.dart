import 'dart:convert';

import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/helper/time_helper.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingHistoryAdjust {
  GamingHistoryAdjust({
    required this.date,
    required this.orderNum,
    required this.type,
    required this.currency,
    required this.amount,
    required this.remark,
    required this.walletType,
  });

  factory GamingHistoryAdjust.fromJson(Map<String, dynamic> json) =>
      GamingHistoryAdjust(
        date: GGUtil.parseInt(json['date']),
        orderNum: GGUtil.parseStr(json['orderNum']),
        type: GGUtil.parseStr(json['type']),
        currency: GGUtil.parseStr(json['currency']),
        amount: GGUtil.parseDouble(json['amount']),
        remark: GGUtil.parseStr(json['remark']),
        walletType: GGUtil.parseStr(json['walletType']),
      );

  int date;
  String orderNum;
  String type;
  String currency;
  double amount;
  String remark;
  String walletType;

  String get iconUrl {
    return CurrencyService.sharedInstance.getIconUrl(currency);
  }

  String get timeToMM {
    String format = "yyyy-MM-dd HH:mm";
    DateTime aTime = DateTime.fromMillisecondsSinceEpoch(date);
    return DateFormat(format).format(aTime).toString();
  }

  String get timeToSS {
    String format = "yyyy-MM-dd HH:mm:ss";
    DateTime aTime = DateTime.fromMillisecondsSinceEpoch(date);
    return DateFormat(format).format(aTime).toString();
  }

  bool get isDigital {
    return CurrencyService.sharedInstance.isDigital(currency);
  }

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'date': date,
        'orderNum': orderNum,
        'type': type,
        'currency': currency,
        'amount': amount,
        'remark': remark,
        'walletType': walletType,
      };
}
