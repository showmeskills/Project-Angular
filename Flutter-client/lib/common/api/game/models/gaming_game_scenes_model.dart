import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GameScenseModel {
  GameScenseModel({
    this.headerMenus,
    this.leftMenus,
    this.navigationMenus,
  });

  factory GameScenseModel.fromJson(Map<String, dynamic> json) {
    final List<GameScenseHeaderMenuModel>? headerMenus =
        json['headerMenus'] is List ? <GameScenseHeaderMenuModel>[] : null;
    if (headerMenus != null) {
      for (final dynamic item in json['headerMenus']! as List) {
        if (item != null) {
          headerMenus.add(GameScenseHeaderMenuModel.fromJson(
              asT<Map<String, dynamic>>(item)!));
        }
      }
    }

    final List<GameScenseLeftMenus>? leftMenus =
        json['leftMenus'] is List ? <GameScenseLeftMenus>[] : null;
    if (leftMenus != null) {
      for (final dynamic item in json['leftMenus']! as List) {
        if (item != null) {
          leftMenus.add(
              GameScenseLeftMenus.fromJson(asT<Map<String, dynamic>>(item)!));
        }
      }
    }

    final List<GameScenseLeftMenus>? navigationMenus =
        json['navigationMenus'] is List ? <GameScenseLeftMenus>[] : null;
    if (navigationMenus != null) {
      for (final dynamic item in json['navigationMenus']! as List) {
        if (item != null) {
          navigationMenus.add(
              GameScenseLeftMenus.fromJson(asT<Map<String, dynamic>>(item)!));
        }
      }
    }
    return GameScenseModel(
      headerMenus: headerMenus,
      leftMenus: leftMenus,
      navigationMenus: navigationMenus,
    );
  }

  List<GameScenseHeaderMenuModel>? headerMenus;
  List<GameScenseLeftMenus>? leftMenus;
  List<GameScenseLeftMenus>? navigationMenus;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'headerMenus': headerMenus,
        'leftMenus': leftMenus,
        'navigationMenus': navigationMenus,
      };
}

class GameScenseLeftMenus {
  GameScenseLeftMenus({
    this.enableFavorites,
    this.enableRecentlyPlayed,
    this.key,
    this.name,
    this.icon,
    this.menuIcon,
    this.labelId,
    this.redirectMethod,
    this.config,
    this.infoExpandList,
  });

  bool? enableFavorites;
  bool? enableRecentlyPlayed;
  String? key;
  String? name;
  String? icon;
  String? menuIcon;
  int? labelId;
  String? redirectMethod;
  GameScenseHeaderMenuConfig? config;
  List<GameScenseHeaderMenuItem>? infoExpandList;

  factory GameScenseLeftMenus.fromJson(Map<String, dynamic> json) {
    final List<GameScenseHeaderMenuItem>? infoExpandList =
        json['infoExpandList'] is List ? <GameScenseHeaderMenuItem>[] : null;
    if (infoExpandList != null) {
      for (final dynamic item in json['infoExpandList']! as List) {
        if (item != null) {
          infoExpandList.add(GameScenseHeaderMenuItem.fromJson(
              asT<Map<String, dynamic>>(item)!));
        }
      }
    }

    return GameScenseLeftMenus(
      infoExpandList: infoExpandList,
      key: asT<String?>(json['key']),
      name: asT<String?>(json['name']),
      icon: asT<String?>(json['icon']),
      menuIcon: asT<String?>(json['menuIcon']),
      labelId: asT<int?>(json['labelId']),
      redirectMethod: asT<String?>(json['redirectMethod']),
      enableFavorites: asT<bool?>(json['enableFavorites']),
      enableRecentlyPlayed: asT<bool?>(json['enableRecentlyPlayed']),
      config: json['config'] is Map
          ? GameScenseHeaderMenuConfig.fromJson(
              Map<String, dynamic>.from(json['config'] as Map))
          : null,
    );
  }
}

class GameScenseHeaderMenuModel {
  GameScenseHeaderMenuModel({
    this.key,
    this.name,
    this.icon,
    this.labelId,
    this.redirectMethod,
    this.config,
    this.infoExpandList,
    this.infoHorizontalList,
    this.infoVerticallyList,
  });

  String? key;
  String? name;
  String? icon;
  int? labelId;
  String? redirectMethod;
  GameScenseHeaderMenuConfig? config;
  List<GameScenseHeaderMenuItem>? infoExpandList;
  List<GameScenseHeaderMenuItem>? infoHorizontalList;
  List<GameScenseHeaderMenuItem>? infoVerticallyList;

  factory GameScenseHeaderMenuModel.fromJson(Map<String, dynamic> json) {
    final List<GameScenseHeaderMenuItem>? infoExpandList =
        json['infoExpandList'] is List ? <GameScenseHeaderMenuItem>[] : null;
    if (infoExpandList != null) {
      for (final dynamic item in json['infoExpandList']! as List) {
        if (item != null) {
          infoExpandList.add(GameScenseHeaderMenuItem.fromJson(
              asT<Map<String, dynamic>>(item)!));
        }
      }
    }

    final List<GameScenseHeaderMenuItem>? infoHorizontalList =
        json['infoHorizontalList'] is List
            ? <GameScenseHeaderMenuItem>[]
            : null;
    if (infoHorizontalList != null) {
      for (final dynamic item in json['infoHorizontalList']! as List) {
        if (item != null) {
          infoHorizontalList.add(GameScenseHeaderMenuItem.fromJson(
              asT<Map<String, dynamic>>(item)!));
        }
      }
    }

    final List<GameScenseHeaderMenuItem>? infoVerticallyList =
        json['infoVerticallyList'] is List
            ? <GameScenseHeaderMenuItem>[]
            : null;
    if (infoVerticallyList != null) {
      for (final dynamic item in json['infoVerticallyList']! as List) {
        if (item != null) {
          infoVerticallyList.add(GameScenseHeaderMenuItem.fromJson(
              asT<Map<String, dynamic>>(item)!));
        }
      }
    }
    return GameScenseHeaderMenuModel(
      key: asT<String?>(json['key']),
      name: asT<String?>(json['name']),
      icon: asT<String?>(json['icon']),
      labelId: asT<int?>(json['labelId']),
      redirectMethod: asT<String?>(json['redirectMethod']),
      infoExpandList: infoExpandList,
      infoHorizontalList: infoHorizontalList,
      infoVerticallyList: infoVerticallyList,
      config: json['config'] is Map
          ? GameScenseHeaderMenuConfig.fromJson(
              Map<String, dynamic>.from(json['config'] as Map))
          : null,
    );
  }
}

class GameScenseHeaderMenuItem {
  GameScenseHeaderMenuItem({
    this.pid,
    this.labelName,
    this.scenesType,
    this.labelId,
    this.config,
    this.providerSetting,
    this.multiLine,
    this.redirectMethod,
    this.sort,
    this.labelCode,
    this.description,
    this.icon,
    this.image,
    this.menuIcon,
    this.gameCount,
    this.isActivityRecommend,
    this.openPromotion,
    this.webRecommendImage,
    this.h5RecommendImage,
  });

  String? pid;
  String? labelName;
  String? scenesType;
  int? labelId;
  GameScenseHeaderMenuConfig? config;
  GamingGameScenesProviderSetting? providerSetting;
  int? multiLine;
  String? redirectMethod;
  int? sort;
  String? labelCode;
  String? description;
  String? icon;
  String? image;
  String? menuIcon;
  int? gameCount;
  bool? isActivityRecommend;
  bool? openPromotion;
  String? webRecommendImage;
  String? h5RecommendImage;

  factory GameScenseHeaderMenuItem.fromJson(Map<String, dynamic> json) {
    return GameScenseHeaderMenuItem(
      pid: asT<String?>(json['pid']),
      labelName: asT<String?>(json['labelName']),
      scenesType: asT<String?>(json['scenesType']),
      labelId: asT<int?>(json['labelId']),
      config: json['config'] is Map
          ? GameScenseHeaderMenuConfig.fromJson(
              Map<String, dynamic>.from(json['config'] as Map))
          : null,
      providerSetting: json['providerSetting'] is Map
          ? GamingGameScenesProviderSetting.fromJson(
              Map<String, dynamic>.from(json['providerSetting'] as Map))
          : null,
      multiLine: asT<int?>(json['multiLine']),
      redirectMethod: asT<String?>(json['redirectMethod']),
      sort: asT<int?>(json['sort']),
      labelCode: asT<String?>(json['labelCode']),
      description: asT<String?>(json['description']),
      icon: asT<String?>(json['icon']),
      image: asT<String?>(json['image']),
      menuIcon: asT<String?>(json['menuIcon']),
      gameCount: asT<int?>(json['gameCount']),
      isActivityRecommend: asT<bool?>(json['isActivityRecommend']),
      openPromotion: asT<bool?>(json['openPromotion']),
      webRecommendImage: asT<String?>(json['webRecommendImage']),
      h5RecommendImage: asT<String?>(json['h5RecommendImage']),
    );
  }

  @override
  String toString() {
    return jsonEncode(this);
  }
}

class GameScenseHeaderMenuConfig {
  GameScenseHeaderMenuConfig({
    this.assignUrl,
    this.assignAppUrl,
    this.assignProviderId,
    this.assignGameProviderId,
    this.assignGameCode,
  });

  String? assignUrl;
  String? assignAppUrl;
  String? assignProviderId;
  String? assignGameProviderId;
  String? assignGameCode;

  factory GameScenseHeaderMenuConfig.fromJson(Map<String, dynamic> json) {
    return GameScenseHeaderMenuConfig(
      assignGameCode: asT<String?>(json['assignGameCode']),
      assignGameProviderId: asT<String?>(json['assignGameProviderId']),
      assignProviderId: asT<String?>(json['assignProviderId']),
      assignUrl: asT<String?>(json['assignUrl']),
      assignAppUrl: asT<String?>(json['assignAppUrl']),
    );
  }

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'assignUrl': assignUrl,
        'assignAppUrl': assignAppUrl,
        'assignProviderId': assignProviderId,
        'assignGameCode': assignGameCode,
        'assignGameProviderId': assignGameProviderId,
      };
}

class GamingGameScenesProviderSetting {
  GamingGameScenesProviderSetting({
    this.secondaryPage,
  });

  bool? secondaryPage;

  factory GamingGameScenesProviderSetting.fromJson(Map<String, dynamic> json) {
    return GamingGameScenesProviderSetting(
      secondaryPage: asT<bool?>(json['secondaryPage']),
    );
  }

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'secondaryPage': secondaryPage,
      };
}
