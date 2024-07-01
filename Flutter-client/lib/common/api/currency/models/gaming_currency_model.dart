import 'dart:convert';

import 'package:gogaming_app/config/config.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingCurrencyModel {
  GamingCurrencyModel({
    this.currency,
    this.name,
    this.icon,
    this.symbol,
    this.minDeposit,
    required this.isDigital,
    required this.isVisible,
    required this.sort,
  });

  factory GamingCurrencyModel.usdt() {
    return GamingCurrencyModel(
      currency: 'USDT',
      isDigital: true,
      isVisible: true,
      sort: 1,
    );
  }

  factory GamingCurrencyModel.cny() {
    return GamingCurrencyModel(
      currency: 'CNY',
      icon:
          '${Config.currentConfig.resourceDomain}Currency/22/27/02/637817848741945893/img/cny.png',
      isDigital: false,
      isVisible: true,
      sort: 2,
    );
  }

  /// 币种 BTC
  String? currency;

  /// 名称 bitcoin
  String? name;
  String? icon;

  /// 符号
  String? symbol;

  /// 最低存款金额
  double? minDeposit;

  /// 是否虚拟货币
  bool isDigital;

  /// 是否可以显示
  bool isVisible;

  /// 排序
  int sort;

  // List<GamingTokenNetworkAddress> withdrawNetworks;

  String get iconUrl {
    return icon ??
        '${Config.currentConfig.resourceDomain}Currency/22/19/04/637846355879592906/img/IMG_0050.PNG';
  }

  factory GamingCurrencyModel.fromJson(Map<String, dynamic> json) =>
      GamingCurrencyModel(
        currency: asT<String?>(json['currency']),
        name: asT<String?>(json['name']),
        icon: asT<String?>(json['icon']),
        symbol: asT<String?>(json['symbol']),
        minDeposit: asT<double?>(json['minDeposit']),
        isDigital: asT<bool?>(json['isDigital']) ?? true,
        isVisible: asT<bool?>(json['isVisible']) ?? true,
        sort: asT<int?>(json['sort']) ?? 0,
      );

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'currency': currency,
        'name': name,
        'icon': icon,
        'symbol': symbol,
        'minDeposit': minDeposit,
        'isDigital': isDigital,
        'isVisible': isVisible,
        'sort': sort,
      };
}
