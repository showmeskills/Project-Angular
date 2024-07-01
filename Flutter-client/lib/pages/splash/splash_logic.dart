import 'dart:async';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/country_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/game_service.dart';
import 'package:gogaming_app/common/service/game_webview_manager.dart';
import 'package:gogaming_app/common/service/h5_webview_manager.dart';
import 'package:gogaming_app/common/service/im/im_manager.dart';
import 'package:gogaming_app/common/service/ip_service.dart';
import 'package:gogaming_app/common/service/merchant_service/merchant_service.dart';
import 'package:gogaming_app/common/service/restart_service.dart';
import 'package:gogaming_app/common/service/vip_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/config/info_config.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/helper/launch_util.dart';
import 'package:gogaming_app/socket/gaming_signalr_provider.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:iovation_flutter/iovation_flutter.dart';
import 'package:launch_queue/launch_queue.dart';

import '../../common/service/biometric_service.dart';
import '../../common/service/gaming_tag_service/gaming_tag_service.dart';

class SplashLogic extends GetxController {
  /// 3.10.1版本之后，废弃[窗口单例](https://docs.flutter.dev/release/breaking-changes/window-singleton)
  final Image _image = Image.asset(
    R.splashSplash,
    width: double.infinity,
    height: double.infinity,
    cacheHeight: WidgetsBinding
        .instance.platformDispatcher.views.first.physicalSize.height
        .toInt(),
    cacheWidth: WidgetsBinding
        .instance.platformDispatcher.views.first.physicalSize.height
        .toInt(),
    fit: BoxFit.cover,
  );

  Image get image => _image;

  ImageStream? _resolve;

  late ImageStreamListener _listener;

  @override
  void onInit() {
    log('SplashLogic onInit ===> ${DateTime.now()}', name: 'Launch');
    super.onInit();

    BiometricService.sharedInstance.getAvailableBiometrics().then((value) {});
    _configMerchantData();
  }

  void _configMerchantData() {
    if (InfoConfig.sharedInstance.isFirstStart != 1) {
      InfoConfig.sharedInstance.isFirstStart = 1;
      InfoConfig.sharedInstance.async();
    }
    MerchantService.sharedInstance.getMerchantConfig().listen((event) {
      _listener = ImageStreamListener(
        (image, synchronousCall) {
          log('Splash image loaded ===> ${DateTime.now()}', name: 'Launch');
          if (_resolve != null) {
            if (event?.maintain == true) {
              _navigateTomaintain(
                time: event?.maintainTimeEnd,
                email: event?.config?.maintenanceContactEmail,
              );
            } else {
              _init();
            }
            _resolve?.removeListener(_listener);
            _resolve = null;
          }
        },
      );
      _resolve = _image.image.resolve(ImageConfiguration.empty);
      _resolve!.addListener(_listener);
    });
  }

  @override
  void onClose() {
    super.onClose();
    _resolve?.removeListener(_listener);
    _resolve = null;
    //fix YM2021-3659 加载多语言后Get.forceAppUpdate 导致SplashLogic 重复创建两次
    if (Get.key.currentState?.context != null) {
      AppLocalizations.of(Get.key.currentState!.context)
          .asyncLoadNetworkJSON()
          .then((value) {
        log('AppLocalizations load _asyncLoadNetworkJSON ===> ${DateTime.now()}',
            name: 'Launch');
        // 多语言等异步数据加载的刷新需要放在进入首页时，不然rebuild时会去find已被销毁的controller
        Get.forceAppUpdate();
      });
    }
  }

  void _navigateTomaintain({
    int? time,
    String? email,
  }) {
    LaunchUtil.remove();
    Get.offNamed<void>(Routes.maintenance.route, arguments: {
      'maintainTimeEnd': time,
      'email': email,
    });
  }

  void _init() {
    LaunchUtil.remove();
    LaunchQueue.sharedInstance.clear();
    final now = DateTime.now();
    IovationFlutter.initialize(Config.iovationKey);
    RestartService.put(VipService());
    RestartService.put(CountryService());
    RestartService.put(GameService());
    RestartService.put(ThirdGameWebViewManger());
    RestartService.put(GamingTagService());
    Rx.combineLatestList([
      if (AccountService.sharedInstance.isLogin)
        AccountService.sharedInstance
            .authRefresh()
            .onErrorResume((error, stackTrace) => Stream.value(false))
            .doOnDone(() {
          AccountService.sharedInstance
              .updateGamingUserInfo()
              .listen((event) {}, onError: (err) {});
        }),
      if (!AccountService.sharedInstance.isLogin) Stream.value(true),
      IPService.sharedInstance.getIpInfo(),
    ]).flatMap((v) {
      return GamingTagService.sharedInstance.getScenseInfo();
    }).doOnDone(() {
      Rx.combineLatestList([
        CurrencyService.sharedInstance.getAllCurrency().doOnData((event) {
          CurrencyService().updateRate().listen(null, onError: (err) {});
        }),
        CountryService.sharedInstance.getCurrentCountry(),
      ]).listen(null, onError: (err) {});
      // 等待jwttoken获取后再请求长链接
      if (!AccountService.sharedInstance.isLogin) {
        SignalrProvider().resetConnectionAndReconection();
      }
      // 开始连接IM
      if (MerchantService().merchantConfigModel?.config?.chatEnabled == true) {
        IMManager().setup();
      }
      H5WebViewManager.sharedInstance.init();

      final end = DateTime.now();
      log('end ===> $end', name: 'Launch');
      log('end ===> $end ===>${end.difference(now)}', name: 'Launch');
      Get.offNamed<dynamic>(Routes.main.route);
      AccountService.sharedInstance.afterJumpMainPage();
      GameService.sharedInstance.initData();
    }).listen(null, onError: (Object? p0, p1) {
      // 接口报错但不是业务错误时
      if (p0 is GoGamingResponse &&
          [
            GoGamingError.fail,
            GoGamingError.server,
            GoGamingError.unknown,
          ].contains(p0.error)) {
        // 初始化api数据报错，重新选择线路启动
        Future.delayed(const Duration(seconds: 2), () {
          final dialog = DialogUtil(
            context: Get.overlayContext!,
            iconPath: R.commonDialogErrorBig,
            iconWidth: 80.dp,
            iconHeight: 80.dp,
            title: localized('hint'),
            content: localized('line_center_tip'),
            leftBtnName: '',
            rightBtnName: localized('sure'),
            onRightBtnPressed: () {
              Get.back<void>();
              Get.toNamed<void>(Routes.lineCenter.route);
            },
          );
          dialog.showNoticeDialogWithTwoButtons();
        });
      }
    });
  }
}
