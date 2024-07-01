import 'dart:async';
import 'dart:io';

import 'package:base_framework/base_framework.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:gogaming_app/common/service/im/im_manager.dart';
import 'package:workmanager/workmanager.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gogaming_app/common/service/language_service.dart';
import 'package:gogaming_app/common/service/proxy_service/proxy_service.dart';
import 'package:gogaming_app/common/service/shorebird_service.dart';
import 'package:gogaming_app/config/info_config.dart';
import 'package:gogaming_app/helper/launch_util.dart';
import 'package:gogaming_app/helper/sentry_util.dart';

import 'common/service/im/datebase/im_database_service.dart';
import 'common/service/market_link_service/market_link_service.dart';
import 'common/service/merchant_service/config_service.dart';
import 'common/tracker/analytics_manager.dart';
import 'my_app.dart';

// GGApplication _application = GGApplication();

StreamSubscription<ConnectivityResult>? _netSubscription;
ConnectivityResult connectivityResult = ConnectivityResult.none;

@pragma(
    'vm:entry-point') // Mandatory if the App is obfuscated or using Flutter 3.1+
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) {
    return IMManager().backgroundMode();
  });
}

Future<void> main() async {
  Workmanager().initialize(
      callbackDispatcher, // The top level function, aka callbackDispatcher
      isInDebugMode:
          true // If enabled it will post a notification whenever the task is running. Handy for debugging tasks
      );
  const iOSBackgroundAppRefresh =
      "be.tramckrijte.workmanagerExample.iOSBackgroundAppRefresh";
  Workmanager().registerPeriodicTask(
    iOSBackgroundAppRefresh,
    iOSBackgroundAppRefresh,
    initialDelay: const Duration(seconds: 0),
    // Ignored on iOS, rather set in AppDelegate.swift
    frequency: const Duration(seconds: 60 * 2),
  );

  LaunchUtil.init();
  await ShorebirdService.sharedInstance.getCurrentNumber();
  await SentryUtil().sentryInit();

  await Sentry.configureScope((p0) {
    p0.transaction = '/splash';
  });

  await AnalyticsManager.initAnalyticsManager();
  await MarketLinkService.initLinkManager();
  MarketLinkService.sharedInstance.loadLinkData();
  IMDatabaseService.sharedInstance.updateAllEntriesSendStatus();

  FlutterError.onError = (FlutterErrorDetails details) {
    Sentry.captureException(
      details.exception,
      stackTrace: details.stack,
    );
    FlutterError.dumpErrorToConsole(details, forceReport: true);
  };
}

Future<void> appRunner() async {
  ProxyService().setupProxy();
  await GetStorage.init();
  await SentryUtil.initUser();

  /// 针对 iOS14 以上首次安装无网络权限问题进行适配
  /// 首次进入如果无网络则等待网络状态变化后进入应用
  if (Platform.isIOS && InfoConfig.sharedInstance.isFirstStart == 0) {
    _netSubscription = Connectivity()
        .onConnectivityChanged
        .skip(1) // onConnectivityChanged.listen 会马上返回值 所以要过滤第一次result
        .timeout(const Duration(seconds: 10)) // 用10秒超时处理用户拒绝网络权限导致value不变
        .listen((ConnectivityResult result) {
      connectivityResult = result;
      _requestBeforeApp();
      _netSubscription?.cancel();
    }, onError: (_) {
      //处理TimeoutException
      _requestBeforeApp();
      _netSubscription?.cancel();
    });
  } else {
    _requestBeforeApp();
  }
}

void _requestBeforeApp() {
  debugPrint('Launch _requestBeforeApp ===> ${DateTime.now()}');
  ConfigService.sharedInstance.getConfigDomain(force: true).listen((event) {
    debugPrint('Launch getConfigDomain ===> ${DateTime.now()}');
    LanguageService.sharedInstance.getLanguage().doOnDone(() {
      SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp])
          .then((_) {
        debugPrint('Launch runApp ===> ${DateTime.now()}');
        runApp(const MyApp());
      });
    }).listen(null, onError: (err) {});
  });
}
