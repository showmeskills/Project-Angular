import 'dart:convert';

import 'package:gogaming_app/common/utils/util.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingIpModel {
  const GamingIpModel(
      {this.lang, this.countryCode, this.ip, this.countryCurrency});

  factory GamingIpModel.fromJson(Map<String, dynamic> json) => GamingIpModel(
        lang: asT<String?>(json['lang']),
        countryCode: asT<String?>(json['countryCode']),
        ip: GGUtil.parseStr(json['ip']),
        countryCurrency: GGUtil.parseStr(json['countryCurrency']),
      );

  final String? lang;
  final String? countryCode;
  final String? ip;
  final String? countryCurrency;
  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'lang': lang,
        'countryCode': countryCode,
        'ip': ip,
        'countryCurrency': countryCurrency
      };
}
