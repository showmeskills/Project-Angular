import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_branch_sdk/flutter_branch_sdk.dart';
import 'package:gogaming_app/config/config.dart';

import '../../../widget_header.dart';
import '../../utils/util.dart';

class MarketLinkService {
  factory MarketLinkService() => _getInstance();

  static MarketLinkService get sharedInstance => _getInstance();

  static MarketLinkService? _instance;

  static MarketLinkService _getInstance() {
    _instance ??= MarketLinkService._internal();
    return _instance!;
  }

  String? _referrerCode;

  MarketLinkService._internal();

  final _cache = ReadWriteValue<String?>(
    'CacheReferrerCode',
    null,
    () => GetStorage(),
  );

  void clearReferrerCodeCache() {
    _cache.val = null;
    _referrerCode = null;
  }

  String readReferrerCodeCache() {
    if (_referrerCode != null) {
      return _referrerCode!;
    }
    return _cache.val ?? '';
  }

  Future<void> loadLinkData() async {
    Map<dynamic, dynamic> tryData =
        await FlutterBranchSdk.getLatestReferringParams();
    if (tryData.isNotEmpty) {
      final tid = num.tryParse(tryData['tid'].toString());
      if (tid == (Config.isM1 ? 1 : 2)) {
        _parseData(tryData);
        return;
      }
    }

    /// 有时候通过 getLatestReferringParams 方法获取不到使用
    /// 通过 listSession 再获取一次尽量保证有值
    FlutterBranchSdk.listSession().listen((data) {
      final tid = num.tryParse(data['tid'].toString());
      if (tid == (Config.isM1 ? 1 : 2)) {
        _parseData(tryData);
      }
    }, onError: (Object error) {
      debugPrint("load market link data => error=${error.toString()}");
    });
  }

  void _parseData(Map<dynamic, dynamic> data) {
    Sentry.captureException(BranchLoadDataSuccess());
    final aff = GGUtil.parseStr(data['aff']);
    final inviteCode = GGUtil.parseStr(data['inviteCode']);
    final linkCode = aff.isEmpty ? inviteCode : aff;
    if (linkCode.isNotEmpty) {
      _referrerCode = linkCode;
      _writeReferrerCodeCache(linkCode);
    }
  }

  void _writeReferrerCodeCache(String cacheCode) {
    _cache.val = cacheCode;
  }

  static Future<void> initLinkManager() async {
    return await FlutterBranchSdk.init(
      useTestKey: false,
      enableLogging: false,
      disableTracking: false,
    );
  }
}
