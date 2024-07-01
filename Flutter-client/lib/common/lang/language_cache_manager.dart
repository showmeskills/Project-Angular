import 'dart:developer';

import 'package:base_framework/base_framework.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/config/environment.dart';

import 'package:http/http.dart' as http;
import 'dart:async';
import 'dart:convert';

class LanguageCacheManager {
  static Map<String, String> codeUrls = {
    "zh": "zh-cn.json",
    "en": "en-us.json",
    "th": "th.json",
    "vi": "vi.json",
    "tr": "tr.json",
    "pt": "pt-br.json",
    "ja": "ja.json",
  };

  static Map<String, ReadWriteValue<String>> codeCache = {
    "zh": '{}'.val('zh'),
    "en": '{}'.val('en'),
    "th": '{}'.val('th'),
    "vi": '{}'.val('vi'),
    "tr": '{}'.val('tr'),
    "pt": '{}'.val('pt'),
    "ja": '{}'.val('ja'),
  };

  Map<String, String?> getLanguageCache(String code) {
    try {
      ReadWriteValue<String> cacheValue =
          LanguageCacheManager.codeCache[code] as ReadWriteValue<String>;

      List<int> bytes = cacheValue.val.codeUnits;
      final resultMap =
          Map<String, String?>.from(json.decode(utf8.decode(bytes)) as Map);
      return resultMap;
    } catch (e) {
      return {};
    }
  }

  Future<Map<String, Map<String, String>>> loadLanguageFile(
      {String code = ''}) async {
    if (code.isEmpty) return {};
    final filename = LanguageCacheManager.codeUrls[code];
    if (filename == null) return {};

    final Completer<Map<String, String>> completer = Completer();

    Future.wait<Map<String, String>>(
        List.generate(Config.sharedInstance.environment.languageUrlNum, (i) {
      return _loadOnlineLanguage(index: i, code: code).then((value) {
        if (value.isNotEmpty) {
          if (!completer.isCompleted) {
            completer.complete(value);
          }
          return value;
        } else {
          throw UnsupportedError('loadLanguage 没有数据');
        }
      });
    })).catchError((Object error) {
      // catchError 会在所有的future结束调用
      if (!completer.isCompleted) {
        log('没数据，所有域名用完了', name: 'LanguageCacheManager');
        final cacheValue =
            LanguageCacheManager.codeCache[code] as ReadWriteValue<String>;
        Sentry.captureException(GetAllTranslateError(
            Config.sharedInstance.environment.languageUrlList(),
            cacheValue.val.isNotEmpty));
        completer.complete(<String, String>{});
      }
      return Future.value(<Map<String, String>>[]);
    });

    // Map<String, String> resourceValue = map;
    return completer.future.then((value) {
      log('已获取到翻译文件', name: 'LanguageCacheManager');
      return {filename: value};
    });
  }

  Future<Map<String, String>> _loadOnlineLanguage({
    required String code,
    int index = 0,
  }) async {
    if (LanguageCacheManager.codeUrls[code] == null) return {};
    String filename = LanguageCacheManager.codeUrls[code]!;

    Map<String, dynamic> resultMap = {};

    final cacheValue =
        LanguageCacheManager.codeCache[code] as ReadWriteValue<String>;

    final url =
        '${Config.sharedInstance.environment.languageUrl(index: index)}$filename';
    try {
      var response = await http.get(Uri.parse(url));
      if (response.statusCode == 200) {
        final jsonStr = response.body;
        List<int> bytes = jsonStr.toString().codeUnits;
        resultMap = json.decode(utf8.decode(bytes)) as Map<String, dynamic>;

        if (resultMap.isEmpty) {
          log('$url ===> 没有数据', name: 'LanguageCacheManager');
          // Sentry.captureException(TranslateEmpty(url));
        } else {
          log('$url ===> 有数据', name: 'LanguageCacheManager');
          cacheValue.val = jsonStr;
        }
      }
    } catch (e) {
      log('$url ===> 请求失败', name: 'LanguageCacheManager');
      // Sentry.captureException(GetTranslateError(url, e));

      SentryReportUtil.captureHttpRequestError(
        apiErrorCode: SpecialApiErrorCode.translate.code,
        request: url,
        message: e.toString(),
      );
      return {};
    }

    Map<String, String> resourceValue = {};
    resultMap.forEach((key, value) {
      if (value is String) {
        resourceValue[key] = value;
      }
    });
    return resourceValue;
  }
}
