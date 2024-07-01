import 'package:gogaming_app/common/components/number_precision/number_precision.dart';

import 'gaming_main_wallet_currency_model.dart';

class GamingMainWalletModel {
  String category;
  double totalAsset;
  List<GamingMainWalletCurrencyModel> currencies;

  GamingMainWalletModel({
    this.category = 'Main',
    this.totalAsset = 0,
    this.currencies = const [],
  });

  /// 余额USDT
  String get totalAssetText => NumberPrecision(totalAsset).balanceText(true);

  @override
  String toString() {
    return 'OverviewWallet(category: $category, totalBalance: $totalAsset, currencies: $currencies)';
  }

  factory GamingMainWalletModel.fromJson(Map<String, Object?> json) {
    return GamingMainWalletModel(
      category: json['category'] as String? ?? 'Main',
      totalAsset: (json['totalAsset'] as num?)?.toDouble() ?? 0,
      currencies: (json['mainCurrencies'] as List<dynamic>?)
              ?.map((e) => GamingMainWalletCurrencyModel.fromJson(
                  e as Map<String, Object?>))
              .toList() ??
          [],
    );
  }

  Map<String, Object?> toJson() => {
        'category': category,
        'totalBalance': totalAsset,
        'currencies': currencies.map((e) => e.toJson()).toList(),
      };

  GamingMainWalletModel copyWith({
    String? category,
    double? totalBalance,
    List<GamingMainWalletCurrencyModel>? currencies,
  }) {
    return GamingMainWalletModel(
      category: category ?? this.category,
      totalAsset: totalBalance ?? totalAsset,
      currencies: currencies ?? this.currencies,
    );
  }
}
