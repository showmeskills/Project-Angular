import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/utils/util.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GGUserBalance {
  GGUserBalance({
    required this.isDigital,
    this.isActivate = false,
    this.currency,
    required this.balance,
    required this.sort,
    this.minAmount,
    this.walletCategory = 'Main',
  });

  bool isDigital;
  bool isActivate;
  String? currency;
  double balance;
  int sort;
  double? minAmount;
  String walletCategory;

  String get iconUrl =>
      CurrencyService.sharedInstance[currency ?? '']?.iconUrl ?? '';

  String get name => CurrencyService.sharedInstance[currency ?? '']?.name ?? '';

  String get balanceText {
    return NumberPrecision(balance).balanceText(isDigital);
  }

  String blanceTextWithSymbol(double nonStickyBalance) {
    String symbol = '';
    String balanceText = NumberPrecision(balance)
        .plus(NumberPrecision(nonStickyBalance))
        .balanceText(isDigital);
    if (isDigital) {
      if (CurrencyService.sharedInstance.diplayInFiat) {
        symbol =
            CurrencyService.sharedInstance.displayFiatCurrency?.symbol ?? '';
        balanceText = NumberPrecision(balance)
            .plus(NumberPrecision(nonStickyBalance))
            .balanceText(false);
      }
    } else {
      symbol = CurrencyService.sharedInstance[currency ?? '']?.symbol ?? '';
    }
    return '$symbol$balanceText';
  }

  factory GGUserBalance.fromJson(Map<String, dynamic> json) => GGUserBalance(
        isDigital: asT<bool?>(json['isDigital']) ?? false,
        currency: asT<String?>(json['currency']),
        balance: asT<double?>(json['balance']) ?? 0.0,
        sort: asT<int?>(json['sort']) ?? 0,
        minAmount: GGUtil.parseDouble(json['minAmount']),
        isActivate: GGUtil.parseBool(json['isActivate']),
        walletCategory: GGUtil.parseStr(json['walletCategory']),
      );

  @override
  String toString() {
    return 'GGUserBalance{isDigital: $isDigital, currency: $currency, balance: $balance, sort: $sort, minAmount: $minAmount, isActivate: $isActivate}';
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'isDigital': isDigital,
        'currency': currency,
        'balance': balance,
        'sort': sort,
        'isActivate': isActivate,
      };

  GGUserBalance copyWith({
    bool? isDigital,
    bool? isActivate,
    String? currency,
    double? balance,
    int? sort,
    double? minAmount,
    String? walletCategory,
  }) {
    return GGUserBalance(
      isDigital: isDigital ?? this.isDigital,
      isActivate: isActivate ?? this.isActivate,
      currency: currency ?? this.currency,
      balance: balance ?? this.balance,
      sort: sort ?? this.sort,
      minAmount: minAmount ?? this.minAmount,
      walletCategory: walletCategory ?? this.walletCategory,
    );
  }
}
