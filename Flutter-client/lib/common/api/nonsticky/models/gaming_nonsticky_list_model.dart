import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingNonstickyModel {
  GamingNonstickyModel({
    this.casinoBonus,
    this.liveCasinoBonus,
  });

  factory GamingNonstickyModel.fromJson(Map<String, dynamic> json) {
    return GamingNonstickyModel(
      casinoBonus: json['casinoBonus'] is Map
          ? NonstickyItem.fromJson(json['casinoBonus'] as Map<String, dynamic>)
          : null,
      liveCasinoBonus: json['liveCasinoBonus'] is Map
          ? NonstickyItem.fromJson(
              json['liveCasinoBonus'] as Map<String, dynamic>)
          : null,
    );
  }

  NonstickyItem? casinoBonus;
  NonstickyItem? liveCasinoBonus;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'casinoBonus': casinoBonus,
        'liveCasinoBonus': liveCasinoBonus,
      };
}

class GamingNonstickyListModel {
  GamingNonstickyListModel({
    this.casinoBonusList,
    this.liveCasinoBonusList,
  });

  factory GamingNonstickyListModel.fromJson(Map<String, dynamic> json) {
    final List<NonstickyItem>? casinoBonusList =
        json['casinoBonusList'] is List ? <NonstickyItem>[] : null;
    if (casinoBonusList != null) {
      for (final dynamic item in json['casinoBonusList'] as List) {
        if (item != null) {
          casinoBonusList
              .add(NonstickyItem.fromJson(asT<Map<String, dynamic>>(item)!));
        }
      }
    }

    final List<NonstickyItem>? liveCasinoBonusList =
        json['liveCasinoBonusList'] is List ? <NonstickyItem>[] : null;
    if (liveCasinoBonusList != null) {
      for (final dynamic item in json['liveCasinoBonusList'] as List) {
        if (item != null) {
          liveCasinoBonusList
              .add(NonstickyItem.fromJson(asT<Map<String, dynamic>>(item)!));
        }
      }
    }
    return GamingNonstickyListModel(
      casinoBonusList: casinoBonusList,
      liveCasinoBonusList: liveCasinoBonusList,
    );
  }

  List<NonstickyItem>? casinoBonusList;
  List<NonstickyItem>? liveCasinoBonusList;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'casinoBonusList': casinoBonusList,
        'liveCasinoBonusList': liveCasinoBonusList,
      };
}

class NonstickyItem {
  NonstickyItem({
    this.amount,
    this.code,
    this.category,
    this.currency,
    this.name,
    this.targetBetTurnover,
    this.currentBetTurnover,
    this.betMultiple,
    this.targetBetNum,
    this.expires,
    this.currentBetNum,
    this.maxBetPerSpin,
    this.isDeposit,
    this.minimumDeposit,
    this.rate,
    this.balance,
    this.tmpCode,
    this.countryCheck,
    this.durationDaysAfterActivation,
    this.typeCode,
    this.isFreeSpin,
    this.freeSpinImage,
    this.maxSpinNum,
    this.currentSpinNum,
    this.providerCatId,
    this.gameId,
    this.gameName,
    this.maxBonusAmount,
  });

  factory NonstickyItem.fromJson(Map<String, dynamic> json) => NonstickyItem(
        amount: asT<num?>(json['amount']),
        code: asT<String?>(json['code']),
        category: asT<String?>(json['category']),
        currency: asT<String?>(json['currency']),
        tmpCode: asT<String>(json['tmpCode']),
        name: asT<String?>(json['name']),
        targetBetTurnover: asT<num?>(json['targetBetTurnover']),
        balance: asT<num?>(json['balance']),
        currentBetTurnover: asT<num?>(json['currentBetTurnover']),
        betMultiple: asT<num?>(json['betMultiple']),
        maxBetPerSpin: asT<num?>(json['maxBetPerSpin']),
        targetBetNum: asT<int?>(json['targetBetNum']),
        currentBetNum: asT<int?>(json['currentBetNum']),
        expires: asT<int?>(json['expires']),
        isDeposit: asT<bool?>(json['isDeposit']),
        minimumDeposit: asT<num?>(json['minimumDeposit']),
        rate: asT<num?>(json['rate']),
        durationDaysAfterActivation:
            asT<num?>(json['durationDaysAfterActivation']),
        typeCode: asT<String?>(json['typeCode']),
        countryCheck: asT<bool?>(json['countryCheck']),
        isFreeSpin: asT<bool?>(json['isFreeSpin']),
        freeSpinImage: asT<String?>(json['freeSpinImage']),
        maxSpinNum: asT<int?>(json['maxSpinNum']),
        currentSpinNum: asT<int?>(json['currentSpinNum']),
        providerCatId: asT<String?>(json['providerCatId']),
        gameId: asT<String?>(json['gameId']),
        gameName: asT<String?>(json['gameName']),
        maxBonusAmount: asT<num?>(json['maxBonusAmount']),
      );

  num? amount;
  String? code;
  String? category;
  String? currency;
  String? name;
  String? tmpCode;
  num? targetBetTurnover;
  num? maxBetPerSpin;
  int? targetBetNum;
  int? currentBetNum;
  int? expires;
  num? balance;
  num? currentBetTurnover;
  num? betMultiple;
  bool? isDeposit;
  num? minimumDeposit;
  num? rate;
  num? durationDaysAfterActivation;
  String? typeCode;
  bool? countryCheck;
  bool? isFreeSpin;
  String? freeSpinImage;
  int? maxSpinNum;
  int? currentSpinNum;
  String? providerCatId;
  String? gameId;
  String? gameName;
  num? maxBonusAmount;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'amount': amount,
        'code': code,
        'category': category,
        'currency': currency,
        'name': name,
        'balance': balance,
        'targetBetTurnover': targetBetTurnover,
        'currentBetTurnover': currentBetTurnover,
        'betMultiple': betMultiple,
        'isDeposit': isDeposit,
        'targetBetNum': targetBetNum,
        'expires': expires,
        'currentBetNum': currentBetNum,
        'minimumDeposit': minimumDeposit,
        'rate': rate,
        'durationDaysAfterActivation': durationDaysAfterActivation,
        'typeCode': typeCode,
        "countryCheck": countryCheck,
        "isFreeSpin": isFreeSpin,
        "freeSpinImage": freeSpinImage,
        "providerCatId": providerCatId,
        "gameId": gameId,
        "gameName": gameName,
        'maxBonusAmount': maxBonusAmount,
      };
}
