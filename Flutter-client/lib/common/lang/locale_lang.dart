// ignore_for_file: non_constant_identifier_names, unused_element

import 'dart:async';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/service/language_service.dart';

import '../api/base/base_api.dart';
import 'language_cache_manager.dart';
import 'package:gogaming_app/translate/translate_zh.dart';
import 'package:gogaming_app/translate/translate_vi.dart';
import 'package:gogaming_app/translate/translate_th.dart';
import 'package:gogaming_app/translate/translate_pt.dart';
import 'package:gogaming_app/translate/translate_ja.dart';
import 'package:gogaming_app/translate/translate_tr.dart';
import 'package:gogaming_app/translate/translate_en.dart';

String interpolate(String string, List<String> params) {
  String result = string;
  for (int i = 0; i < params.length; i++) {
    result = result.replaceAll('\${$i}', params[i]);
    result = result.replaceAll(' \$ {$i}', params[i]);
  }

  return result;
}

String localized(String jsonPath, {List<String>? params, String? prePath}) {
  if (prePath != null) jsonPath = prePath + jsonPath;
  final appLocalizations = AppLocalizations.of(Get.context!);
  final brandName = appLocalizations.t('brand_name');
  final text = appLocalizations
      .t(jsonPath)
      .replaceAll('\\n', '\n')
      .replaceAll('{Brand}', brandName);

  if (params != null && params.isNotEmpty) {
    return interpolate(text, params);
  }
  return text;
}

class AppLocalizations {
  Locale locale;

  Map<String, dynamic> localizedStrings = {};
  Map<String, dynamic> zhStrings = {};
  Map<String, dynamic> enStrings = {};
  Map<String, dynamic> thStrings = {};
  Map<String, dynamic> viStrings = {};
  Map<String, dynamic> trStrings = {};
  Map<String, dynamic> ptStrings = {};
  Map<String, dynamic> jaStrings = {};

  LanguageCacheManager cacheManager = LanguageCacheManager();
  static const LocalizationsDelegate<AppLocalizations> delegate =
      _ApplocalizationDelegate();

  //constructor
  AppLocalizations(this.locale);

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  Future<bool> load() async {
    log('AppLocalizations load ===> ${DateTime.now()}', name: 'Launch');
    Map<String, dynamic>? stringsToUse;
    switch (locale.languageCode) {
      case "zh":
        stringsToUse = zhStrings;
        break;
      case "en":
        stringsToUse = enStrings;
        break;
      case "th":
        stringsToUse = thStrings;
        break;
      case "vi":
        stringsToUse = viStrings;
        break;
      case "tr":
        stringsToUse = trStrings;
        break;
      case "pt":
        stringsToUse = ptStrings;
        break;
      case "ja":
        stringsToUse = jaStrings;
        break;
    }

    if (stringsToUse != null && stringsToUse.isNotEmpty) {
      localizedStrings = stringsToUse;
      return true;
    }

    //找不到，第一次进来 加载本地翻译文件
    localizedStrings = _getTranslateMap(locale.languageCode);

    final cacheStrings = cacheManager.getLanguageCache(locale.languageCode);
    localizedStrings.addAll(cacheStrings);
    log('AppLocalizations load success ===> ${DateTime.now()}', name: 'Launch');
    return true;
  }

  void _asyncLoadForAllOthers() {
    if (zhStrings.isEmpty) {
      _asyncLoadForLanguage("zh");
    }
    if (enStrings.isEmpty) {
      _asyncLoadForLanguage("en");
    }
    if (thStrings.isEmpty) {
      _asyncLoadForLanguage("th");
    }
    if (viStrings.isEmpty) {
      _asyncLoadForLanguage("vi");
    }
    if (jaStrings.isEmpty) {
      _asyncLoadForLanguage("ja");
    }
    if (ptStrings.isEmpty) {
      _asyncLoadForLanguage("pt");
    }
    if (trStrings.isEmpty) {
      _asyncLoadForLanguage("tr");
    }
  }

  Map<String, dynamic> _getTranslateMap(String languageCode) {
    Map<String, dynamic> result = {};
    if (languageCode == 'zh') {
      result.addAll(zhTranslate);
    } else if (languageCode == 'vi') {
      result.addAll(viTranslate);
    } else if (languageCode == 'th') {
      result.addAll(thTranslate);
    } else if (languageCode == 'en') {
      result.addAll(enTranslate);
    } else if (languageCode == 'ja') {
      result.addAll(jaTranslate);
    } else if (languageCode == 'tr') {
      result.addAll(trTranslate);
    } else if (languageCode == 'pt') {
      result.addAll(ptTranslate);
    }
    return result;
  }

  /// 先加载本地资料 再加载网络资料
  void _asyncLoadForLanguage(String language) async {
    Map<String, dynamic> stringsToUse = {};
    switch (language) {
      case "zh":
        zhStrings = zhTranslate;
        stringsToUse = zhStrings;
        break;
      case "en":
        enStrings = enTranslate;
        stringsToUse = enStrings;
        break;
      case "th":
        thStrings = thTranslate;
        stringsToUse = thStrings;
        break;
      case "vi":
        viStrings = viTranslate;
        stringsToUse = viStrings;
        break;
      case "tr":
        trStrings = trTranslate;
        stringsToUse = trStrings;
        break;
      case "pt":
        ptStrings = ptTranslate;
        stringsToUse = ptStrings;
        break;
      case "ja":
        jaStrings = jaTranslate;
        stringsToUse = jaStrings;
        break;
    }

    cacheManager.loadLanguageFile(code: language).then((value) {
      String downloadUrl = value.keys.first;
      if (LanguageCacheManager.codeUrls[language] != downloadUrl) return;
      Map<String, String> responseValue = value[downloadUrl] ?? {};
      responseValue.forEach((key, value) {
        // 本阶段暂时兼容本地和网络两个版本的json
        // 网络资料覆盖本地资料
        stringsToUse[key] = value;
      });
    }).onError((error, stackTrace) {});
  }

  /// 加载网络翻译文件
  Future<void> asyncLoadNetworkJSON() async {
    Completer<void> c = Completer();
    cacheManager.loadLanguageFile(code: locale.languageCode).then((value) {
      String downloadUrl = value.keys.first;
      if (LanguageCacheManager.codeUrls[locale.languageCode] != downloadUrl) {
        return;
      }

      Map<String, String> responseValue = value[downloadUrl] ?? {};
      responseValue.forEach((key, value) {
        // 本阶段暂时兼容本地和网络两个版本的json
        localizedStrings[key] = value;
      });

      switch (locale.languageCode) {
        case "zh":
          zhStrings = localizedStrings;
          break;
        case "en":
          enStrings = localizedStrings;
          break;
        case "th":
          thStrings = localizedStrings;
          break;
        case "vi":
          viStrings = localizedStrings;
          break;
        case "tr":
          trStrings = localizedStrings;
          break;
        case "pt":
          ptStrings = localizedStrings;
          break;
        case "ja":
          jaStrings = localizedStrings;
          break;
      }

      Future(() {
        c.complete();
      });
    }).onError((error, stackTrace) {
      debugPrint("down load language json：Error: ======>$error");
      Future(() {
        c.complete();
      });
    });
    return c.future;
  }

  void printJsonMapAllLanguage() async {
    List<String> languageCode =
        LanguageService.sharedInstance.supported.map((e) {
      return e.languageCode;
    }).toList();

    Map<String, Map<String, String>> codeKeyValues = {};
    for (String code in languageCode) {
      Map<String, dynamic> map = _getTranslateMap(code);
      Map<String, String> keyValues = printJsonMap(map);
      codeKeyValues[code] = keyValues;
      // print(_keyValues);
    }

    List<String> fullLines = [];
    codeKeyValues["zh"]?.forEach((key, value) {
      if (codeKeyValues["en"]![key] != null &&
          codeKeyValues["th"]![key] != null &&
          codeKeyValues["vi"]![key] != null) {
        String enValue = codeKeyValues["en"]![key]!;
        String thValue = codeKeyValues["th"]![key]!;
        String viValue = codeKeyValues["vi"]![key]!;
        String line = [key, value, enValue, thValue, viValue].join("^");
        fullLines.add(line);
      }
    });

    String fullLineText = fullLines.join("\n");
    debugPrint(fullLineText);
  }

  Map<String, String> printJsonMap(Map<String, dynamic> map, {String? preKey}) {
    Map<String, String> keyValues = {};
    map.forEach((key, value) {
      if (value is String) {
        if (key.isNotEmpty) {
          keyValues["${preKey != null ? "$preKey." : ""}$key"] =
              value.replaceAll("\n", "\\n");
          // print("${preKey != null ? "${preKey}." : ""}${key}:${value.replaceAll("\n", "\\n")}");
        }
      } else if (value is Map) {
        Map<String, String> keyValues = printJsonMap(
            value as Map<String, String>,
            preKey: "${preKey != null ? "$preKey." : ""}$key");
        keyValues.addAll(keyValues);
      }
    });
    return keyValues;
  }

  bool isEnglish() {
    return locale.languageCode.contains("en");
  }

  bool isMandarin() {
    return locale.languageCode.contains("zh");
  }

  bool isVietnamese() {
    return locale.languageCode.contains("vi");
  }

  bool isThailand() {
    return locale.languageCode.contains("th");
  }

  //translate method
  String t(String key) {
    // var _array = key.split('.');
    // var _dict = localizedStrings;
    // 前端传入的key可能有大写字母。后台全部自动转换为小写，做个兼容
    String retValue = (localizedStrings[key] ??
        localizedStrings[key.toLowerCase()] ??
        key) as String;
    if (retValue.isNotEmpty) return retValue;

    // try {
    //   _array.forEach((item) {
    //     if (_dict[item].runtimeType == Null) {
    //       retValue = key;
    //       return;
    //     }
    //
    //     if (_dict[item].runtimeType != String) {
    //       _dict = _dict[item];
    //     } else {
    //       retValue = _dict[item];
    //     }
    //   });
    //   retValue = retValue.isEmpty ? _dict : retValue;
    // } catch (e) {
    //   print('lotteryLocalizationsConfig exception');
    //   print(e);
    //   retValue = key;
    // }

    return retValue;
  }
}

class _ApplocalizationDelegate extends LocalizationsDelegate<AppLocalizations> {
  final String TAG = 'AppLocalizations';

  const _ApplocalizationDelegate();

  @override
  bool isSupported(Locale locale) {
    return LanguageService.sharedInstance.supported.contains(locale);
  }

  @override
  Future<AppLocalizations> load(Locale locale) async {
    final date1 = DateTime.now();
    AppLocalizations localizations = AppLocalizations(locale);
    await localizations.load();
    final date2 = DateTime.now();
    log('多语言加载时间：${date2.difference(date1)}');
    return localizations;
  }

  @override
  bool shouldReload(_ApplocalizationDelegate old) => false;
}
// class DefaultLanguageCacheManager extends Object with LanguageCacheManager{
//
// }
