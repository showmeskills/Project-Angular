import 'package:base_framework/base_controller.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:gogaming_app/common/service/game_webview_manager.dart';
import 'package:gogaming_app/common/widgets/header/gg_user_app_bar_controller.dart';
import 'package:gogaming_app/common/widgets/webview_flutter/webview_flutter_controller.dart';

import '../../common/service/account_service.dart';
import '../../common/service/event_service.dart';
import '../../common/tools/stream_controller.dart';
import '../../router/app_pages.dart';
import 'web_game_state.dart';

class WebGameLogic extends GetxController {
  WebGameLogic({
    required String url,
    required this.providerId,
    required this.webview,
  }) {
    gameLink.value = url;
    // url不存在则隐藏webview
    hideWebView.value = url.isEmpty;
  }

  final String providerId;
  final WebGameState state = WebGameState();
  final isFullScreen = false.obs;
  final GlobalKey stackKey = GlobalKey();
  final gameLink = ''.obs;

  final GameWebViewManagerImpl webview;

  final hideWebView = true.obs;

  GGUserAppBarController get appBarController =>
      Get.find<GGUserAppBarController>();

  /// 修复娱乐场-3D经典老虎机，inappwebview插件自定义全屏模式，覆盖weidget导致无法返回
  // String get ua =>
  //     "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";
  String? get ua => ThirdGameWebViewManger.sharedInstance
      .getUserAgent(providerId: providerId);

  @override
  void onInit() {
    super.onInit();
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
    GamingEvent.webBridgeTrigger.subscribe(_receivedMessage);
  }

  void _receivedMessage(dynamic data) {
    Map<dynamic, dynamic> dataMap = data as Map<dynamic, dynamic>;
    final message = dataMap['message'];
    if (message != null) {
      if (message == 'logout') {
        GGStreamController.debounce(() {
          Get.back<void>();
        });
      } else if (message == 'reloadGame') {
        webview.webViewController.reload();
      } else if (message == 'reLogin') {
        GGStreamController.debounce(() {
          if (AccountService.sharedInstance.isLogin) {
            return;
          }
          Get.toNamed<dynamic>(Routes.login.route);
        });
      }
    }
  }

  @override
  void onClose() {
    super.onClose();
    GamingEvent.webBridgeTrigger.unsubscribe(_receivedMessage);
    // selectedCurrencySub.cancel();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.manual,
        overlays: SystemUiOverlay.values);
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
    ]);
    // _worker.dispose();
  }

  void onPressFullScreen() {
    isFullScreen.value = !isFullScreen.value;
    // if (Platform.isAndroid) {
    if (isFullScreen.value) {
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
    } else {
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.manual,
          overlays: SystemUiOverlay.values);
      // SystemChrome.restoreSystemUIOverlays();
    }
    // }
    webview.webViewController.runJavaScript('location.reload(false);');
    WebViewFlutterController logic = Get.find<WebViewFlutterController>();
    logic.showProgress.value = !isFullScreen.value;
  }

  void webPageFinished() {
    /// png 游戏需要处理 logout 回调，否则用户点击游戏内首页按钮会出现黑屏
    if (providerId.contains('PNGGame')) {
      webview.webViewController.runJavaScript('''
          Engage.addEventListener('logout', function() {
            console.log('engage logout');
            GoGamingWebBridge.postMessage('logout');
          });
          Engage.addEventListener('reloadGame', function() {
            console.log('engage reloadGame');
            GoGamingWebBridge.postMessage('reloadGame');
          });
        ''');
    } else if (providerId.contains('FBSport')) {
      webview.webViewController.runJavaScript('''
         window.addEventListener('message', receiveMessage, false);
 
         function receiveMessage(event) {
           if (event.data.relogin === true) {
             GoGamingWebBridge.postMessage('reLogin');
           }
         }
        ''');
    } else if (providerId.contains('SBOSport')) {
      webview.webViewController.runJavaScript('''
         window.addEventListener('message', receiveMessage, false);
 
         function receiveMessage(event) {
           if (event.data.type === 'click') {
             GoGamingWebBridge.postMessage('reLogin');
           }
         }
        ''');
    }
  }

  void onPressExit() {
    Get.back<dynamic>();
  }

  void viewDisappear() {
    appBarController.leaveGame();
  }
}
