import 'dart:convert';

import 'package:gogaming_app/common/utils/util.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingDepositVirtualToCurrencyModel {
  GamingDepositVirtualToCurrencyModel({
    required this.statue,
    required this.limitMinute,
    required this.canUseTime,
    required this.orderId,
    required this.amount,
    required this.currency,
    required this.paymentCode,
    required this.createTime,
    required this.expireTime,
    required this.actionType,
    this.bankInfo,
    this.html,
    this.redirectUrl,
    this.remark,
    required this.paymentCurrency,
    required this.paymentAmount,
    required this.depositAddress,
    required this.network,
    required this.expectedBlock,
    required this.expectedUnlockBlock,
    required this.rate,
  });

  factory GamingDepositVirtualToCurrencyModel.fromJson(
          Map<String, dynamic> json) =>
      GamingDepositVirtualToCurrencyModel(
        statue: asT<int>(json['statue'])!,
        limitMinute: asT<int>(json['limitMinute'])!,
        canUseTime: asT<int>(json['canUseTime'])!,
        orderId: asT<String>(json['orderId'])!,
        amount: GGUtil.parseDouble(json['amount']),
        currency: asT<String>(json['currency'])!,
        paymentCode: asT<String>(json['paymentCode'])!,
        createTime: asT<int>(json['createTime'])!,
        expireTime: asT<int>(json['expireTime'])!,
        actionType: asT<int>(json['actionType'])!,
        bankInfo: asT<Object?>(json['bankInfo']),
        html: asT<Object?>(json['html']),
        redirectUrl: asT<Object?>(json['redirectUrl']),
        remark: asT<String?>(json['remark']),
        paymentCurrency: asT<String>(json['paymentCurrency'])!,
        paymentAmount: asT<double>(json['paymentAmount'])!,
        depositAddress: asT<String>(json['depositAddress'])!,
        network: asT<String>(json['network'])!,
        expectedBlock: asT<int>(json['expectedBlock'])!,
        expectedUnlockBlock: asT<int>(json['expectedUnlockBlock'])!,
        rate: asT<double>(json['rate'])!,
      );

  int statue;
  int limitMinute;
  int canUseTime;
  String orderId;
  double amount;
  String currency;
  String paymentCode;
  int createTime;
  int expireTime;
  int actionType;
  Object? bankInfo;
  Object? html;
  Object? redirectUrl;
  String? remark;
  String paymentCurrency;
  double paymentAmount;
  String depositAddress;
  String network;
  int expectedBlock;
  int expectedUnlockBlock;
  double rate;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'statue': statue,
        'limitMinute': limitMinute,
        'canUseTime': canUseTime,
        'orderId': orderId,
        'amount': amount,
        'currency': currency,
        'paymentCode': paymentCode,
        'createTime': createTime,
        'expireTime': expireTime,
        'actionType': actionType,
        'bankInfo': bankInfo,
        'html': html,
        'redirectUrl': redirectUrl,
        'remark': remark,
        'paymentCurrency': paymentCurrency,
        'paymentAmount': paymentAmount,
        'depositAddress': depositAddress,
        'network': network,
        'expectedBlock': expectedBlock,
        'expectedUnlockBlock': expectedUnlockBlock,
        'rate': rate,
      };
}
