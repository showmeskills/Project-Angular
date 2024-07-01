part of 'gaming_lottery_order_model.dart';

class LotteryGameDetailModel {
  dynamic lotterCategory;
  String gameName;
  String roundNo;
  String playWay;
  String betContent;

  LotteryGameDetailModel({
    this.lotterCategory,
    this.gameName = '',
    this.roundNo = '',
    this.playWay = '',
    this.betContent = '',
  });

  @override
  String toString() {
    return 'GameDetail(lotterCategory: $lotterCategory, gameName: $gameName, roundNo: $roundNo, playWay: $playWay, betContent: $betContent)';
  }

  factory LotteryGameDetailModel.fromJson(Map<String, Object?> json) =>
      LotteryGameDetailModel(
        lotterCategory: json['lotterCategory'] as dynamic,
        gameName: json['gameName'] as String? ?? '',
        roundNo: json['roundNo'] as String? ?? '',
        playWay: json['playWay'] as String? ?? '',
        betContent: json['betContent'] as String? ?? '',
      );

  Map<String, Object?> toJson() => {
        'lotterCategory': lotterCategory,
        'gameName': gameName,
        'roundNo': roundNo,
        'playWay': playWay,
        'betContent': betContent,
      };

  LotteryGameDetailModel copyWith({
    dynamic lotterCategory,
    String? gameName,
    String? roundNo,
    String? playWay,
    String? betContent,
  }) {
    return LotteryGameDetailModel(
      lotterCategory: lotterCategory ?? this.lotterCategory,
      gameName: gameName ?? this.gameName,
      roundNo: roundNo ?? this.roundNo,
      playWay: playWay ?? this.playWay,
      betContent: betContent ?? this.betContent,
    );
  }
}
