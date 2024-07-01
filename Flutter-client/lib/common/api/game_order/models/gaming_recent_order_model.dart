import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingRecentOrderModel {
  String? gameName;
  int? betTime;
  String odds;
  String currency;
  double betAmount;
  double payoutAmount;

  String get betAmountText {
    return NumberPrecision(betAmount)
        .balanceText(CurrencyService.sharedInstance.isDigital(currency));
  }

  String get currencyIconUrl {
    return CurrencyService.sharedInstance.getIconUrl(currency);
  }

  GamingRecentOrderModel({
    required this.gameName,
    this.betTime,
    required this.odds,
    required this.currency,
    this.betAmount = 0,
    this.payoutAmount = 0,
  });

  @override
  String toString() {
    return 'GamingGameOrderModel(gameName: $gameName, betTime: $betTime, odds: $odds, currency: $currency, betAmount: $betAmount, payoutAmount: $payoutAmount)';
  }

  factory GamingRecentOrderModel.fromJson(Map<String, Object?> json) {
    return GamingRecentOrderModel(
      gameName: asT<String>(json['gameName']),
      betTime: json['betTime'] as int?,
      odds: json['odds'] as String,
      currency: json['currency'] as String,
      betAmount: (json['betAmount'] as num).toDouble(),
      payoutAmount: (json['payoutAmount'] as num?)?.toDouble() ?? 0,
    );
  }

  Map<String, Object?> toJson() => {
        'gameName': gameName,
        'betTime': betTime,
        'odds': odds,
        'currency': currency,
        'betAmount': betAmount,
        'payoutAmount': payoutAmount,
      };

  GamingRecentOrderModel copyWith({
    String? gameName,
    int? betTime,
    String? odds,
    String? currency,
    double? betAmount,
    double? payoutAmount,
  }) {
    return GamingRecentOrderModel(
      gameName: gameName ?? this.gameName,
      betTime: betTime ?? this.betTime,
      odds: odds ?? this.odds,
      currency: currency ?? this.currency,
      betAmount: betAmount ?? this.betAmount,
      payoutAmount: payoutAmount ?? this.payoutAmount,
    );
  }
}
