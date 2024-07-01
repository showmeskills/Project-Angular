import 'gaming_game/currency_ratio.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingGameProviderModel {
  // String? providerId;
  String? providerCatId;
  String? providerName;
  String? dayLogo;
  String? nightLogo;
  String? status;
  int? gameCount;
  bool? isTry;
  bool? showHome;

  /// 是否支持进入二级页面
  bool? secondaryPage;
  bool? isTransfer;
  String? category;
  List<GamingGameCurrencyRatio>? currencyRatio;
  List<String>? countryCode;
  GamingGameProviderModel({
    // this.providerId,
    this.providerCatId,
    this.providerName,
    this.dayLogo,
    this.nightLogo,
    this.status,
    this.gameCount,
    this.secondaryPage,
    this.isTransfer,
    this.currencyRatio,
    this.category,
    this.countryCode,
    this.isTry,
    this.showHome,
  });

  List<String> get currencies {
    List<String> list = [];
    List<GamingGameCurrencyRatio> res = currencyRatio ?? [];
    if (res.isNotEmpty) {
      res.sort((a, b) => a.sort!.compareTo(b.sort!));
      list = res.map((ratio) => ratio.currency!).toList();
    }
    return list;
  }

  bool get isSport {
    return category == 'SportsBook';
  }

  @override
  String toString() {
    return 'GamingGameProviderModel{providerCatId: $providerCatId, providerName: $providerName, nightLogo: $nightLogo, dayLogo: $dayLogo, status: $status, gameCount: $gameCount, secondaryPage: $secondaryPage, isTransfer: $isTransfer, category: $category, currencyRatio: $currencyRatio, countryCode: $countryCode}';
  }

  factory GamingGameProviderModel.fromJson(Map<String, Object?> json) {
    return GamingGameProviderModel(
      providerCatId: asT<String?>(json['providerCatId']),
      providerName: asT<String?>(json['providerName']),
      dayLogo: asT<String?>(json['dayLogo']),
      nightLogo: asT<String?>(json['nightLogo']),
      status: asT<String?>(json['status']),
      gameCount: asT<int?>(json['gameCount']),
      secondaryPage: asT<bool?>(json['secondaryPage']),
      isTransfer: asT<bool?>(json['isTransfer']),
      isTry: asT<bool?>(json['isTry']),
      showHome: asT<bool?>(json['showHome']),
      category: asT<String?>(json['category']),
      countryCode: (json['countryCode'] as List<dynamic>?)?.cast<String>(),
      currencyRatio: (json['currencyRatio'] as List<dynamic>?)
          ?.map((e) =>
              GamingGameCurrencyRatio.fromJson(e as Map<String, Object?>))
          .toList(),
    );
  }

  Map<String, Object?> toJson() => {
        'providerCatId': providerCatId,
        'providerName': providerName,
        'nightLogo': nightLogo,
        'dayLogo': dayLogo,
        'status': status,
        'gameCount': gameCount,
        'secondaryPage': secondaryPage,
        'isTransfer': isTransfer,
        'category': category,
        'isTry': isTry,
        'showHome': showHome,
        'countryCode': countryCode,
        'currencyRatio': currencyRatio?.map((e) => e.toJson()).toList(),
      };

  GamingGameProviderModel copyWith({
    String? providerCatId,
    String? providerName,
    String? dayLogo,
    String? nightLogo,
    String? status,
    int? gameCount,
    bool? secondaryPage,
    bool? isTransfer,
    bool? isTry,
    bool? showHome,
    String? category,
    List<String>? currencies,
    List<String>? countryCode,
    List<GamingGameCurrencyRatio>? currencyRatio,
  }) {
    return GamingGameProviderModel(
      providerCatId: providerCatId ?? this.providerCatId,
      providerName: providerName ?? this.providerName,
      dayLogo: dayLogo ?? this.dayLogo,
      nightLogo: nightLogo ?? this.nightLogo,
      status: status ?? this.status,
      gameCount: gameCount ?? this.gameCount,
      secondaryPage: secondaryPage ?? this.secondaryPage,
      isTransfer: isTransfer ?? this.isTransfer,
      isTry: isTry ?? this.isTry,
      showHome: showHome ?? this.showHome,
      currencyRatio: currencyRatio ?? this.currencyRatio,
      category: category ?? this.category,
      countryCode: countryCode ?? this.countryCode,
    );
  }
}
