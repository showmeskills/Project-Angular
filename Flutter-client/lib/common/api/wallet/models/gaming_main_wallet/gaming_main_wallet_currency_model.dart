import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';

class GamingMainWalletCurrencyModel {
  String currency;
  double total;
  double canUseAmount;
  double freezeAmount;

  String get iconUrl {
    return CurrencyService.sharedInstance.getIconUrl(currency);
  }

  bool get isDigital {
    return CurrencyService.sharedInstance.isDigital(currency);
  }

  String get totalText => NumberPrecision(total).balanceText(isDigital);

  String get canUseAmountText =>
      NumberPrecision(canUseAmount).balanceText(isDigital);

  String get freezeAmountText =>
      NumberPrecision(freezeAmount).balanceText(isDigital);

  GamingMainWalletCurrencyModel({
    required this.currency,
    this.total = 0,
    this.canUseAmount = 0,
    this.freezeAmount = 0,
  });

  @override
  String toString() {
    return 'GamingMainWalletCurrencyModel(currency: $currency, total: $total, canUseAmount: $canUseAmount, freezeAmount: $freezeAmount)';
  }

  factory GamingMainWalletCurrencyModel.fromJson(Map<String, Object?> json) {
    return GamingMainWalletCurrencyModel(
      currency: json['currency'] as String,
      total: (json['total'] as num?)?.toDouble() ?? 0.0,
      canUseAmount: (json['canUseAmount'] as num?)?.toDouble() ?? 0.0,
      freezeAmount: (json['freezeAmount'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, Object?> toJson() => {
        'currency': currency,
        'total': total,
        'canUseAmount': canUseAmount,
        'freezeAmount': freezeAmount,
      };

  GamingMainWalletCurrencyModel copyWith({
    String? currency,
    double? total,
    double? canUseAmount,
    double? freezeAmount,
  }) {
    return GamingMainWalletCurrencyModel(
      currency: currency ?? this.currency,
      total: total ?? this.total,
      canUseAmount: canUseAmount ?? this.canUseAmount,
      freezeAmount: freezeAmount ?? this.freezeAmount,
    );
  }
}
