import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/widget_header.dart';

import 'tournament_award_rang_model.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class TournamentAwardModel {
  int? rankNum;
  double amount;
  String? currency;
  int? prizeType;
  String? prizeFullName;
  String? prizeShortName;

  String get formatCurrency {
    final selectedCurrency = CurrencyService.sharedInstance.selectedCurrency;

    if (!selectedCurrency.isDigital) {
      // 返回用户币种
      return selectedCurrency.currency ?? 'USDT';
    } else {
      // 反之使用USDT
      return 'USDT';
    }
  }

  double get formatAmount {
    final selectedCurrency = CurrencyService.sharedInstance.selectedCurrency;
    final currency = this.currency ?? 'USDT';

    if (!selectedCurrency.isDigital) {
      // 法币且奖品币种等于用户币种直接返回
      if (selectedCurrency.currency == currency) {
        return amount;
      }
    } else {
      // 虚拟币且奖品币种等于USDT直接返回
      if (currency == 'USDT') {
        return amount;
      }
    }

    // 奖品币种到usdt的汇率
    NumberPrecision rate =
        CurrencyService.sharedInstance.getUSDTRate(currency).toNP();

    // 是法币的情况下
    if (!selectedCurrency.isDigital) {
      // 当前币种到usdt的汇率
      final selectedRate = CurrencyService.sharedInstance
          .getUSDTRate(selectedCurrency.currency)
          .toNP();
      // 换算回当前币种
      rate = rate.divide(selectedRate);
    }
    return amount.toNP().times(rate).toNumber();
  }

  String get amountString {
    return formatAmount > 1
        ? formatAmount.truncate().toString()
        : formatAmount.toStringAsFixedWithoutRound(2);
  }

  TournamentAwardModel({
    this.rankNum,
    this.amount = 0.0,
    this.currency,
    this.prizeType,
    this.prizeFullName,
    this.prizeShortName,
  });

  @override
  String toString() {
    return 'TournamentAwardModel(rankNum: $rankNum, amount: $amount, currency: $currency, prizeType: $prizeType, prizeFullName: $prizeFullName, prizeShortName: $prizeShortName)';
  }

  factory TournamentAwardModel.fromJson(Map<String, Object?> json) {
    return TournamentAwardModel(
      rankNum: asT<int>(json['rankNum']),
      amount: asT<num>(json['amount'])?.toDouble() ?? 0.0,
      currency: asT<String>(json['currency']),
      prizeType: asT<int>(json['prizeType']),
      prizeFullName: asT<String>(json['prizeFullName']),
      prizeShortName: asT<String>(json['prizeShortName']),
    );
  }

  Map<String, Object?> toJson() => {
        'rankNum': rankNum,
        'amount': amount,
        'currency': currency,
        'prizeType': prizeType,
        'prizeFullName': prizeFullName,
        'prizeShortName': prizeShortName,
      };

  TournamentAwardModel copyWith({
    int? rankNum,
    double? amount,
    String? currency,
    int? prizeType,
    String? prizeFullName,
    String? prizeShortName,
  }) {
    return TournamentAwardModel(
      rankNum: rankNum ?? this.rankNum,
      amount: amount ?? this.amount,
      currency: currency ?? this.currency,
      prizeType: prizeType ?? this.prizeType,
      prizeFullName: prizeFullName ?? this.prizeFullName,
      prizeShortName: prizeShortName ?? this.prizeShortName,
    );
  }

  TournamentAwardRangModel toRangModel() {
    return TournamentAwardRangModel(
      rankNumStart: rankNum!,
      rankNumEnd: rankNum!,
      amount: amount,
      currency: currency,
      prizeFullName: prizeFullName,
      prizeShortName: prizeShortName,
    );
  }
}
