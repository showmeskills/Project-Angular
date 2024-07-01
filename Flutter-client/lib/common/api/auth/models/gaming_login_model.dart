import 'dart:convert';

import 'package:gogaming_app/common/utils/util.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

/// 对应loginByMobile/loginByName的解析
class GamingLoginModel {
  const GamingLoginModel({
    this.need2Fa,
    this.token,
    this.uniCode,
    this.tFaMobile,
    this.areaCode,
    this.mobile,
    this.tFaGoogle,
    this.tFaEmail,
    this.email,
  });

  factory GamingLoginModel.fromJson(Map<String, dynamic> json) =>
      GamingLoginModel(
        need2Fa: GGUtil.parseBool(json['need2Fa']),
        token: GGUtil.parseStr(json['token']),
        uniCode: GGUtil.parseStr(json['uniCode']),
        tFaMobile: GGUtil.parseBool(json['tFaMobile']),
        areaCode: GGUtil.parseStr(json['areaCode']),
        mobile: GGUtil.parseStr(json['mobile']),
        tFaGoogle: GGUtil.parseBool(json['tFaGoogle']),
        tFaEmail: GGUtil.parseBool(json['tFaEmail']),
        email: GGUtil.parseStr(json['email']),
      );

  final bool? need2Fa;
  final String? token;
  final String? uniCode;
  final bool? tFaMobile;
  final String? areaCode;
  final String? mobile;
  final bool? tFaGoogle;
  final bool? tFaEmail;
  final String? email;
  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'need2Fa': need2Fa,
        'token': token,
        'uniCode': uniCode,
        'tFaMobile': tFaMobile,
        'areaCode': areaCode,
        'mobile': mobile,
        'tFaGoogle': tFaGoogle,
        'email': email,
        'tFaEmail': tFaEmail
      };
}
