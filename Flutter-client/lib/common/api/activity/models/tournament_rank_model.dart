import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class TournamentRankModel {
  String? prizeId;
  int? rankNumber;
  double rankScore;
  int? tenantWinOrLost;
  String? userName;
  String? uid;
  int? uidActiveFlow;
  int? uidBetMoney;
  int? uidWinOrLost;
  double amount;
  String? currency;
  int? prizeType;
  String? prizeFullName;
  String? prizeShortName;
  // 只有推送数据有这个字段
  String? tmpCode;

  String get showUserName {
    if (userName?.isEmpty ?? true) {
      return localized("invisible");
    }
    return userName!;
  }

  String get formatCurrency {
    final selectedCurrency =
        CurrencyService.sharedInstance.selectedCurrency.currency ?? 'USDT';
    final isDigital =
        CurrencyService.sharedInstance.isDigital(selectedCurrency);

    if (!isDigital) {
      // 返回用户币种
      return selectedCurrency;
    } else {
      // 反之使用USDT
      return 'USDT';
    }
  }

  double get formatAmount {
    final selectedCurrency =
        CurrencyService.sharedInstance.selectedCurrency.currency ?? 'USDT';
    final isDigital =
        CurrencyService.sharedInstance.isDigital(selectedCurrency);
    final currency = this.currency ?? 'USDT';

    if (!isDigital) {
      // 法币且奖品币种等于用户币种直接返回
      if (selectedCurrency == currency) {
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
    if (!isDigital) {
      // 当前币种到usdt的汇率
      final selectedRate =
          CurrencyService.sharedInstance.getUSDTRate(selectedCurrency).toNP();
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

  TournamentRankModel({
    this.prizeId,
    this.rankNumber,
    this.rankScore = 0.0,
    this.tenantWinOrLost,
    this.userName,
    this.uid,
    this.uidActiveFlow,
    this.uidBetMoney,
    this.uidWinOrLost,
    this.amount = 0.0,
    this.currency,
    this.prizeType,
    this.prizeFullName,
    this.prizeShortName,
    this.tmpCode,
  });

  @override
  String toString() {
    return 'TournamentRankModel(prizeId: $prizeId, rankNumber: $rankNumber, rankScore: $rankScore, tenantWinOrLost: $tenantWinOrLost, userName: $userName, uidActiveFlow: $uidActiveFlow, uidBetMoney: $uidBetMoney, uidWinOrLost: $uidWinOrLost, amount: $amount, currency: $currency, prizeType: $prizeType, prizeFullName: $prizeFullName, prizeShortName: $prizeShortName)';
  }

  factory TournamentRankModel.fromJson(Map<String, Object?> json) {
    return TournamentRankModel(
      prizeId: asT<String>(json['prizeId']),
      rankNumber: asT<int>(json['rankNumber']),
      rankScore: asT<num>(json['rankScore'])?.toDouble() ?? 0.0,
      tenantWinOrLost: asT<int>(json['tenantWinOrLost']),
      userName: asT<String>(json['userName']),
      uid: asT<String>(json['uid']),
      uidActiveFlow: asT<int>(json['uidActiveFlow']),
      uidBetMoney: asT<int>(json['uidBetMoney']),
      uidWinOrLost: asT<int>(json['uidWinOrLost']),
      amount: asT<num>(json['amount'])?.toDouble() ?? 0.0,
      currency: asT<String>(json['currency']),
      prizeType: asT<int>(json['prizeType']),
      prizeFullName: asT<String>(json['prizeFullName']),
      prizeShortName: asT<String>(json['prizeShortName']),
    );
  }

  factory TournamentRankModel.fromJsonByWebSocket(Map<String, Object?> json) {
    return TournamentRankModel(
      prizeId: asT<String>(json['PrizeId']),
      rankNumber: asT<int>(json['RankNumber']),
      rankScore: asT<num>(json['RankScore'])?.toDouble() ?? 0.0,
      tenantWinOrLost: asT<int>(json['TenantWinOrLost']),
      userName: asT<String>(json['UserName']),
      uid: asT<String>(json['Uid']),
      uidActiveFlow: asT<int>(json['UidActiveFlow']),
      uidBetMoney: asT<int>(json['UidBetMoney']),
      uidWinOrLost: asT<int>(json['UidWinOrLost']),
      amount: asT<num>(json['Amount'])?.toDouble() ?? 0.0,
      currency: asT<String>(json['Currency']),
      prizeType: asT<int>(json['PrizeType']),
      prizeFullName: asT<String>(json['PrizeFullName']),
      prizeShortName: asT<String>(json['PrizeShortName']),
      tmpCode: asT<String>(json['TmpCode']),
    );
  }

  Map<String, Object?> toJson() => {
        'prizeId': prizeId,
        'rankNumber': rankNumber,
        'rankScore': rankScore,
        'tenantWinOrLost': tenantWinOrLost,
        'userName': userName,
        'uid': uid,
        'uidActiveFlow': uidActiveFlow,
        'uidBetMoney': uidBetMoney,
        'uidWinOrLost': uidWinOrLost,
        'amount': amount,
        'currency': currency,
        'prizeType': prizeType,
        'prizeFullName': prizeFullName,
        'prizeShortName': prizeShortName,
      };

  TournamentRankModel copyWith({
    String? prizeId,
    int? rankNumber,
    double? rankScore,
    int? tenantWinOrLost,
    String? userName,
    String? uid,
    int? uidActiveFlow,
    int? uidBetMoney,
    int? uidWinOrLost,
    double? amount,
    String? currency,
    int? prizeType,
    String? prizeFullName,
    String? prizeShortName,
    String? tmpCode,
  }) {
    return TournamentRankModel(
      prizeId: prizeId ?? this.prizeId,
      rankNumber: rankNumber ?? this.rankNumber,
      rankScore: rankScore ?? this.rankScore,
      tenantWinOrLost: tenantWinOrLost ?? this.tenantWinOrLost,
      userName: userName ?? this.userName,
      uid: uid ?? this.uid,
      uidActiveFlow: uidActiveFlow ?? this.uidActiveFlow,
      uidBetMoney: uidBetMoney ?? this.uidBetMoney,
      uidWinOrLost: uidWinOrLost ?? this.uidWinOrLost,
      amount: amount ?? this.amount,
      currency: currency ?? this.currency,
      prizeType: prizeType ?? this.prizeType,
      prizeFullName: prizeFullName ?? this.prizeFullName,
      prizeShortName: prizeShortName ?? this.prizeShortName,
      tmpCode: tmpCode ?? this.tmpCode,
    );
  }
}
