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

class GamingCommissionModel {
  GamingCommissionModel({
    required this.returnType,
    required this.multipleCurrency,
    required this.amount,
    required this.createTime,
  });

  factory GamingCommissionModel.fromJson(Map<String, dynamic> json) =>
      GamingCommissionModel(
        returnType: GGUtil.parseStr(json['returnType']),
        multipleCurrency: asT<Map<String, dynamic>>(
            json['multipleCurrency'])!, //(json['multipleCurrency'])!),
        amount: GGUtil.parseDouble(json['amount']),
        createTime: GGUtil.parseInt(json['createTime']),
      );

  String returnType;
  Map<String, dynamic> multipleCurrency;
  double amount;
  int createTime;

  /// 接口没返回货币类型。换算usdt之后的
  String? get iconUrl {
    return CurrencyService.sharedInstance.getIconUrl('USDT');
  }

  String get timeToMM {
    String format = "yyyy-MM-dd HH:mm";
    DateTime aTime = DateTime.fromMillisecondsSinceEpoch(createTime);
    return DateFormat(format).format(aTime).toString();
  }

  String get timeToSS {
    String format = "yyyy-MM-dd HH:mm:ss";
    DateTime aTime = DateTime.fromMillisecondsSinceEpoch(createTime);
    return DateFormat(format).format(aTime).toString();
  }

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'returnType': returnType,
        'multipleCurrency': multipleCurrency,
        'amount': amount,
        'createTime': createTime,
      };
}
