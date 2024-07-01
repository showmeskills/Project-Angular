import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GameLuckySpinResultModel {
  GameLuckySpinResultModel({
    required this.snNo,
    required this.prizeId,
    required this.isDistributed,
  });

  factory GameLuckySpinResultModel.fromJson(Map<String, dynamic> json) =>
      GameLuckySpinResultModel(
        snNo: asT<int>(json['snNo'])!,
        prizeId: asT<int>(json['prizeId'])!,
        isDistributed: asT<bool>(json['isDistributed'])!,
      );

  ///转盘格子的序号（1~12）
  int snNo;

  /// 奖品ID
  int prizeId;

  /// 是否成功派奖
  bool isDistributed;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'snNo': snNo,
        'prizeId': prizeId,
        'isDistributed': isDistributed,
      };
}
