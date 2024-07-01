import 'package:gogaming_app/common/utils/util.dart';

import 'currency_ratio.dart';
import 'tag_model.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingGameModel {
  int? id;
  String? providerCatId;
  String? providerId;
  String? providerName;
  String? gameId;
  String? gameName;
  String? gameDesc;
  String? webLogo;
  dynamic h5Logo;
  String? appLogo;
  String? status;
  bool? isTry;
  bool? isFavorite;
  bool? isFullScreen;
  double? bankerAdvantage;

  /// 游戏类别
  String? category;
  List<GamingGameTagModel>? gameLabels;
  List<GamingGameCurrencyRatio>? currencyRatio;
  String? appRedirectUrl;

  bool get isOnline => status == 'Online';
  List<String>? get gameCategory =>
      category?.isNotEmpty == true ? [category!] : null;

  GamingGameModel({
    this.id,
    this.providerCatId,
    this.providerId,
    this.providerName,
    this.gameId,
    this.gameName,
    this.gameDesc,
    this.webLogo,
    this.h5Logo,
    this.appLogo,
    this.status,
    this.isTry,
    this.isFavorite,
    this.isFullScreen,
    this.bankerAdvantage,
    this.gameLabels,
    this.currencyRatio,
    this.appRedirectUrl,
    this.category,
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

  @override
  String toString() {
    return 'GameList(id: $id, providerId: $providerCatId, providerName: $providerName, gameId: $gameId, gameName: $gameName, gameDesc: $gameDesc, webLogo: $webLogo, h5Logo: $h5Logo, appLogo: $appLogo, status: $status, isTry: $isTry, isFavorite: $isFavorite, bankerAdvantage: $bankerAdvantage, gameLabels: $gameLabels, currencyRatio: $currencyRatio)';
  }

  factory GamingGameModel.fromJson(Map<String, Object?> json) =>
      GamingGameModel(
        id: asT<int>(json['id']),
        providerId: asT<String>(json['providerId']),
        providerCatId: asT<String>(json['providerCatId']),
        providerName: asT<String>(json['providerName']),
        gameId: asT<String>(json['gameId']),
        gameName: asT<String>(json['gameName']),
        gameDesc: asT<String>(json['gameDesc']),
        webLogo: asT<String>(json['webLogo']),
        h5Logo: asT<dynamic>(json['h5Logo']),
        appLogo: asT<String>(json['appLogo']),
        status: asT<String>(json['status']),
        isTry: asT<bool>(json['isTry']),
        isFullScreen: asT<bool>(json['isFullScreen']),
        isFavorite: asT<bool>(json['isFavorite']),
        bankerAdvantage: asT<double>(json['bankerAdvantage']),
        category: GGUtil.parseStr(json['category']),
        gameLabels: (json['gameLabels'] as List<dynamic>?)
            ?.map((e) => GamingGameTagModel.fromJson(e as Map<String, Object?>))
            .toList(),
        currencyRatio: (json['currencyRatio'] as List<dynamic>?)
            ?.map((e) =>
                GamingGameCurrencyRatio.fromJson(e as Map<String, Object?>))
            .toList(),
        appRedirectUrl: asT<String>(json['appRedirectUrl']),
      );

  Map<String, Object?> toJson() => {
        'id': id,
        'providerCatId': providerCatId,
        'providerName': providerName,
        'gameId': gameId,
        'gameName': gameName,
        'gameDesc': gameDesc,
        'webLogo': webLogo,
        'h5Logo': h5Logo,
        'appLogo': appLogo,
        'status': status,
        'isTry': isTry,
        'isFullScreen': isFullScreen,
        'isFavorite': isFavorite,
        'bankerAdvantage': bankerAdvantage,
        'category': category,
        'gameLabels': gameLabels?.map((e) => e.toJson()).toList(),
        'currencyRatio': currencyRatio?.map((e) => e.toJson()).toList(),
        'appRedirectUrl': appRedirectUrl,
      };

  GamingGameModel copyWith({
    int? id,
    String? providerCatId,
    String? provider,
    String? providerName,
    String? gameId,
    String? gameName,
    String? gameDesc,
    String? webLogo,
    dynamic h5Logo,
    String? appLogo,
    String? status,
    bool? isTry,
    bool? isFavorite,
    double? bankerAdvantage,
    List<GamingGameTagModel>? gameLabels,
    List<String>? currencies,
    List<GamingGameCurrencyRatio>? currencyRatio,
    String? appRedirectUrl,
    String? category,
  }) {
    return GamingGameModel(
      id: id ?? this.id,
      providerCatId: providerCatId ?? this.providerCatId,
      providerId: provider ?? providerId,
      providerName: providerName ?? this.providerName,
      gameId: gameId ?? this.gameId,
      gameName: gameName ?? this.gameName,
      gameDesc: gameDesc ?? this.gameDesc,
      webLogo: webLogo ?? this.webLogo,
      h5Logo: h5Logo ?? this.h5Logo,
      appLogo: appLogo ?? this.appLogo,
      status: status ?? this.status,
      isTry: isTry ?? this.isTry,
      isFavorite: isFavorite ?? this.isFavorite,
      bankerAdvantage: bankerAdvantage ?? this.bankerAdvantage,
      gameLabels: gameLabels ?? this.gameLabels,
      currencyRatio: currencyRatio ?? this.currencyRatio,
      appRedirectUrl: appRedirectUrl ?? this.appRedirectUrl,
      category: category,
    );
  }
}
