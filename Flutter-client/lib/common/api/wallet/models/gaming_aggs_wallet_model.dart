import 'package:big_dart/big_dart.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';

import 'gaming_wallet_overview/gaming_overview_transfer_wallet.dart';

class GamingAggsWalletModel {
  final String category;

  /// 游戏提供商Id，转账制钱包才有值
  final String? providerId;
  final bool isFirst;
  final List<GamingAggsWalletCurrencyModel> currencies;

  /// 厂商分类
  List<int>? providerCategorys;

  List<String> get currenciesName {
    return currencies.map((e) => e.currency).toList();
  }

  Big get total {
    if (currencies.isEmpty) {
      return Big(0);
    }
    return currencies.map((e) => e.convertUSDT).reduce((value, element) {
      return value + element;
    });
  }

  @override
  String toString() {
    return 'DashboardWalletModel{category: $category, providerId: $providerId, isFirst: $isFirst, currencies: $currencies}';
  }

  String get totalText {
    return NumberPrecision(total).balanceText(false);
  }

  GamingAggsWalletModel({
    required this.category,
    this.providerId,
    this.isFirst = false,
    this.currencies = const [],
    this.providerCategorys = const [],
  });

  // 转换余额为0的钱包Model
  factory GamingAggsWalletModel.fromTransferWallet(
      GamingOverviewTransferWalletModel transferWallet) {
    return GamingAggsWalletModel(
      category: transferWallet.category,
      providerId: transferWallet.providerId,
      isFirst: transferWallet.isFirst,
      currencies: transferWallet.isFirst
          ? []
          : transferWallet.currencies
              .map((e) => GamingAggsWalletCurrencyModel(
                    currency: e.currency!,
                  ))
              .toList(),
      providerCategorys: transferWallet.providerCategorys,
    );
  }
}

class GamingAggsWalletCurrencyModel {
  String currency;
  double totalBalance;
  double rate;
  bool isDigital;
  double availBalanceForWithdraw;
  GamingAggsWalletCurrencyModel({
    required this.currency,
    this.totalBalance = 0,
    this.rate = 1,
    this.availBalanceForWithdraw = 0,
  }) : isDigital = CurrencyService.sharedInstance.isDigital(currency);

  String get balanceText {
    return NumberPrecision(totalBalance).balanceText(isDigital);
  }

  @override
  String toString() {
    return 'DashboardWalletCurrencyModel{currency: $currency, totalBalance: $totalBalance, rate: $rate, isDigital: $isDigital availBalanceForWithdraw:$availBalanceForWithdraw}';
  }

  Big get convertUSDT {
    return Big(totalBalance) * Big(rate);
  }
}
