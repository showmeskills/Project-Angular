import 'dart:convert';
import 'gaming_game/game_model.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingGameMultipleLabelModel {
  GamingGameMultipleLabelModel({
    required this.gameLists,
    this.labelName,
    this.icon,
  });

  factory GamingGameMultipleLabelModel.fromJson(Map<String, dynamic> json) {
    final String? labelName = asT<String?>(json['labelName']);
    final String? icon = asT<String?>(json['icon']);
    final List<GamingGameModel>? gameLists =
        json['gameLists'] is List ? <GamingGameModel>[] : null;
    if (gameLists != null) {
      for (final dynamic item in json['gameLists'] as List) {
        if (item != null) {
          gameLists
              .add(GamingGameModel.fromJson(asT<Map<String, dynamic>>(item)!));
        }
      }
    }
    return GamingGameMultipleLabelModel(
      gameLists: gameLists!,
      labelName: labelName,
      icon: icon,
    );
  }

  List<GamingGameModel> gameLists;
  String? labelName;
  String? icon;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'gameLists': gameLists,
        'labelName': labelName,
        'icon': icon,
      };
}
