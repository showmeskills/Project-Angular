import 'dart:async';

import 'package:flutter/cupertino.dart';
import 'package:gogaming_app/common/api/base/go_gaming_service.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/pages/main/main_logic.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../service/biometric_service.dart';
import 'webview_cache_manager.dart';

enum WebViewBackMode {
  /// 仅关闭
  onlyExit,

  /// 返回+关闭
  backAndExit,

  /// 无
  none;

  const WebViewBackMode();

  double get leadingWidth {
    switch (this) {
      case WebViewBackMode.onlyExit:
        return 50.dp;
      case WebViewBackMode.backAndExit:
        return 100.dp;
      case WebViewBackMode.none:
        return 0;
    }
  }
}

abstract class BaseWebViewControllerImp extends GetxController {
  final int? windowId;
  final WebViewBackMode backMode;

  BaseWebViewControllerImp({
    this.windowId,
    this.backMode = WebViewBackMode.backAndExit,
  });

  late InAppWebViewController _webController;
  InAppWebViewController get webController => _webController;
  set webController(InAppWebViewController v) {
    _webController = v;
    WebViewCacheManager.clearCache = false;
    _addJavaScriptHandler();
  }

  final progress = 0.obs;
  final progressAnimateFinish = false.obs;

  final webError = false.obs;
  bool get showWebErrorPage => webError.value;

  void _addJavaScriptHandler() {
    webController.addJavaScriptHandler(
      handlerName: 'actionApp',
      callback: (args) async {
        debugPrint('args = $args -- ${args.toString()}');
        _handleMethod(args[0] as Map<String, dynamic>);
      },
    );
  }

  void _handleMethod(Map<String, dynamic> params) {
    String? method = params['method'].toString();
    Map<String, dynamic> paramMap = {};
    if (params.isNotEmpty && params.containsKey('args')) {
      var resMap = params['args'];
      if (resMap != null) {
        paramMap = resMap as Map<String, dynamic>;
      }
    }
    debugPrint(' _handleMethod method = $method -- paramMap =$paramMap');

    handleMethod(method, paramMap);
  }

  void setProgress(int value) {
    assert(value >= 0 && value <= 100);
    progressAnimateFinish.value = value < 100;
    progress.value = value;
  }

  void handleMethod(String method, Map<String, dynamic> params) {}

  void reloadErrorPage() {
    webController.reload();
  }

  void goBack() async {
    if (await webController.canGoBack()) {
      webController.goBack();
    } else {
      Get.back<void>();
    }
  }

  void onLoadError(Uri? url, int code, String message) {
    if (!message.contains('net::')) {
      Sentry.captureException(WebViewError(
        url: url.toString(),
        code: code,
        message: message,
      ));
    }
  }
}

class BaseWebViewController extends BaseWebViewControllerImp
    with WidgetsBindingObserver {
  BaseWebViewController({
    this.link,
    this.htmlString,
    this.localHtml,
    super.windowId,
    super.backMode,
  }) : assert(
          (link != null &&
                  htmlString == null &&
                  windowId == null &&
                  localHtml == null) ||
              (htmlString != null &&
                  windowId == null &&
                  link == null &&
                  localHtml == null) ||
              (windowId != null &&
                  link == null &&
                  htmlString == null &&
                  localHtml == null) ||
              (localHtml != null &&
                  link == null &&
                  htmlString == null &&
                  windowId == null),
          'link, htmlString, windowId 有且只能有一个不为空',
        );

  @override
  set webController(InAppWebViewController v) {
    super.webController = v;
    if (localHtml != null) {
      webController.loadFile(assetFilePath: localHtml!);
    } else if (link != null) {
      webController.loadUrl(urlRequest: URLRequest(url: Uri.parse(link!)));
    } else if (htmlString != null) {
      webController.loadData(data: htmlString!);
    }
  }

  @override
  void handleMethod(String method, Map<String, dynamic> params) {
    switch (method) {
      case 'changeTitle':
        String? title = GGUtil.parseStr(params['title']);
        setTitle(title, true);
        break;
      case 'webToNativeLogin':
        if (!AccountService().isLogin) {
          _onLogin();
        }
        break;
      case 'openNativeCustomerService':
        Get.until((route) => Get.currentRoute == Routes.main.route);
        Get.find<MainLogic>().changeSelectIndex(3);
        break;
      case 'openNativeKYC':
        // 原生kyc认证之后，需要退出重新进去之后web端才能刷新
        Get.back<dynamic>();
        if (!Routes.c(Get.currentRoute).isKycPage()) {
          Get.toNamed<dynamic>(Routes.kycHome.route);
        }
        break;
      case 'backToNative':
        goBack();
        break;
      case 'appLockTitleMoney':
        AccountService.sharedInstance.updateBalanceLock = true;
        break;
      case 'appUnLockTitleMoney':
        AccountService.sharedInstance.updateBalanceLock = false;
        GamingEvent.signalrUpdateBalance.notify();
        break;
      case 'appCurrentMoney':
        GamingEvent.updateBalanceByApp.notify(data: params);
        break;
    }
  }

  void _onLogin() {
    if (BiometricService.sharedInstance.canBiometricLogin()) {
      Get.toNamed<dynamic>(Routes.biometricLogin.route);
    } else {
      Get.toNamed<dynamic>(Routes.login.route);
    }
  }

  final RxnString _title = RxnString();
  String get title => _title.value ?? localized('brand_name');
  late BuildContext context;
  String? link;
  String? htmlString;
  String? localHtml;
  // DragGesturePullToRefresh dragGesturePullToRefresh =
  //     DragGesturePullToRefresh();
  @override
  bool get showWebErrorPage => super.showWebErrorPage && link != null;

  @override
  void onInit() {
    super.onInit();
    WidgetsBinding.instance.addObserver(this);
    GamingEvent.login.subscribe(_refreshLogin);
  }

  @override
  void didChangeMetrics() {
    // on portrait / landscape or other change, recalculate height
    // dragGesturePullToRefresh.setHeight(MediaQuery.of(context).size.height);
  }

  Future<void> onRefresh() async {
    webController.reload();
    // dragGesturePullToRefresh.refresh();
  }

  @override
  void reloadErrorPage() {
    // webError(WebResourceError(errorCode: -1, description: ''));
    webController.loadData(data: link!);
  }

  void setTitle(String? title, [bool force = false]) {
    if (force || _title.value == null) {
      _title.value = title;
    }
  }

  @override
  void onClose() {
    WidgetsBinding.instance.removeObserver(this);
    GamingEvent.login.unsubscribe(_refreshLogin);
    super.onClose();
  }

  void _refreshLogin() {
    String token = GoGamingService.sharedInstance.userToken ?? '';
    webController.evaluateJavascript(source: '''
      window.setWebToken("$token")
    ''').then((value) {
      debugPrint('_refreshLogin value = $value');
    });
  }
}
