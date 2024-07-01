import 'package:gogaming_app/common/components/number_precision/number_precision.dart';

import 'gaming_overview_wallet_currency.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingOverviewMainWalletModel {
  String category;
  double totalBalance;
  num totalFreezeAmount;
  List<GamingWalletOverviewCurrencyModel> currencies;

  GamingOverviewMainWalletModel({
    this.category = 'Main',
    this.totalBalance = 0,
    this.currencies = const [],
    this.totalFreezeAmount = 0,
  });

  /// 余额USDT
  String get totalBalanceText =>
      NumberPrecision(totalBalance).balanceText(true);

  /// 待确定USDT
  String get totalFreezeText =>
      NumberPrecision(totalFreezeAmount).balanceText(false);

  @override
  String toString() {
    return 'OverviewWallet(category: $category, totalBalance: $totalBalance, currencies: $currencies)';
  }

  factory GamingOverviewMainWalletModel.fromJson(Map<String, Object?> json) {
    return GamingOverviewMainWalletModel(
      category: json['category'] as String? ?? 'Main',
      totalBalance: (json['totalBalance'] as num?)?.toDouble() ?? 0,
      totalFreezeAmount: asT<num>(json['totalFreezeAmount']) ?? 0,
      currencies: (json['currencies'] as List<dynamic>?)
              ?.map((e) => GamingWalletOverviewCurrencyModel.fromJson(
                  e as Map<String, Object?>))
              .toList() ??
          [],
    );
  }

  Map<String, Object?> toJson() => {
        'category': category,
        'totalBalance': totalBalance,
        'totalFreezeAmount': totalFreezeAmount,
        'currencies': currencies.map((e) => e.toJson()).toList(),
      };

  // GamingOverviewMainWalletModel copyWith({
  //   String? category,
  //   double? totalBalance,
  //   List<GamingWalletOverviewCurrencyModel>? currencies,
  // }) {
  //   return GamingOverviewMainWalletModel(
  //     category: category ?? this.category,
  //     totalBalance: totalBalance ?? this.totalBalance,
  //     currencies: currencies ?? this.currencies,
  //   );
  // }
}
