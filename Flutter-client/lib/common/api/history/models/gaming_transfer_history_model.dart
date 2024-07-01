import 'dart:convert';
import 'dart:developer';

import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/helper/time_helper.dart';

void tryCatch(Function? f) {
  try {
    f?.call();
  } catch (e, stack) {
    log('$e');
    log('$stack');
  }
}

class FFConvert {
  FFConvert._();
  static T? Function<T extends Object?>(dynamic value) convert =
      <T>(dynamic value) {
    if (value == null) {
      return null;
    }
    return json.decode(value.toString()) as T?;
  };
}

T? asT<T extends Object?>(dynamic value, [T? defaultValue]) {
  if (value is T) {
    return value;
  }
  try {
    if (value != null) {
      final String valueS = value.toString();
      if ('' is T) {
        return valueS as T;
      } else if (0 is T) {
        return int.parse(valueS) as T;
      } else if (0.0 is T) {
        return double.parse(valueS) as T;
      } else if (false is T) {
        if (valueS == '0' || valueS == '1') {
          return (valueS == '1') as T;
        }
        return (valueS == 'true') as T;
      } else {
        return FFConvert.convert<T>(value);
      }
    }
  } catch (e, stackTrace) {
    log('asT<$T>', error: e, stackTrace: stackTrace);
    return defaultValue;
  }

  return defaultValue;
}

enum GamingTransferHistoryItemModelStatus {
  success('Success'),
  fail('Fail');

  const GamingTransferHistoryItemModelStatus(this.value);
  final String value;
}

class GamingTransferHistoryItemModel {
  GamingTransferHistoryItemModel({
    required this.transactionId,
    required this.currency,
    required this.fromWallet,
    required this.toWallet,
    required this.transferType,
    required this.amount,
    required this.status,
    required this.createdTime,
  });

  factory GamingTransferHistoryItemModel.fromJson(Map<String, dynamic> json) =>
      GamingTransferHistoryItemModel(
        transactionId: GGUtil.parseStr(json['transactionId']),
        currency: GGUtil.parseStr(json['currency']),
        fromWallet: GGUtil.parseStr(json['fromWallet']),
        toWallet: GGUtil.parseStr(json['toWallet']),
        transferType: GGUtil.parseStr(json['transferType']),
        amount: GGUtil.parseDouble(json['amount']),
        status: GGUtil.parseStr(json['status']),
        createdTime: GGUtil.parseInt(json['createdTime']),
      );

  String transactionId;
  String currency;
  String fromWallet;
  String toWallet;
  String transferType;
  double amount;
  String status;
  int createdTime;

  String get iconUrl {
    return CurrencyService.sharedInstance.getIconUrl(currency);
  }

  String get timeToMM {
    String format = "yyyy-MM-dd HH:mm";
    DateTime aTime = DateTime.fromMillisecondsSinceEpoch(createdTime);
    return DateFormat(format).format(aTime).toString();
  }

  String get timeToSS {
    String format = "yyyy-MM-dd HH:mm:ss";
    DateTime aTime = DateTime.fromMillisecondsSinceEpoch(createdTime);
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
        'transactionId': transactionId,
        'currency': currency,
        'fromWallet': fromWallet,
        'toWallet': toWallet,
        'transferType': transferType,
        'amount': amount,
        'status': status,
        'createdTime': createdTime,
      };
}
