import 'dart:convert';
import 'package:gogaming_app/common/api/game/models/gaming_game/game_model.dart';
import 'package:gogaming_app/common/utils/util.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GameSearchResultModel {
  GameSearchResultModel({
    this.labelInfo,
    this.gameInfo,
  });

  factory GameSearchResultModel.fromJson(Map<String, dynamic> json) {
    final List<LabelInfo>? labelInfo =
        json['labelInfo'] is List ? <LabelInfo>[] : null;
    if (labelInfo != null) {
      for (final dynamic item in json['labelInfo']! as List) {
        if (item != null) {
          labelInfo.add(LabelInfo.fromJson(asT<Map<String, dynamic>>(item)!));
        }
      }
    }

    final List<GamingGameModel>? gameInfo =
        json['gameInfo'] is List ? <GamingGameModel>[] : null;
    if (gameInfo != null) {
      for (final dynamic item in json['gameInfo']! as List) {
        if (item != null) {
          gameInfo
              .add(GamingGameModel.fromJson(asT<Map<String, dynamic>>(item)!));
        }
      }
    }
    return GameSearchResultModel(
      labelInfo: labelInfo,
      gameInfo: gameInfo,
    );
  }

  List<LabelInfo>? labelInfo;
  List<GamingGameModel>? gameInfo;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'labelInfo': labelInfo,
        'gameInfo': gameInfo,
      };
}

class LabelInfo {
  LabelInfo({
    this.labelId,
    this.labelName,
  });

  factory LabelInfo.fromJson(Map<String, dynamic> json) => LabelInfo(
        labelId: GGUtil.parseStr(json['labelId']),
        labelName: GGUtil.parseStr(json['labelName']),
      );

  String? labelId;
  String? labelName;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'labelId': labelId,
        'labelName': labelName,
      };
}

class GameLabels {
  GameLabels({
    this.code,
    this.description,
  });

  factory GameLabels.fromJson(Map<String, dynamic> json) => GameLabels(
        code: GGUtil.parseStr(json['code']),
        description: GGUtil.parseStr(json['description']),
      );

  String? code;
  String? description;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'code': code,
        'description': description,
      };
}
