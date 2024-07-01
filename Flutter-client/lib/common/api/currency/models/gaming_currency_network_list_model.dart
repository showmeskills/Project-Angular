import 'gaming_currency_network_model.dart';

class GamingCurrencyNetworkListModel {
  String currency;
  String? name;
  String? icon;
  String? symbol;
  double? minDeposit;
  bool? isEnableWithdraw;
  bool? isEnableDeposit;
  List<GamingCurrencyNetworkModel> networks;
  int? sort;

  GamingCurrencyNetworkListModel({
    required this.currency,
    this.name,
    this.icon,
    this.symbol,
    this.minDeposit,
    this.isEnableWithdraw,
    this.isEnableDeposit,
    this.networks = const [],
    this.sort,
  });

  RegExp addressRegExp() {
    String source = "";
    for (var element in networks) {
      final isLast = element == networks.last;
      source += '(${element.addressRegex})';
      if (isLast == false) {
        source += '|';
      }
    }
    final reg = RegExp(source);
    return reg;
  }

  List<GamingCurrencyNetworkModel> matchNetworks(String address) {
    return networks.where((element) {
      return element.isPassAddress(address);
    }).toList();
  }

  @override
  String toString() {
    return 'GamingCurrencyNetworkListModel(currency: $currency, name: $name, icon: $icon, symbol: $symbol, minDeposit: $minDeposit, isEnableWithdraw: $isEnableWithdraw, isEnableDeposit: $isEnableDeposit, networks: $networks, sort: $sort)';
  }

  factory GamingCurrencyNetworkListModel.fromJson(Map<String, Object?> json) {
    return GamingCurrencyNetworkListModel(
      currency: json['currency'] as String,
      name: json['name'] as String?,
      icon: json['icon'] as String?,
      symbol: json['symbol'] as String?,
      minDeposit: (json['minDeposit'] as num?)?.toDouble(),
      isEnableWithdraw: json['isEnableWithdraw'] as bool?,
      isEnableDeposit: json['isEnableDeposit'] as bool?,
      networks: (json['networks'] as List<dynamic>?)
              ?.map((e) => GamingCurrencyNetworkModel.fromJson(
                  e as Map<String, Object?>))
              .toList() ??
          [],
      sort: json['sort'] as int?,
    );
  }

  Map<String, Object?> toJson() => {
        'currency': currency,
        'name': name,
        'icon': icon,
        'symbol': symbol,
        'minDeposit': minDeposit,
        'isEnableWithdraw': isEnableWithdraw,
        'isEnableDeposit': isEnableDeposit,
        'networks': networks.map((e) => e.toJson()).toList(),
        'sort': sort,
      };

  GamingCurrencyNetworkListModel copyWith({
    String? currency,
    String? name,
    String? icon,
    String? symbol,
    double? minDeposit,
    bool? isEnableWithdraw,
    bool? isEnableDeposit,
    List<GamingCurrencyNetworkModel>? networks,
    int? sort,
  }) {
    return GamingCurrencyNetworkListModel(
      currency: currency ?? this.currency,
      name: name ?? this.name,
      icon: icon ?? this.icon,
      symbol: symbol ?? this.symbol,
      minDeposit: minDeposit ?? this.minDeposit,
      isEnableWithdraw: isEnableWithdraw ?? this.isEnableWithdraw,
      isEnableDeposit: isEnableDeposit ?? this.isEnableDeposit,
      networks: networks ?? this.networks,
      sort: sort ?? this.sort,
    );
  }
}
