import 'dart:convert';
import 'package:gogaming_app/common/utils/util.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class EWalletPaymentListModel {
  EWalletPaymentListModel({
    this.code,
    this.name,
    this.walletAddressValid,
    this.supportCurrency,
  });

  factory EWalletPaymentListModel.fromJson(Map<String, dynamic> json) {
    final List<String>? supportCurrency =
        json['supportCurrency'] is List ? <String>[] : null;
    if (supportCurrency != null) {
      for (final dynamic item in json['supportCurrency']! as List) {
        if (item != null) {
          supportCurrency.add(GGUtil.parseStr(item));
        }
      }
    }
    return EWalletPaymentListModel(
      code: GGUtil.parseStr(json['code']),
      name: GGUtil.parseStr(json['name']),
      walletAddressValid: GGUtil.parseStr(json['walletAddressValid']),
      supportCurrency: supportCurrency,
    );
  }

  String? code;
  String? name;
  String? walletAddressValid;
  List<String>? supportCurrency;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'code': code,
        'name': name,
        'walletAddressValid': walletAddressValid,
        'supportCurrency': supportCurrency,
      };
}
