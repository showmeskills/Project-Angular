import 'dart:convert';

import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';
import 'package:gogaming_app/common/theme/text_styles/gg_text_styles.dart';
import 'package:gogaming_app/pages/game_order/game_order_detail/models/game_order_detail_interface.dart';
import 'package:gogaming_app/pages/game_order/game_order_detail/models/game_order_detail_layout.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

/// 查询娱乐城交易记录详情返回数据
class CasinoOrderDetail with GameOrderDetailInterface {
  CasinoOrderDetail({
    this.wagerNumber,
    this.gameProvider,
    this.betAmount,
    this.principal,
    this.bonus,
    this.payoutAmount,
    this.betTime,
    this.status,
    this.gameCategory,
    this.gameName,
    this.rebateAmount,
    this.refundAmount,
    this.activeFlow,
    this.settleTime,
    this.isReserved,
    this.currency,
    this.odds,
    this.playOption,
    this.table,
    this.isNonStickyBet,
    this.nonStickyBetAmount,
  });

  factory CasinoOrderDetail.fromJson(Map<String, dynamic> json) =>
      CasinoOrderDetail(
        wagerNumber: asT<String?>(json['wagerNumber']),
        gameProvider: asT<String?>(json['gameProvider']),
        betAmount: asT<num?>(json['betAmount']),
        principal: asT<num?>(json['principal']),
        bonus: asT<num?>(json['bonus']),
        payoutAmount: asT<num?>(json['payoutAmount']),
        betTime: asT<int?>(json['betTime']),
        status: asT<String?>(json['status']),
        gameCategory: asT<String?>(json['gameCategory']),
        gameName: asT<String?>(json['gameName']),
        rebateAmount: asT<num?>(json['rebateAmount']),
        refundAmount: asT<num?>(json['refundAmount']),
        activeFlow: asT<num?>(json['activeFlow']),
        settleTime: asT<int?>(json['settleTime']),
        isReserved: asT<bool?>(json['isReserved']),
        currency: asT<String?>(json['currency']),
        odds: asT<String?>(json['odds']),
        playOption: asT<String?>(json['playOption']),
        table: asT<String?>(json['table']),
        nonStickyBetAmount: asT<num?>(json['nonStickyBetAmount']),
        isNonStickyBet: asT<bool?>(json['isNonStickyBet']),
      );

  ///交易单号
  String? wagerNumber;

  ///场馆(游戏厂商)
  @override
  String? gameProvider;

  ///交易金额
  num? betAmount;

  ///交易本金
  num? principal;

  num? nonStickyBetAmount;

  bool? isNonStickyBet;

  ///抵用金
  num? bonus;

  ///输赢金额
  @override
  num? payoutAmount;

  ///交易时间
  int? betTime;

  ///状态
  String? status;

  ///游戏类型
  @override
  String? gameCategory;

  ///游戏名称
  String? gameName;

  ///返水金額
  num? rebateAmount;

  ///返还金額
  num? refundAmount;

  ///有效流水
  num? activeFlow;

  ///结算时间
  int? settleTime;

  ///是否兑现
  bool? isReserved;

  ///币种
  @override
  String? currency;

  ///赔率
  String? odds;

  ///玩法
  String? playOption;

  ///牌桌
  String? table;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'wagerNumber': wagerNumber,
        'gameProvider': gameProvider,
        'betAmount': betAmount,
        'principal': principal,
        'bonus': bonus,
        'payoutAmount': payoutAmount,
        'betTime': betTime,
        'status': status,
        'gameCategory': gameCategory,
        'gameName': gameName,
        'rebateAmount': rebateAmount,
        'refundAmount': refundAmount,
        'activeFlow': activeFlow,
        'settleTime': settleTime,
        'isReserved': isReserved,
        'currency': currency,
        'odds': odds,
        'playOption': playOption,
        'table': table,
        'nonStickyBetAmount': nonStickyBetAmount,
        'isNonStickyBet': isNonStickyBet,
      };

  @override
  List<GameOrderDetailValueLayout> get otherValueLayout {
    final gName = GameOrderDetailValueLayout(
      name: 'gname',
      value: gameName ?? '-',
    );
    final tableName = GameOrderDetailValueLayout(
      name: 'table_name',
      value: table ?? '-',
    );
    final playInWay = GameOrderDetailValueLayout(
      name: 'play_type',
      value: playOption ?? '-',
    );

    final betRate = GameOrderDetailValueLayout(
      name: 'odds',
      value: odds ?? '-',
    );
    final currencyModel = CurrencyService()[currency ?? ''];
    final tranPrincipal = GameOrderDetailValueLayout(
      name: 'tran_principal',
      value: principal?.toNP().balanceText(currencyModel?.isDigital == true) ??
          '-',
      valueIcon: currencyModel?.iconUrl,
    );
    final bettingCredit = GameOrderDetailValueLayout(
      name: 'betting_credit',
      value: bonus?.toNP().balanceText(currencyModel?.isDigital == true) ?? '-',
      valueIcon: currencyModel?.iconUrl,
    );

    final nonsticky = GameOrderDetailValueLayout(
      name: 'price_type_8',
      value: nonStickyBetAmount
              ?.toNP()
              .balanceText(currencyModel?.isDigital == true) ??
          '-',
      valueIcon: currencyModel?.iconUrl,
    );

    final isSettle = status == 'Settlement' || status == 'CashOut';
    final payoutAmount = (this.payoutAmount ?? 0);
    final wol = GameOrderDetailValueLayout(
      name: 'wol',
      value: !isSettle ? '-' : payoutAmountTextWithSymbol,
      valueStyle: GGTextStyle(
        fontSize: GGFontSize.content,
        color: payoutAmount > 0
            ? GGColors.successText.color
            : (payoutAmount == 0
                ? GGColors.textMain.color
                : GGColors.error.color),
      ),
      valueIcon: !isSettle ? null : currencyModel?.iconUrl,
    );
    final effectiveFlow = GameOrderDetailValueLayout(
      name: 'effective_flow',
      value: !isSettle
          ? '-'
          : (activeFlow ?? 0.0)
              .toNP()
              .balanceText(currencyModel?.isDigital == true),
      valueIcon: !isSettle ? null : currencyModel?.iconUrl,
    );
    final stat = GameOrderDetailValueLayout(
      name: 'stat',
      value: getStatusText(status ?? '-'),
      valueStyle: GGTextStyle(
        fontSize: GGFontSize.content,
        color: isSettle
            ? GGColors.successText.color
            : (status == null ? GGColors.textMain.color : GGColors.error.color),
      ),
    );
    final gameTime = GameOrderDetailValueLayout(
      name: 'tran_hour',
      value: formatTime(betTime),
    );
    final gameSettleTime = GameOrderDetailValueLayout(
      name: 'last_sett_time',
      value: formatTime(settleTime),
    );
    return [
      gName,
      tableName,
      playInWay,
      GameOrderDetailValueLayout(isDivider: true),
      betRate,
      tranPrincipal,
      bettingCredit,
      if (isNonStickyBet ?? false) nonsticky,
      wol,
      effectiveFlow,
      stat,
      gameTime,
      gameSettleTime,
    ];
  }

  @override
  List<GameOrderDetailValueLayout> bunchLayouts(bool isSingle) => [];
}