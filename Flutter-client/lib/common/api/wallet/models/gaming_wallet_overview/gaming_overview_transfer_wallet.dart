import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/utils/util.dart';

import '../../../../components/number_precision/number_precision.dart';
import '../gg_user_balance.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingOverviewNonStickyBonusWallet {
  String? category;

  num? totalAmount;

  num? amount;

  String? currency;

  GamingOverviewNonStickyBonusWallet({
    required this.category,
    this.totalAmount,
    this.amount,
    this.currency,
  });

  @override
  String toString() {
    return 'GamingOverviewNonStickyBonusWallet{category: $category, totalAmount: $totalAmount, amount: $amount, currency: $currency}';
  }

  String get amountText {
    return NumberPrecision(amount)
        .balanceText(CurrencyService.sharedInstance.isDigital(currency ?? ''));
  }

  factory GamingOverviewNonStickyBonusWallet.fromJson(
      Map<String, Object?> json) {
    return GamingOverviewNonStickyBonusWallet(
      category: asT<String?>(json['category']),
      totalAmount: asT<num?>(json['totalAmount']),
      amount: asT<num?>(json['amount']),
      currency: asT<String?>(json['currency']),
    );
  }

  Map<String, Object?> toJson() => {
        'category': category,
        'totalAmount': totalAmount,
        'amount': amount,
        'currency': currency,
      };

  GamingOverviewNonStickyBonusWallet copyWith({
    String? category,
    num? totalAmount,
    num? amount,
    String? currency,
  }) {
    return GamingOverviewNonStickyBonusWallet(
      category: category ?? this.category,
      totalAmount: totalAmount ?? this.totalAmount,
      amount: amount ?? this.amount,
      currency: currency ?? this.currency,
    );
  }
}

class GamingOverviewTransferWalletModel {
  String category;

  /// 钱包名称
  String? walletName;

  /// 游戏提供商Id，转账制钱包才有值
  String providerId;

  /// 是否初次创建 (针对转账制钱包) true：是 false：否
  bool isFirst;

  /// 转出最小金额，暂不区分币种
  double? outMinAmount;

  List<GGUserBalance> currencies;

  /// 厂商分类
  List<int>? providerCategorys;

  GamingOverviewTransferWalletModel({
    required this.category,
    required this.providerId,
    this.isFirst = true,
    this.currencies = const [],
    this.walletName,
    this.outMinAmount,
    this.providerCategorys,
  });

  bool get isMainWallet => category.toLowerCase() == "main";

  @override
  String toString() {
    return 'GamingTransferWalletModel{category: $category, walletName: $walletName, providerId: $providerId, isFirst: $isFirst, outMinAmount: $outMinAmount, currencies: $currencies}';
  }

  factory GamingOverviewTransferWalletModel.fromJson(
      Map<String, Object?> json) {
    return GamingOverviewTransferWalletModel(
      category: json['category'] as String,
      providerId: json['providerId'] as String,
      isFirst: json['isFirst'] as bool? ?? true,
      currencies: (json['currencies'] as List<dynamic>?)
              ?.map((e) => GGUserBalance.fromJson(e as Map<String, Object?>))
              .toList() ??
          [],
      walletName: GGUtil.parseStr(json['walletName']),
      outMinAmount: GGUtil.parseDouble(json['outMinAmount']),
      providerCategorys: GGUtil.parseList(
        json['providerCategorys'],
        ((e) => e is num ? e.toInt() : 1),
      ),
    );
  }

  Map<String, Object?> toJson() => {
        'category': category,
        'providerId': providerId,
        'isFirst': isFirst,
        'currencies': currencies.map((e) => e.toJson()).toList(),
        'outMinAmount': outMinAmount,
        'walletName': walletName,
        'providerCategorys': providerCategorys,
      };

  GamingOverviewTransferWalletModel copyWith({
    String? category,
    String? providerId,
    bool? isFirst,
    List<GGUserBalance>? currencies,
    List<int>? providerCategorys,
  }) {
    return GamingOverviewTransferWalletModel(
      category: category ?? this.category,
      providerId: providerId ?? this.providerId,
      isFirst: isFirst ?? this.isFirst,
      currencies: currencies ?? this.currencies,
      providerCategorys: providerCategorys ?? this.providerCategorys,
    );
  }
}

extension Action on GamingOverviewTransferWalletModel {
  // bool get isMainWallet => category != null && category.toLowerCase() == "main";

  // 查看两个钱包的支持币种的交集
  List<GGUserBalance> intersectionCurrencies(
      GamingOverviewTransferWalletModel other) {
    // 查看主账户钱包 与 子账户钱包的可选币种的交集
    Set<String?> aNames = currencies.map((e) => e.currency).toSet();
    Set<String?> bNames = other.currencies.map((e) => e.currency).toSet();
    Set<String?> findNames = aNames.intersection(bNames);
    List<GGUserBalance> result = currencies
        .where((element) => findNames.contains(element.currency))
        .toList();
    return result;
  }
}
