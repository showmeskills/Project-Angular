import 'dart:convert';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/helper/time_helper.dart';
// ignore: depend_on_referenced_packages
import 'package:equatable/equatable.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class RealTimeBetInfoModel with EquatableMixin {
  RealTimeBetInfoModel({
    this.gameName,
    this.dateTime,
    this.betAmount,
    this.odds,
    this.payAmount,
    this.payAmountUsdt,
    this.currency,
    this.gameCategory,
    this.playerName,
    this.avatar,
    this.ranking,
    this.orderNum,
    this.gameProviderName,
  });

  factory RealTimeBetInfoModel.fromJson(Map<String, dynamic> json) =>
      RealTimeBetInfoModel(
        gameName: GGUtil.parseStr(json['gameName']),
        gameProviderName: GGUtil.parseStr(json['gameProviderName']),
        dateTime: GGUtil.parseInt(json['dateTime']),
        betAmount: GGUtil.parseDouble(json['betAmount']),
        odds: GGUtil.parseDouble(json['odds'], -99),
        payAmount: GGUtil.parseDouble(json['payAmount']),
        payAmountUsdt: GGUtil.parseDouble(json['payAmountUsdt']),
        currency: GGUtil.parseStr(json['currency']),
        gameCategory: GGUtil.parseStr(json['gameCategory']),
        playerName: GGUtil.parseStr(json['playerName']),
        avatar: GGUtil.parseStr(json['avatar']),
        ranking: GGUtil.parseInt(json['ranking']),
        orderNum: GGUtil.parseStr(json['orderNum']),
      );

  /// 游戏名称
  String? gameName;

  /// 厂商名称
  String? gameProviderName;

  /// 时间
  int? dateTime;

  /// 投注额
  double? betAmount;

  /// 赔率
  double? odds;

  /// 支付额
  double? payAmount;

  /// 支付额usdt
  double? payAmountUsdt;

  /// 币种 CNY, USD, THB...
  String? currency;

  /// GameType SportsBook体育 Esports电子竞技 Lottery彩票 LiveCasino真人娱乐 SlotGame电子游戏 Chess棋牌
  String? gameCategory;

  /// 玩家名
  String? playerName;

  /// 用户头像
  String? avatar;

  /// 排名
  int? ranking;

  /// 订单编号
  String? orderNum;

  @override
  List<Object> get props => [orderNum ?? '1', betAmount ?? '1'];

  String get oddsText =>
      odds == -99 ? '-' : '${(odds ?? 0.0).toEffectiveStringAsFixed()}x';

  String get gameNameText => '$gameName';

  String betAmountText({bool auto = true}) {
    final isDigital =
        CurrencyService.sharedInstance.isDigital(currency ?? 'USD');
    if (auto && isDigital) {
      final symbol =
          CurrencyService.sharedInstance.displayFiatCurrency?.symbol ?? '';
      final balanceText = CurrencyService.sharedInstance
          .cryptoToFiat(
            currency: currency!,
            balance: betAmount ?? 0,
          )
          .balanceText(!CurrencyService.sharedInstance.diplayInFiat);
      return symbol + balanceText;
    }
    return NumberPrecision(betAmount).balanceText(isDigital);
  }

  String payAmountText({bool auto = true}) {
    final isDigital =
        CurrencyService.sharedInstance.isDigital(currency ?? 'USD');
    if (auto && isDigital) {
      final symbol =
          CurrencyService.sharedInstance.displayFiatCurrency?.symbol ?? '';
      final balanceText = CurrencyService.sharedInstance
          .cryptoToFiat(
            currency: currency!,
            balance: payAmount ?? 0,
          )
          .balanceText(!CurrencyService.sharedInstance.diplayInFiat);
      return symbol + balanceText;
    }
    return NumberPrecision(payAmount).balanceText(isDigital);
  }

  String get dateTimeText {
    return DateFormat('MM-dd').formatTimestamp(dateTime ?? 0);
  }

  String get dateTimeShortText {
    return DateFormat('HH:mm').formatTimestamp(dateTime ?? 0);
  }

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'gameName': gameName,
        'gameProviderName': gameProviderName,
        'dateTime': dateTime,
        'betAmount': betAmount,
        'odds': odds,
        'payAmount': payAmount,
        'payAmountUsdt': payAmountUsdt,
        'currency': currency,
        'gameCategory': gameCategory,
        'playerName': playerName,
        'avatar': avatar,
        'ranking': ranking,
      };
}
