import 'dart:convert';

import 'package:gogaming_app/common/utils/util.dart';
import 'package:intl/intl.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class TransferResult {
  TransferResult({
    this.result,
    this.data,
    this.timestamp,
  });

  factory TransferResult.fromJson(Map<String, dynamic> json) => TransferResult(
        result: json['result'] == null
            ? null
            : Result.fromJson(asT<Map<String, dynamic>>(json['result'])!),
        data: json['data'] == null
            ? null
            : ResultData.fromJson(asT<Map<String, dynamic>>(json['data'])!),
        timestamp: GGUtil.parseInt(json['timeStamp']),
      );

  Result? result;
  ResultData? data;
  int? timestamp;

  @override
  String toString() {
    return jsonEncode(this);
  }

  /// 时间戳 格式化
  String get timeStampString =>
      DateFormat("yyyy-MM-dd HH:mm:ss").format(timestamp == 0
          ? DateTime.now()
          : DateTime.fromMillisecondsSinceEpoch(GGUtil.parseInt(timestamp)));

  Map<String, dynamic> toJson() => <String, dynamic>{
        'result': result,
        'data': data,
        'timeStamp': timestamp,
      };
}

class Result {
  Result({
    required this.resultCode,
    required this.message,
  });

  factory Result.fromJson(Map<String, dynamic> json) => Result(
        resultCode: asT<String>(json['resultCode'])!,
        message: asT<String>(json['message'])!,
      );

  String resultCode;
  String message;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'resultCode': resultCode,
        'message': message,
      };
}

class ResultData {
  ResultData({
    required this.transactionId,
  });

  factory ResultData.fromJson(Map<String, dynamic> json) => ResultData(
        transactionId: asT<String>(json['transactionId'])!,
      );

  String transactionId;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'transactionId': transactionId,
      };
}
