import 'package:base_framework/base_controller.dart';
import 'package:flutter/cupertino.dart';
import 'package:gogaming_app/common/service/language_service.dart';

final _box = GetStorage();
const _key = "GGUserSetting";

/// 使用缓存 所以fromJson和toJson需要全部property
class UserSetting {
  String lang;
  UserSetting({
    this.lang = "zh-cn",
  });

  static UserSetting get sharedInstance => _instance;

  static final _instance = () {
    final setting =
        UserSetting.fromJson(_box.read<Map<String, dynamic>>(_key) ?? {});
    _box.write(_key, setting.toJson());
    return setting;
  }();

  void async() {
    Get.updateLocale(locale);
    _box.write(_key, toJson());
  }

  factory UserSetting.fromJson(Map<String, dynamic> json) {
    return UserSetting(
      lang:
          '${json["lang"] ?? LanguageService.sharedInstance.sysSupportLocal.lang.toLowerCase()}',
    );
  }

  Locale get locale => Locale(
      lang.split("-").first.toLowerCase(), lang.split("-").last.toUpperCase());

  Map<String, dynamic> toJson() {
    return {
      "lang": lang,
    };
  }
}

extension _LocaleExt on Locale {
  String get lang {
    if (countryCode?.isEmpty ?? true) return languageCode;
    return "$languageCode-$countryCode";
  }
}
