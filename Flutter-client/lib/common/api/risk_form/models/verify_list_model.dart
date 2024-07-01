import 'dart:convert';
import 'package:gogaming_app/common/utils/util.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class VerifyListModel {
  VerifyListModel({
    this.authenticationType,
    this.value,
    this.isAuthentication,
  });

  factory VerifyListModel.fromJson(Map<String, dynamic> json) =>
      VerifyListModel(
        authenticationType: GGUtil.parseStr(json['authenticationType']),
        value: GGUtil.parseInt(json['value']),
        isAuthentication: GGUtil.parseBool(json['isAuthentication']),
      );

  String? authenticationType;
  int? value;
  bool? isAuthentication;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'authenticationType': authenticationType,
        'value': value,
        'isAuthentication': isAuthentication,
      };
}
