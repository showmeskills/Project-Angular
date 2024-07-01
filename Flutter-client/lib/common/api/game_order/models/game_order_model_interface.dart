// ignore_for_file: public_member_api_docs, sort_constructors_first
import 'package:flutter/material.dart';

import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';
import 'package:gogaming_app/helper/time_helper.dart';

abstract class GameOrderInterface {
  String wagerNumber;
  String wagerStatus;
  String currency;
  double betAmount;
  double? payoutAmount;
  int betTime;

  String gameProvider;
  String status;
  String odds;
  bool isReserved;
  String gameCode;

  GameOrderInterface({
    required this.wagerNumber,
    required this.wagerStatus,
    required this.currency,
    required this.betAmount,
    this.payoutAmount,
    required this.betTime,
    this.gameProvider = '',
    required this.status,
    this.odds = 'x',
    this.isReserved = false,
    this.gameCode = '',
  });

  Color get statusColor {
    switch (wagerStatus) {
      case 'Settlement':
        return GGColors.successText.color;
      default:
        return GGColors.error.color;
    }
  }

  String get betAmountText {
    return NumberPrecision(betAmount)
        .balanceText(CurrencyService.sharedInstance.isDigital(currency));
  }

  double get betAmountUSDT {
    return betAmount * CurrencyService.sharedInstance.getUSDTRate(currency);
  }

  String get betAmountUSDTText {
    return NumberPrecision(betAmountUSDT).balanceText(true);
  }

  bool get isWin => (payoutAmount ?? 0) > 0;

  String get payoutAmountText {
    return NumberPrecision(payoutAmount ?? 0)
        .balanceText(CurrencyService.sharedInstance.isDigital(currency));
  }

  String get payoutAmountUSDTText {
    return NumberPrecision((payoutAmount ?? 0) *
            CurrencyService.sharedInstance.getUSDTRate(currency))
        .balanceText(true);
  }

  String get payoutAmountUSDTTextWithSymbol {
    if (payoutAmount == null) {
      return '-';
    } else {
      if (payoutAmount! > 0) {
        return '+$payoutAmountUSDTText';
      } else {
        return payoutAmountUSDTText;
      }
    }
  }

  String get payoutAmountTextWithSymbol {
    if (payoutAmount == null) {
      return '-';
    } else {
      if (payoutAmount! > 0) {
        return '+$payoutAmountText';
      } else {
        return payoutAmountText;
      }
    }
  }

  Color get payoutAmountColor {
    if ((payoutAmount ?? 0) == 0) {
      return GGColors.textMain.color;
    } else {
      if (payoutAmount! > 0) {
        return GGColors.success.color;
      } else {
        return GGColors.error.color;
      }
    }
  }

  String get betDateTimeText {
    return DateFormat('yyyy-MM-dd HH:mm:ss').formatTimestamp(betTime);
  }

  String get currencyIconUrl {
    return CurrencyService.sharedInstance.getIconUrl(currency);
  }
}
