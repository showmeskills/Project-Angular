import 'package:gogaming_app/common/api/game_order/models/game_order_model_interface.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';

part 'sub_order_model.dart';
part 'game_detail_model.dart';

class GamingSportOrderModel extends GameOrderInterface {
  GamingSportOrderGameDetailModel gameDetail;
  List<GamingSportSubOrderModel> subOrderList;

  GamingSportOrderModel({
    required this.gameDetail,
    this.subOrderList = const [],
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

  double get expectedReturnUSDT {
    if (subOrderList.isNotEmpty) {
      return subOrderList
          .map((e) => e.expectedReturnUSDT)
          .reduce((value, element) => value + element);
    } else {
      return betAmountUSDT * (odds != 'x' ? double.parse(odds) : 1);
    }
  }

  String get expectedReturnUSDTText {
    return NumberPrecision(expectedReturnUSDT).balanceText(true);
  }

  String get expectedReturnUSDTTextWithSymbol {
    if (expectedReturnUSDT > 0) {
      return '+$expectedReturnUSDTText';
    } else {
      return expectedReturnUSDTText;
    }
  }

  @override
  String toString() {
    return 'GamingGameOrderWagerModel(gameDetail: $gameDetail, subOrderList: $subOrderList, wagerNumber: $wagerNumber, gameProvider: $gameProvider, betAmount: $betAmount, payoutAmount: $payoutAmount, betTime: $betTime, wagerStatus: $wagerStatus, status: $status, currency: $currency, odds: $odds, isReserved: $isReserved, gameCode: $gameCode)';
  }

  factory GamingSportOrderModel.fromJson(Map<String, Object?> json) {
    return GamingSportOrderModel(
      gameDetail: GamingSportOrderGameDetailModel.fromJson(
          json['gameDetail']! as Map<String, Object?>),
      subOrderList: (json['subOrderList'] as List<dynamic>?)
              ?.map((e) =>
                  GamingSportSubOrderModel.fromJson(e as Map<String, Object?>))
              .toList() ??
          [],
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
        'subOrderList': subOrderList.map((e) => e.toJson()).toList(),
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

  GamingSportOrderModel copyWith({
    GamingSportOrderGameDetailModel? gameDetail,
    List<GamingSportSubOrderModel>? subOrderList,
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
    return GamingSportOrderModel(
      gameDetail: gameDetail ?? this.gameDetail,
      subOrderList: subOrderList ?? this.subOrderList,
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
