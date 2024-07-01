// ignore_for_file: public_member_api_docs, sort_constructors_first

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingBonusActivityRateVosModel {
  final double minDepositUsdt;
  final double maxDepositUsdt;

  GamingBonusActivityRateVosModel({
    this.minDepositUsdt = 0,
    this.maxDepositUsdt = 0,
  });

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'minDepositUsdt': minDepositUsdt,
      'maxDepositUsdt': maxDepositUsdt,
    };
  }

  factory GamingBonusActivityRateVosModel.fromJson(Map<String, dynamic> map) {
    return GamingBonusActivityRateVosModel(
      minDepositUsdt: (map['minDepositUsdt'] as num?)?.toDouble() ?? 0.0,
      maxDepositUsdt: (map['maxDepositUsdt'] as num?)?.toDouble() ?? 0.0,
    );
  }
}
