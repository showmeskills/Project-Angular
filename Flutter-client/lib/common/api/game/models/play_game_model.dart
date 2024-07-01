import 'dart:io';

class PlayGameModel {
  final String? token;
  final String? playGameUrl;
  final Map<String, String>? openMethod;

  bool get openInBroswer {
    if (openMethod == null) return false;
    bool result = false;

    if (Platform.isAndroid) {
      result = openMethod!['appAndroid'] == 'Browser';
    } else if (Platform.isIOS) {
      result = openMethod!['appIos'] == 'Browser';
    }
    return result;
  }

  PlayGameModel({
    this.token,
    this.playGameUrl,
    this.openMethod,
  });

  PlayGameModel.fromJson(Map<String, dynamic> json)
      : token = json['token'] as String?,
        openMethod = json['openMethod'] == null
            ? null
            : Map<String, String>.from(json['openMethod'] as Map),
        playGameUrl = (json['playGameUrl'] as String?)?.trim(); //fix 游戏链接中存在空格

  Map<String, dynamic> toJson() => {
        'token': token,
        'playGameUrl': playGameUrl,
      };
}
