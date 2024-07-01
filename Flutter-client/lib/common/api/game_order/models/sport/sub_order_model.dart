part of 'gaming_sport_order_model.dart';

class GamingSportSubOrderModel {
  String? sport;
  String? tournamentName;
  String? eventName;
  String? betoptionName;
  String? betContent;
  String? gameResult;
  double? detailOdds;
  int? gameTime;
  String? wagerNumber;
  String? gameProvider;
  double? betAmount;
  double? principal;
  double? bonus;
  double? payoutAmount;
  int? betTime;
  String wagerStatus;
  String status;
  String? gameCategory;
  String? gameName;
  double? rebateAmount;
  double? refundAmount;
  double? activeFlow;
  int? settleTime;
  bool isReserved;
  String currency;
  String odds;

  GamingSportSubOrderModel({
    this.sport,
    this.tournamentName,
    this.eventName,
    this.betoptionName,
    this.betContent,
    this.gameResult,
    this.detailOdds,
    this.gameTime,
    this.wagerNumber,
    this.gameProvider,
    this.betAmount,
    this.principal,
    this.bonus,
    this.payoutAmount,
    this.betTime,
    required this.wagerStatus,
    required this.status,
    this.gameCategory,
    this.gameName,
    this.rebateAmount,
    this.refundAmount,
    this.activeFlow,
    this.settleTime,
    this.isReserved = false,
    required this.currency,
    this.odds = 'x',
  });

  double get betAmountUSDT {
    return (betAmount ?? 0) *
        CurrencyService.sharedInstance.getUSDTRate(currency);
  }

  double get expectedReturn {
    return (betAmount ?? 0) * (detailOdds ?? 1);
  }

  double get expectedReturnUSDT {
    return betAmountUSDT * (detailOdds ?? 1);
  }

  @override
  String toString() {
    return 'SubOrderList(sport: $sport, tournamentName: $tournamentName, eventName: $eventName, betoptionName: $betoptionName, betContent: $betContent, gameResult: $gameResult, detailOdds: $detailOdds, gameTime: $gameTime, wagerNumber: $wagerNumber, gameProvider: $gameProvider, betAmount: $betAmount, principal: $principal, bonus: $bonus, payoutAmount: $payoutAmount, betTime: $betTime, wagerStatus: $wagerStatus, status: $status, gameCategory: $gameCategory, gameName: $gameName, rebateAmount: $rebateAmount, refundAmount: $refundAmount, activeFlow: $activeFlow, settleTime: $settleTime, isReserved: $isReserved, currency: $currency, odds: $odds)';
  }

  factory GamingSportSubOrderModel.fromJson(Map<String, Object?> json) =>
      GamingSportSubOrderModel(
        sport: json['sport'] as String?,
        tournamentName: json['tournamentName'] as String?,
        eventName: json['eventName'] as String?,
        betoptionName: json['betoptionName'] as String?,
        betContent: json['betContent'] as String?,
        gameResult: json['gameResult'] as String?,
        detailOdds: (json['detailOdds'] as num?)?.toDouble(),
        gameTime: json['gameTime'] as int?,
        wagerNumber: json['wagerNumber'] as String?,
        gameProvider: json['gameProvider'] as String?,
        betAmount: (json['betAmount'] as num?)?.toDouble(),
        principal: (json['principal'] as num?)?.toDouble(),
        bonus: (json['bonus'] as num?)?.toDouble(),
        payoutAmount: (json['payoutAmount'] as num?)?.toDouble(),
        betTime: json['betTime'] as int?,
        wagerStatus: json['wagerStatus'] as String,
        status: json['status'] as String,
        gameCategory: json['gameCategory'] as String?,
        gameName: json['gameName'] as String?,
        rebateAmount: (json['rebateAmount'] as num?)?.toDouble(),
        refundAmount: (json['refundAmount'] as num?)?.toDouble(),
        activeFlow: (json['activeFlow'] as num?)?.toDouble(),
        settleTime: json['settleTime'] as int?,
        isReserved: json['isReserved'] as bool? ?? false,
        currency: json['currency'] as String,
        odds: json['odds'] as String? ?? 'x',
      );

  Map<String, Object?> toJson() => {
        'sport': sport,
        'tournamentName': tournamentName,
        'eventName': eventName,
        'betoptionName': betoptionName,
        'betContent': betContent,
        'gameResult': gameResult,
        'detailOdds': detailOdds,
        'gameTime': gameTime,
        'wagerNumber': wagerNumber,
        'gameProvider': gameProvider,
        'betAmount': betAmount,
        'principal': principal,
        'bonus': bonus,
        'payoutAmount': payoutAmount,
        'betTime': betTime,
        'wagerStatus': wagerStatus,
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
      };

  GamingSportSubOrderModel copyWith({
    String? sport,
    String? tournamentName,
    String? eventName,
    String? betoptionName,
    String? betContent,
    String? gameResult,
    double? detailOdds,
    int? gameTime,
    String? wagerNumber,
    String? gameProvider,
    double? betAmount,
    double? principal,
    double? bonus,
    double? payoutAmount,
    int? betTime,
    String? wagerStatus,
    String? status,
    String? gameCategory,
    String? gameName,
    double? rebateAmount,
    double? refundAmount,
    double? activeFlow,
    int? settleTime,
    bool? isReserved,
    String? currency,
    String? odds,
  }) {
    return GamingSportSubOrderModel(
      sport: sport ?? this.sport,
      tournamentName: tournamentName ?? this.tournamentName,
      eventName: eventName ?? this.eventName,
      betoptionName: betoptionName ?? this.betoptionName,
      betContent: betContent ?? this.betContent,
      gameResult: gameResult ?? this.gameResult,
      detailOdds: detailOdds ?? this.detailOdds,
      gameTime: gameTime ?? this.gameTime,
      wagerNumber: wagerNumber ?? this.wagerNumber,
      gameProvider: gameProvider ?? this.gameProvider,
      betAmount: betAmount ?? this.betAmount,
      principal: principal ?? this.principal,
      bonus: bonus ?? this.bonus,
      payoutAmount: payoutAmount ?? this.payoutAmount,
      betTime: betTime ?? this.betTime,
      wagerStatus: wagerStatus ?? this.wagerStatus,
      status: status ?? this.status,
      gameCategory: gameCategory ?? this.gameCategory,
      gameName: gameName ?? this.gameName,
      rebateAmount: rebateAmount ?? this.rebateAmount,
      refundAmount: refundAmount ?? this.refundAmount,
      activeFlow: activeFlow ?? this.activeFlow,
      settleTime: settleTime ?? this.settleTime,
      isReserved: isReserved ?? this.isReserved,
      currency: currency ?? this.currency,
      odds: odds ?? this.odds,
    );
  }
}
