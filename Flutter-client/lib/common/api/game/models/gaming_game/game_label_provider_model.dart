import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GameLabelProviderModel {
  GameLabelProviderModel({
    required this.code,
    required this.name,
    required this.icon,
    required this.gameCount,
  });

  factory GameLabelProviderModel.fromJson(Map<String, dynamic> json) =>
      GameLabelProviderModel(
        code: asT<String>(json['code'])!,
        name: asT<String>(json['name'])!,
        icon: asT<String>(json['icon'])!,
        gameCount: asT<int>(json['gameCount'])!,
      );

  String code;
  String name;
  String icon;
  int gameCount;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'code': code,
        'name': name,
        'icon': icon,
        'gameCount': gameCount,
      };
}
