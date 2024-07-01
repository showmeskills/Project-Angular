import 'dart:convert';

import 'package:gogaming_app/common/utils/util.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class CryptoAddressModel {
  CryptoAddressModel({
    this.id,
    this.remark,
    this.currency,
    this.network,
    this.address,
    this.isWhiteList,
    this.selected = false,
    required this.paymentMethod,
  });

  factory CryptoAddressModel.fromJson(Map<String, dynamic> json) =>
      CryptoAddressModel(
        id: asT<int?>(json['id']),
        remark: asT<String?>(json['remark']),
        currency: asT<String?>(json['currency']),
        network: asT<String?>(json['network']),
        address: asT<String?>(json['address']),
        isWhiteList: asT<bool?>(json['isWhiteList']),
        paymentMethod: GGUtil.parseStr(json["paymentMethod"]),
      );

  int? id;

  /// 备注
  String? remark;

  /// 币种（为空时是通用地址）在WU17367任务中字段废弃不用
  // String? token;
  /// 币种（为空时是通用地址）
  String? currency;

  /// 是否通用地址
  bool get isUniversalAddress => currency == null || currency?.isEmpty == true;

  /// 网络
  String? network;

  /// 地址
  String? address;

  /// 是否白名单
  bool? isWhiteList;

  /// 编辑状态是否选中
  bool selected;

  /// 电子钱包支付方式
  String paymentMethod;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'remark': remark,
        'currency': currency,
        'network': network,
        'address': address,
        'isWhiteList': isWhiteList,
        'paymentMethod': paymentMethod,
      };
}
