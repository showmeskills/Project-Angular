import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingWalletOverviewCurrencyModel {
  String currency;
  double balance;
  double withdrawLimit;
  num freezeAmount;

  GamingWalletOverviewCurrencyModel({
    required this.currency,
    this.balance = 0,
    this.withdrawLimit = 0,
    this.freezeAmount = 0,
  });

  String get withdrawLimitText => NumberPrecision(withdrawLimit)
      .balanceText(CurrencyService()[currency]?.isDigital ?? false);

  /// 待确定USDT
  String get freezeText => NumberPrecision(freezeAmount).balanceText(isDigital);

  String get iconUrl {
    return CurrencyService.sharedInstance.getIconUrl(currency);
  }

  bool get isDigital {
    return CurrencyService.sharedInstance.isDigital(currency);
  }

  /// 余额USDT
  String get balanceText => NumberPrecision(balance).balanceText(isDigital);

  @override
  String toString() {
    return 'Currency(currency: $currency, balance: $balance, withdrawLimit: $withdrawLimit)';
  }

  factory GamingWalletOverviewCurrencyModel.fromJson(
          Map<String, Object?> json) =>
      GamingWalletOverviewCurrencyModel(
        currency: json['currency'] as String,
        balance: (json['balance'] as num?)?.toDouble() ?? 0,
        withdrawLimit: (json['withdrawLimit'] as num?)?.toDouble() ?? 0,
        freezeAmount: asT<num>(json['freezeAmount']) ?? 0,
      );

  Map<String, Object?> toJson() => {
        'currency': currency,
        'balance': balance,
        'withdrawLimit': withdrawLimit,
        'freezeAmount': freezeAmount,
      };
}
