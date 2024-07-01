// ignore_for_file: library_private_types_in_public_api

import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/service/PlatformNotifier/local_notifier.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/service/h5_webview_manager.dart';
import 'package:gogaming_app/common/service/im/im_manager.dart';
import 'package:gogaming_app/common/service/language_service.dart';
import 'package:gogaming_app/common/service/shorebird_service.dart';
import 'package:gogaming_app/common/service/upgrade_app_service.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/common/widgets/go_gaming_scroll_behavior.dart';
import 'package:gogaming_app/config/global_setting.dart';
import 'package:gogaming_app/pages/unkown/unknown_page.dart';
import 'package:gogaming_app/socket/gaming_signalr_provider.dart';
import 'package:gogaming_app/widget_header.dart';

import 'common/service/game_flame_audio_service.dart';
import 'common/service/merchant_service/merchant_service.dart';
import 'config/user_setting.dart';

class MyApp extends StatefulWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  _MyAppState createState() {
    return _MyAppState();
  }
}

class _MyAppState extends State<MyApp> with WidgetsBindingObserver {
  Timer? _timer;
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    load();

    //设置全局的点击效果
    ScaleTapConfig.opacityMinValue = 0.8;
    ScaleTapConfig.scaleMinValue = 0.98;

    //设置全局的侧滑返回
    Get.config(
      defaultPopGesture: true,
      defaultTransition: Transition.cupertino,
    );

    // WidgetsBinding.instance.addPostFrameCallback((timeStamp) {
    //   SmartDialog.config.loading = SmartConfigLoading(
    //     maskColor: Colors.transparent,
    //     backDismiss: false,
    //   );
    // });
    setTimer();
    GamingDataCollection.sharedInstance.startTimeEvent(TrackEvent.visitAllPage);

    LocalNotifier().init().then((value) {
    LocalNotifier().requestPermissions();
  });
  }

  void setTimer() {
    _timer = Timer.periodic(const Duration(minutes: 10), (timer) {
      MerchantService.sharedInstance
          .getMerchantConfig(force: true)
          .listen((event) {});
    });
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.resumed:
        // 应用程序进入前台
        SignalrProvider().resetConnectionAndReconection();
        if (AccountService().isLogin) GamingEvent.signalrUpdateBalance.notify();
        MerchantService.sharedInstance.getMerchantConfig(force: false).listen(
          (event) {
            UpgradeAppService.sharedInstance.configParameter().listen((event) {
              UpdateType needUpdate =
                  UpgradeAppService.sharedInstance.checkIfNeedUpdate();

              if (needUpdate == UpdateType.updateTypeNotRequired) {
                // 无需更新时检查热更新补丁
                ShorebirdService.sharedInstance.update();
              }
            });
          },
        );
        setTimer();
        GlobalSetting.sharedInstance.isRiskClose.value = false;

        GameFlameAudioService.sharedInstance.stop();
        IMManager().appResumed();
        break;
      case AppLifecycleState.paused:
        SignalrProvider().closeConnection();
        GamingDataCollection.sharedInstance.uploadDataToServer();
        // 应用程序进入后台
        _timer?.cancel();
        GameFlameAudioService.sharedInstance.startBgmMusic(
          'lucky_spin_bg.mp3',
          true,
          volume: 0,
        );
        IMManager().paused();
        break;
      default:
        break;
    }
  }

  void load() {
    SignalrProvider();
  }

  @override
  void dispose() {
    super.dispose();
    WidgetsBinding.instance.removeObserver(this);
    GamingDataCollection.sharedInstance
        .submitDataPoint(TrackEvent.visitAllPage);
    _timer?.cancel();
    H5WebViewManager.sharedInstance.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        /// 全局点击空白区域 退出键盘
        FocusManager.instance.primaryFocus?.unfocus();

        /// FocusScope会自动管理焦点，非预期行为
        // FocusScope.of(context).requestFocus(FocusNode());
      },
      child: ScreenUtilInit(
          designSize: const Size(375, 812),
          builder: (context, child) {
            return GetMaterialApp(
              initialRoute: AppPages.initial,
              unknownRoute:
                  GetPage(name: '/notFound', page: () => const UnknownPage()),
              getPages: AppPages.routesVersion2,
              localizationsDelegates: const [
                AppLocalizations.delegate,
                GlobalMaterialLocalizations.delegate,
                GlobalWidgetsLocalizations.delegate,
                GlobalCupertinoLocalizations.delegate,
              ],
              locale: _getCurrentLocal(),
              supportedLocales: _getSupportedLocal(),
              themeMode: ThemeMode.light,
              onInit: () {
                ThemeManager.shareInstacne.initThemeSetting();
              },
              // ThemeManager.shareInstacne.currentTheme,
              theme: ThemeData(
                useMaterial3: false,
                visualDensity: VisualDensity.adaptivePlatformDensity,
                brightness: Brightness.light,
                colorScheme: ColorScheme.light(
                  background: GGColors.background.day,
                ),
                // 点击时的高亮效果设置为透明
                splashColor: Colors.transparent,
                // 设置导航栏日间版主题颜色
                appBarTheme: AppBarTheme(
                  systemOverlayStyle: ThemeManager.shareInstacne.lightStyle,
                  scrolledUnderElevation: 0,
                  surfaceTintColor: GGColors.transparent.color,
                ),
                textSelectionTheme: ThemeManager().textSelectionTheme,
                cupertinoOverrideTheme: ThemeManager().cupertinoOverrideTheme,
              ),
              darkTheme: ThemeData(
                useMaterial3: false,
                visualDensity: VisualDensity.adaptivePlatformDensity,
                brightness: Brightness.dark,
                // 点击时的高亮效果设置为透明
                splashColor: Colors.transparent,
                // 设置导航栏夜间版主题颜色
                appBarTheme: AppBarTheme(
                  systemOverlayStyle: ThemeManager.shareInstacne.darkStyle,
                  scrolledUnderElevation: 0,
                  surfaceTintColor: GGColors.transparent.color,
                ),
                colorScheme: ColorScheme.dark(
                  background: GGColors.background.night,
                ),
                textSelectionTheme: ThemeManager().textSelectionTheme,
                cupertinoOverrideTheme: ThemeManager().cupertinoOverrideTheme,
              ),
              scrollBehavior: GoGamingScrollBehavior(),
              debugShowCheckedModeBanner: false,
              navigatorObservers: [
                // GetXRouterObserver(), //可能导致GetX组件多次dispose
                FlutterSmartDialog.observer,
                SentryNavigatorObserver(setRouteNameAsTransaction: true),
              ],
              builder: FlutterSmartDialog.init(
                loadingBuilder: (msg) => GoGamingLoading(
                  color: GGColors.brand,
                  size: 20.dp,
                ),
              ),
            );
          }),
    );
  }

  List<Locale> _getSupportedLocal() {
    return LanguageService.sharedInstance.supported;
  }

  Locale _getCurrentLocal() {
    final supportedLocal = _getSupportedLocal();
    String lang = UserSetting.sharedInstance.lang;
    final defaultLocale = Platform.localeName
        .split('_'); // Returns locale string in the form 'en_US'
    Locale? sysSupportLocal;
    if (defaultLocale.isNotEmpty) {
      final sysLanguage = defaultLocale.first;
      sysSupportLocal = supportedLocal.firstWhereOrNull(
          (element) => element.languageCode.contains(sysLanguage));
    }
    if (lang.isNotEmpty) {
      return UserSetting.sharedInstance.locale;
    } else if (sysSupportLocal != null) {
      return sysSupportLocal;
    } else {
      return supportedLocal.first;
    }
  }
}
