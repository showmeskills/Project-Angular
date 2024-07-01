// ignore_for_file: public_member_api_docs, sort_constructors_first
import '../gaming_game_scenes_model.dart';
import 'game_model.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

/// 场景跳转方式
///
/// * [labelPage] : 1 列表页
/// * [assignUrl] : 2 指定链接, App使用[assignAppUrl]的值跳转
/// * [assignProvider] : 3 指定厂商
/// * [AssignGame] : 4 指定游戏
enum GameLabelRedirectMethod {
  labelPage('LabelPage'),
  assignProvider('AssignProvider'),
  assignGame('AssignGame'),
  assignUrl('AssignUrl');

  const GameLabelRedirectMethod(this.value);
  final String value;
}

class GamingGameListByLabelIds {
  int? labelId;
  List<GamingGameModel>? gameLists;

  GamingGameListByLabelIds({
    this.labelId,
    this.gameLists,
  });

  factory GamingGameListByLabelIds.fromJson(Map<String, Object?> json) {
    final List<GamingGameModel>? gameList =
        json['gameList'] is List ? <GamingGameModel>[] : null;
    if (gameList != null) {
      for (final dynamic item in json['gameList']! as List) {
        if (item != null) {
          gameList
              .add(GamingGameModel.fromJson(asT<Map<String, dynamic>>(item)!));
        }
      }
    }
    return GamingGameListByLabelIds(
      labelId: asT<int?>(json['labelId']),
      gameLists: gameList,
    );
  }
}

class GamingGameListByLabelModel {
  String labelCode;
  String? labelName;
  String? description;
  String? icon;
  String? image;
  String? menuIcon;

  /// 场景跳转方式
  ///
  /// `GameLabelRedirectMethod` 指定跳转的方式
  String? redirectMethod;
  String? assignAppUrl;
  int multiLine;
  int gameCount;
  List<GamingGameModel> gameLists;

  /// 本地参数
  String? assignProviderId;
  String? assignGameProviderId;
  String? assignGameCode;

  GamingGameListByLabelModel({
    required this.labelCode,
    this.labelName,
    this.description,
    this.icon,
    this.image,
    this.menuIcon,
    this.redirectMethod,
    this.assignAppUrl,
    this.multiLine = 1,
    this.gameCount = 0,
    this.assignProviderId,
    this.assignGameProviderId,
    this.assignGameCode,
    this.gameLists = const [],
  });

  @override
  String toString() {
    return 'GamingGameListByLabelModel(labelCode: $labelCode, labelName: $labelName, description: $description, icon: $icon, image: $image, menuIcon: $menuIcon, gameCount: $gameCount, gameLists: $gameLists, redirectMethod: $redirectMethod, assignAppUrl: $assignAppUrl, multiLine: $multiLine)';
  }

  factory GamingGameListByLabelModel.fromScenseModel(
      GameScenseHeaderMenuItem item, List<GamingGameModel> gameLists) {
    return GamingGameListByLabelModel(
      labelCode: item.labelCode ?? '',
      labelName: item.labelName ?? '',
      icon: item.icon,
      image: item.image,
      menuIcon: item.menuIcon,
      gameLists: gameLists,
      gameCount: gameLists.length,
      redirectMethod: item.redirectMethod,
      assignAppUrl: item.config?.assignAppUrl ?? '',
      multiLine: item.multiLine ?? 1,
      assignProviderId: item.config?.assignProviderId,
      assignGameProviderId: item.config?.assignGameProviderId,
      assignGameCode: item.config?.assignGameCode,
    );
  }

  factory GamingGameListByLabelModel.fromJson(Map<String, Object?> json) {
    return GamingGameListByLabelModel(
      labelCode: json['labelCode'] as String,
      labelName: json['labelName'] as String?,
      description: json['description'] as String?,
      icon: json['icon'] as String?,
      image: json['image'] as String?,
      menuIcon: json['menuIcon'] as String?,
      redirectMethod: json['redirectMethod'] as String? ??
          GameLabelRedirectMethod.labelPage.value,
      assignAppUrl: json['assignAppUrl'] as String?,
      multiLine: json['multiLine'] as int? ?? 0,
      gameCount: json['gameCount'] as int? ?? 0,
      gameLists: (json['gameLists'] as List<dynamic>?)
              ?.map((e) => GamingGameModel.fromJson(e as Map<String, Object?>))
              .toList() ??
          [],
    );
  }

  Map<String, Object?> toJson() => {
        'labelCode': labelCode,
        'labelName': labelName,
        'description': description,
        'icon': icon,
        'image': image,
        'menuIcon': menuIcon,
        'redirectMethod': redirectMethod,
        'assignAppUrl': assignAppUrl,
        'multiLine': multiLine,
        'gameCount': gameCount,
        'gameLists': gameLists.map((e) => e.toJson()).toList(),
      };

  GamingGameListByLabelModel copyWith({
    String? labelCode,
    String? labelName,
    String? description,
    String? icon,
    String? image,
    String? menuIcon,
    String? redirectMethod,
    String? assignAppUrl,
    int? multiLine,
    int? gameCount,
    List<GamingGameModel>? gameLists,
  }) {
    return GamingGameListByLabelModel(
      labelCode: labelCode ?? this.labelCode,
      labelName: labelName ?? this.labelName,
      description: description ?? this.description,
      icon: icon ?? this.icon,
      image: image ?? this.image,
      menuIcon: menuIcon ?? this.menuIcon,
      redirectMethod: redirectMethod ?? this.redirectMethod,
      assignAppUrl: assignAppUrl ?? this.assignAppUrl,
      multiLine: multiLine ?? this.multiLine,
      gameCount: gameCount ?? this.gameCount,
      gameLists: gameLists ?? this.gameLists,
    );
  }
}
