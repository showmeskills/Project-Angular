import 'dart:convert';

import 'package:gogaming_app/common/utils/util.dart';

/// 红利发放方式
T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingBonusGrantTypeModel {
  GamingBonusGrantTypeModel({
    required this.code,
    required this.description,
  });

  factory GamingBonusGrantTypeModel.fromJson(Map<String, dynamic> json) =>
      GamingBonusGrantTypeModel(
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
