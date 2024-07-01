import 'dart:convert';

import 'package:gogaming_app/common/utils/util.dart';

/// 红利发放方式
T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingHistoryAdjustAccount {
  GamingHistoryAdjustAccount({
    required this.category,
    required this.description,
  });

  factory GamingHistoryAdjustAccount.fromJson(Map<String, dynamic> json) =>
      GamingHistoryAdjustAccount(
        category: GGUtil.parseStr(json['Category']),
        description: GGUtil.parseStr(json['description']),
      );

  String category;
  String description;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'code': category,
        'description': description,
      };
}
