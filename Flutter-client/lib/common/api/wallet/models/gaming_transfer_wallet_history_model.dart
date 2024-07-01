import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';

class GamingTransferWalletHistoryModel {
  String transactionId;
  String transferType;
  double? amount;
  double? balance;
  String currency;
  int createdTime;

  GamingTransferWalletHistoryModel({
    required this.transactionId,
    required this.transferType,
    this.amount,
    this.balance,
    required this.currency,
    required this.createdTime,
  });

  String get transferTypeText {
    if (transferType == 'TransferInto') {
      return localized('acc_trans');
    }
    return localized('acc_out');
  }

  String get amountText {
    return NumberPrecision(amount).balanceText(isDigital);
  }

  String get balanceText {
    return NumberPrecision(balance).balanceText(isDigital);
  }

  bool get isDigital {
    return CurrencyService.sharedInstance.isDigital(currency);
  }

  String get currencyIconUrl {
    return CurrencyService.sharedInstance.getIconUrl(currency);
  }

  @override
  String toString() {
    return 'GamingWalletHistoryModel(transactionId: $transactionId, transferType: $transferType, amount: $amount, balance: $balance, currency: $currency, createdTime: $createdTime)';
  }

  factory GamingTransferWalletHistoryModel.fromJson(Map<String, Object?> json) {
    return GamingTransferWalletHistoryModel(
      transactionId: json['transactionId'] as String,
      transferType: json['transferType'] as String,
      amount: (json['amount'] as num?)?.toDouble(),
      balance: (json['balance'] as num?)?.toDouble(),
      currency: json['currency'] as String,
      createdTime: json['createdTime'] as int,
    );
  }

  Map<String, Object?> toJson() => {
        'transactionId': transactionId,
        'transferType': transferType,
        'amount': amount,
        'balance': balance,
        'currency': currency,
        'createdTime': createdTime,
      };

  GamingTransferWalletHistoryModel copyWith({
    String? transactionId,
    String? transferType,
    double? amount,
    double? balance,
    String? currency,
    int? createdTime,
  }) {
    return GamingTransferWalletHistoryModel(
      transactionId: transactionId ?? this.transactionId,
      transferType: transferType ?? this.transferType,
      amount: amount ?? this.amount,
      balance: balance ?? this.balance,
      currency: currency ?? this.currency,
      createdTime: createdTime ?? this.createdTime,
    );
  }
}
