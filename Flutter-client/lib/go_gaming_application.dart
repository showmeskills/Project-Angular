// ignore_for_file: unused_element, unused_import

import 'package:flutter/cupertino.dart';
import 'package:gogaming_app/common/api/base/go_gaming_service.dart';
import 'package:gogaming_app/common/api/user_notice/models/gaming_notice_config.dart';
import 'package:gogaming_app/common/api/user_notice/user_notice_api.dart';
import 'package:gogaming_app/config/user_setting.dart';

import 'common/api/base/base_api.dart';
import 'common/api/language/language_api.dart';
import 'common/api/language/models/gaming_language.dart';

class GGApplication {
  void testApi() {
    _languageApi();
    // _noticeApi();
  }

  void _noticeApi() {
    PGSpi(UserNotice.getNoticeConfig.toTarget())
        .rxRequest<GamingNoticeConfig?>((value) {
          return value['data'] is Map<String, dynamic>
              ? GamingNoticeConfig.fromJson(
                  value['data'] as Map<String, dynamic>)
              : null;
        })
        .listen((event) => debugPrint('$event'))
        .onError((Object error) => debugPrint('$error'));

    PGSpi(UserNotice.getNoticeListN.toTarget(input: {'n': 10}))
        .rxRequest<bool?>((value) {
          return value['data'] is bool ? value['data'] as bool : null;
        })
        .listen((event) => debugPrint('$event'))
        .onError((Object error) => debugPrint('$error'));
  }

  void _languageApi() {
    PGSpi(Language.getLanguage.toTarget())
        .rxRequest<List<GamingLanguage>>((value) {
          if (value['data'] == null) return [];
          final list = List<Map<String, dynamic>>.from(value['data'] as List);
          return list.map((e) => GamingLanguage.fromJson(e)).toList();
        })
        .listen((event) => debugPrint('$event'))
        .onError((Object error) => debugPrint('$error'));

    // const langCode = "en-us";
    // PGSpi(Language.set.toTarget(input: {"langCode": langCode}))
    //     .rxRequest<String>((value) {
    //   return value['data'] as String;
    // }).listen((event) {
    //   GoGamingService.sharedInstance.updateToken(event.data);
    //   UserSetting.sharedInstance.lang = langCode;
    //   UserSetting.sharedInstance.async();
    //   // TODO: update user.token and save cache
    //   // update user.token
    //   // AccountService.sharedInstance.saveGamingUser(AccountService.sharedInstance.gamingUser);
    //   debugPrint('$event');
    // }).onError((Object error) => debugPrint('$error'));
    //
  }
}
