//{OrderNum: G3390130957885062G, Uid: 01000530, UserName: 01000530, Avater: avatar-6, GameCategory: Lottery, GameCode: null, GameName: null, BetUsdt: 0.70293425, BetAmount: 5.0, Currency: CNY, BetTime: 1685623788000, Odds: null, PayoutUsdt: 0.0, PayoutAmount: 0.0, Status: Wager}
import 'package:gogaming_app/common/api/base/go_gaming_service.dart';
import 'package:gogaming_app/common/utils/util.dart';

class WagerRankModel {
  WagerRankModel({
    this.orderNum,
    this.uid,
    this.userName,
    this.avater,
    this.gameCategory,
    this.gameCode,
    this.gameName,
    this.betUsdt,
    this.betAmount,
    this.currency,
    this.betTime,
    this.odds,
    this.payAmount,
    this.payAmountUsdt,
    this.status,
    this.providerName,
  });
  final String? orderNum;
  final String? uid;
  final String? userName;
  final String? avater;
  final String? gameCategory;
  final String? gameCode;
  final String? gameName;
  final String? providerName;
  final String? currency;
  final String? status;
  final double? betUsdt;
  final double? betAmount;
  final double? odds;

  /// 支付额
  final double? payAmount;

  /// 支付额usdt
  final double? payAmountUsdt;
  final int? betTime;

  factory WagerRankModel.fromMap(Map<String, dynamic> json) {
    final gameNameMap = Map<String, String>.from(
        json['GameName'] as Map<String, dynamic>? ?? {});
    final provider = Map<String, String>.from(
        json['Provider'] as Map<String, dynamic>? ?? {});
    final gameCode = GGUtil.parseStr(json['GameCode']);
    final lang = GoGamingService().apiLang;
    final gameName = gameNameMap[lang] ?? gameCode;
    return WagerRankModel(
      orderNum: GGUtil.parseStr(json['OrderNum']),
      uid: GGUtil.parseStr(json['Uid']),
      userName: GGUtil.parseStr(json['UserName']),
      avater: GGUtil.parseStr(json['Avater']),
      gameCategory: GGUtil.parseStr(json['GameCategory']),
      gameCode: gameCode,
      gameName: GGUtil.parseStr(gameName),
      providerName: GGUtil.parseStr(provider['name']),
      currency: GGUtil.parseStr(json['Currency']),
      status: GGUtil.parseStr(json['Status']),
      betUsdt: GGUtil.parseDouble(json['BetUsdt']),
      betAmount: GGUtil.parseDouble(json['BetAmount']),
      odds: GGUtil.parseDouble(json['Odds'], -99),
      payAmountUsdt:
          GGUtil.parseDouble(json['PayAmountUsdt'] ?? json['PayoutUsdt']),
      payAmount: GGUtil.parseDouble(json['PayAmount'] ?? json['PayoutAmount']),
      betTime: GGUtil.parseInt(json['BetTime']),
    );
  }

  Map<String, dynamic> toBetInfoJson() => <String, dynamic>{
        'gameName': gameName,
        'gameProviderName': providerName,
        'dateTime': betTime,
        'betAmount': betAmount,
        'odds': odds,
        'payAmount': payAmount,
        'payAmountUsdt': payAmountUsdt,
        'currency': currency,
        'gameCategory': gameCategory,
        'playerName': userName,
        'avatar': avater,
        'orderNum': orderNum,
      };
}
