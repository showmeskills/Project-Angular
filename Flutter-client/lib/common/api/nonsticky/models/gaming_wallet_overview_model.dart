import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingNonstickyWalletOverviewModel {
  GamingNonstickyWalletOverviewModel({
    this.cashableBonus,
    this.lockedBonus,
    this.casinoBonus,
    this.liveCasinoBonus,
    this.cashableBonusInfos,
  });

  factory GamingNonstickyWalletOverviewModel.fromJson(Map<String, dynamic> json) {
    final List<CashableBonusInfos>? cashableBonusInfos =
    json['cashableBonusInfos'] is List ? <CashableBonusInfos>[] : null;
    if (cashableBonusInfos != null) {
      for (final dynamic item in json['cashableBonusInfos'] as List) {
        if (item != null) {
          cashableBonusInfos
              .add(CashableBonusInfos.fromJson(asT<Map<String, dynamic>>(item)!));
        }
      }
    }
    return GamingNonstickyWalletOverviewModel(
      cashableBonus: asT<num?>(json['cashableBonus']),
      lockedBonus: asT<num?>(json['lockedBonus']),
      casinoBonus: asT<num?>(json['casinoBonus']),
      liveCasinoBonus: asT<num?>(json['liveCasinoBonus']),
      cashableBonusInfos: cashableBonusInfos,
    );
  }

  num? cashableBonus;
  num? lockedBonus;
  num? casinoBonus;
  num? liveCasinoBonus;
  List<CashableBonusInfos>? cashableBonusInfos;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
    'cashableBonus': cashableBonus,
    'lockedBonus': lockedBonus,
    'casinoBonus': casinoBonus,
    'liveCasinoBonus': liveCasinoBonus,
    'cashableBonusInfos': cashableBonusInfos,
  };
}

class CashableBonusInfos {
  CashableBonusInfos({
    this.amount,
    this.currency,
  });

  factory CashableBonusInfos.fromJson(Map<String, dynamic> json) => CashableBonusInfos(
    amount: asT<num?>(json['amount']),
    currency: asT<String?>(json['currency']),
  );

  num? amount;
  String? currency;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
    'amount': amount,
    'currency': currency,
  };
}
