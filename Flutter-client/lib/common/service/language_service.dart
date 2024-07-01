import 'dart:io';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/base/go_gaming_service.dart';
import 'package:gogaming_app/common/api/language/language_api.dart';
import 'package:gogaming_app/common/api/language/models/gaming_language.dart';

class LanguageService {
  factory LanguageService() => _getInstance();

  static LanguageService get sharedInstance => _getInstance();

  static LanguageService? _instance;

  static LanguageService _getInstance() {
    _instance ??= LanguageService._internal();
    return _instance!;
  }

  LanguageService._internal();

  late List<GamingLanguage> _languages = () {
    return _parseJson(_cacheLanguage.val);
  }();
  List<GamingLanguage> get languages => _languages;

  final _cacheLanguage = ReadWriteValue<List<dynamic>?>('CacheLanguage', null);

  List<GamingLanguage> get _defaultLanguages {
    return [
      GamingLanguage(
        name: 'English',
        code: 'en-us',
      ),
      GamingLanguage(
        name: '中文',
        code: 'zh-cn',
      ),
      GamingLanguage(
        name: 'ภาษาไทย',
        code: 'th',
      ),
      GamingLanguage(
        name: 'tiếng Việt',
        code: 'vi',
      ),
      GamingLanguage(
        name: 'Türk Dili',
        code: 'tr',
      ),
      GamingLanguage(
        name: 'Português',
        code: 'pt-br',
      ),
      GamingLanguage(
        name: '日本語',
        code: 'ja',
      ),
    ];
  }

  List<Locale> get supported {
    return languages.map((e) {
      return Locale(e.languageCode!, e.countryCode);
    }).toList();
  }

  Locale get sysSupportLocal {
    final supportedLocal = supported;
    final defaultLocale = Platform.localeName
        .split('_'); // Returns locale string in the form 'en_US'
    Locale? sysSupportLocal;
    if (defaultLocale.isNotEmpty) {
      final sysLanguage = defaultLocale.first;
      sysSupportLocal = supportedLocal.firstWhereOrNull(
          (element) => element.languageCode.contains(sysLanguage));
    }
    if (sysSupportLocal != null) {
      return sysSupportLocal;
    } else {
      return supportedLocal.first;
    }
  }

  Stream<List<GamingLanguage>> getLanguage({
    bool force = false,
  }) {
    // 获取可切换的语言
    late Stream<List<GamingLanguage>> stream;
    final service = GoGamingService();
    if (service.jwtToken == null) {
      stream =
          service.authSetup().asStream().flatMap((value) => _languageStream());
    } else {
      stream = _languageStream();
    }

    if (force) {
      return stream;
    } else {
      stream.listen(null, onError: (err) {});
      return Stream.value(_languages);
    }
  }

  List<GamingLanguage> _storeLanguage(List<GamingLanguage> value) {
    _cacheLanguage.val = value.map((e) => e.toJson()).toList();
    _languages = value;
    return _languages;
  }

  List<GamingLanguage> _parseJson(List<dynamic>? json) {
    if (json == null) {
      return _defaultLanguages;
    }
    try {
      return List<Map<String, dynamic>>.from(json)
          .map((e) => GamingLanguage.fromJson(e))
          .toList();
    } catch (e) {
      return _defaultLanguages;
    }
  }

  Stream<List<GamingLanguage>> _languageStream() {
    final header = {
      'Authorization': 'Bearer ${GoGamingService().jwtToken ?? ''}',
    };
    return PGSpi(Language.getLanguage.toTarget(
      inputHeaders: header,
    )).rxRequest<List<GamingLanguage>>((value) {
      if (value['data'] == null) return _defaultLanguages;
      return _parseJson(value['data'] as List);
    }).flatMap((value) {
      return Stream.value(value.data);
    }).onErrorResume((error, stackTrace) {
      return Stream.value(_defaultLanguages);
    }).doOnData((event) {
      final codes = event.map((e) => e.languageCode).toList();
      final list = <GamingLanguage>[];
      // 从本地支持语言中过滤出可切换的语言
      for (var e in _defaultLanguages) {
        if (codes.contains(e.languageCode)) {
          list.add(e);
        }
      }
      _storeLanguage(list);
    });
  }
}
