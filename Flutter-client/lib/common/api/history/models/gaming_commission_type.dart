import 'dart:convert';

import 'package:gogaming_app/common/utils/util.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class CommissionType {
  CommissionType({
    required this.code,
    required this.description,
  });

  factory CommissionType.fromJson(Map<String, dynamic> json) => CommissionType(
        code: GGUtil.parseStr(json['code']),
        description: GGUtil.parseStr(json['description']),
      );

  String code;
  String description;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'code': code,
        'description': description,
      };
}
