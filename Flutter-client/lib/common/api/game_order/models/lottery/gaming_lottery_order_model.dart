import 'package:gogaming_app/common/api/game_order/models/game_order_model_interface.dart';

part 'game_detail_model.dart';

class GamingLotteryOrderModel extends GameOrderInterface {
  LotteryGameDetailModel gameDetail;

  GamingLotteryOrderModel({
    required this.gameDetail,
    required String wagerNumber,
    required double betAmount,
    double? payoutAmount,
    required int betTime,
    required String wagerStatus,
    required String currency,
    String gameProvider = '',
    required String status,
    String odds = 'x',
    bool isReserved = false,
    String gameCode = '',
  }) : super(
          wagerNumber: wagerNumber,
          betAmount: betAmount,
          payoutAmount: payoutAmount,
          betTime: betTime,
          wagerStatus: wagerStatus,
          currency: currency,
          gameProvider: gameProvider,
          status: status,
          odds: odds,
          isReserved: isReserved,
          gameCode: gameCode,
        );

  @override
  String toString() {
    return 'GamingLotteryGameOrderModel(gameDetail: $gameDetail, wagerNumber: $wagerNumber, gameProvider: $gameProvider, betAmount: $betAmount, payoutAmount: $payoutAmount, betTime: $betTime, wagerStatus: $wagerStatus, status: $status, currency: $currency, odds: $odds, isReserved: $isReserved, gameCode: $gameCode)';
  }

  factory GamingLotteryOrderModel.fromJson(Map<String, Object?> json) {
    return GamingLotteryOrderModel(
      gameDetail: LotteryGameDetailModel.fromJson(
          json['gameDetail']! as Map<String, Object?>),
      wagerNumber: json['wagerNumber'] as String,
      gameProvider: json['gameProvider'] as String? ?? '',
      betAmount: (json['betAmount'] as num? ?? 0).toDouble(),
      payoutAmount: (json['payoutAmount'] as num?)?.toDouble(),
      betTime: json['betTime'] as int,
      wagerStatus: json['wagerStatus'] as String,
      status: json['status'] as String,
      currency: json['currency'] as String,
      odds: json['odds'] as String? ?? 'x',
      isReserved: json['isReserved'] as bool? ?? false,
      gameCode: json['gameCode'] as String? ?? '',
    );
  }

  Map<String, Object?> toJson() => {
        'gameDetail': gameDetail.toJson(),
        'wagerNumber': wagerNumber,
        'gameProvider': gameProvider,
        'betAmount': betAmount,
        'payoutAmount': payoutAmount,
        'betTime': betTime,
        'wagerStatus': wagerStatus,
        'status': status,
        'currency': currency,
        'odds': odds,
        'isReserved': isReserved,
        'gameCode': gameCode,
      };

  GamingLotteryOrderModel copyWith({
    LotteryGameDetailModel? gameDetail,
    String? wagerNumber,
    String? gameProvider,
    double? betAmount,
    double? payoutAmount,
    int? betTime,
    String? wagerStatus,
    String? status,
    String? currency,
    String? odds,
    bool? isReserved,
    String? gameCode,
  }) {
    return GamingLotteryOrderModel(
      gameDetail: gameDetail ?? this.gameDetail,
      wagerNumber: wagerNumber ?? this.wagerNumber,
      gameProvider: gameProvider ?? this.gameProvider,
      betAmount: betAmount ?? this.betAmount,
      payoutAmount: payoutAmount ?? this.payoutAmount,
      betTime: betTime ?? this.betTime,
      wagerStatus: wagerStatus ?? this.wagerStatus,
      status: status ?? this.status,
      currency: currency ?? this.currency,
      odds: odds ?? this.odds,
      isReserved: isReserved ?? this.isReserved,
      gameCode: gameCode ?? this.gameCode,
    );
  }
}
