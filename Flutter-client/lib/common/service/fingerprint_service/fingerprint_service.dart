import 'dart:async';
import 'package:flutter/cupertino.dart';
import 'package:flutter/services.dart';
import 'package:fpjs_pro_plugin/fpjs_pro_plugin.dart';
import 'package:fpjs_pro_plugin/region.dart';
import 'package:gogaming_app/config/config.dart';

import '../../../widget_header.dart';

class FingerprintService {
  factory FingerprintService() => _getInstance();

  static FingerprintService get sharedInstance => _getInstance();

  static FingerprintService? _instance;

  static FingerprintService _getInstance() {
    _instance ??= FingerprintService._internal();
    return _instance!;
  }

  String? _visitorId;

  FingerprintService._internal();

  final _cache = ReadWriteValue<String?>(
    'CacheVisitorId',
    null,
    () => GetStorage(),
  );

  void clearVisitorId() {
    _cache.val = null;
    _visitorId = null;
  }

  String readVisitorId() {
    if (_visitorId != null) {
      return _visitorId!;
    }
    return _cache.val ?? '';
  }

  Future<void> load() async {
    try {
      final completer = Completer<String?>();
      const timeoutDuration = Duration(seconds: 10);
      _getVisitorId(completer);
      final resultId =
          await completer.future.timeout(timeoutDuration, onTimeout: () {
        return null;
      });
      _writeReferrerCodeCache(resultId ?? '');
    } on PlatformException catch (e) {
      debugPrint("fingerprint_service error ==> ${e.toString()}");
    }
  }

  Future<String?> _getVisitorId(
      // ignore: strict_raw_type
      Completer completer) async {
    try {
      final visitorId = await FpjsProPlugin.getVisitorId()
              .timeout(const Duration(seconds: 10)) ??
          '';
      if (!completer.isCompleted) {
        completer.complete(visitorId);
      }
    } catch (e) {
      debugPrint("fingerprint_service error ==> ${e.toString()}");
    }
    return null; // 返回 null 作为默认值
  }

  void _writeReferrerCodeCache(String cacheCode) {
    _cache.val = cacheCode;
    _visitorId = cacheCode;
  }

  static Future<void> init() async {
    final apiKey =
        Config.isM1 ? "ooST0daBK6RhykPmAgv4" : "RZ5nD7YSVEi7DjTJkMKs";
    return await FpjsProPlugin.initFpjs(apiKey, region: Region.ap);
  }
}
