// ignore_for_file: depend_on_referenced_packages

import 'dart:async';
import 'dart:developer';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/service/restart_service.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/helper/device_util.dart';
import 'package:gogaming_app/widget_header.dart';
// Import for Android features.
import 'package:webview_flutter_android/webview_flutter_android.dart';
// Import for iOS features.
import 'package:webview_flutter_wkwebview/webview_flutter_wkwebview.dart';

import 'event_service.dart';
import 'x5_core_service.dart';

// class WebViewManager {
//   factory WebViewManager() => _getInstance();

//   static WebViewManager get sharedInstance => _getInstance();

//   static WebViewManager? _instance;

//   static WebViewManager _getInstance() {
//     _instance ??= WebViewManager._internal();
//     return _instance!;
//   }

//   WebViewManager._internal();

//   String? _url;
//   String? _title;
//   bool _isOriginalWebGame = false;

//   late HeadlessInAppWebView webview = HeadlessInAppWebView(
//     // initialUrlRequest: URLRequest(url: WebUri(WebUrlService.url2('', false))),
//     initialOptions: InAppWebViewGroupOptions(
//       crossPlatform: InAppWebViewOptions(
//         // userAgent: GoGamingService.sharedInstance.userAgent,
//         mediaPlaybackRequiresUserGesture: false,
//         transparentBackground: true,
//         javaScriptCanOpenWindowsAutomatically: true,
//       ),
//       android: AndroidInAppWebViewOptions(
//         // useHybridComposition: true,
//         domStorageEnabled: false,
//         databaseEnabled: false,
//         safeBrowsingEnabled: true,
//         // thirdPartyCookiesEnabled: true,
//         supportMultipleWindows: true,
//       ),
//       ios: IOSInAppWebViewOptions(
//         allowsInlineMediaPlayback: false,
//         sharedCookiesEnabled: false,
//       ),
//     ),
//     onCreateWindow: (controller, createWindowAction) async {
//       _openWindow(createWindowAction.windowId);
//       return true;
//     },
//     onConsoleMessage: (c, message) {
//       debugPrint('onConsoleMessage message = $message');
//     },
//   );

//   void _openWindow(int windowId) {
//     if (_isOriginalWebGame) {
//       Get.toNamed<void>(
//         Routes.originalWebGame.route,
//         arguments: {
//           'windowId': windowId,
//           'gameLink': _url,
//         },
//       );
//     } else {
//       Get.toNamed<void>(Routes.webview.route, arguments: {
//         'windowId': windowId,
//         'title': _title,
//       });
//     }
//   }

//   Future<void> init() async {
//     if (!webview.isRunning()) {
//       await webview.run();
//     } else {
//       await webview.webViewController.stopLoading();
//     }
//     await webview.webViewController.clearCache();
//     webview.webViewController.loadUrl(
//       urlRequest: URLRequest(
//           url: Uri.parse(
//         '${WebUrlService.baseUrl}/${GoGamingService.sharedInstance.apiLang}',
//       )),
//     );
//   }

//   Future<void> loadUrl({
//     required String url,
//     String? title,
//     bool isOriginalWebGame = false,
//   }) async {
//     if (!webview.isRunning()) {
//       await webview.run();
//     }
//     _url = url;
//     _title = title;
//     _isOriginalWebGame = isOriginalWebGame;

//     return webview.webViewController.evaluateJavascript(
//       source: "window.open('$url', '_blank')",
//     );
//   }
// }
/// 第三方游戏真钱预加载webviw
class ThirdGameWebViewManger extends GameWebViewManagerImpl {
  factory ThirdGameWebViewManger() => _getInstance();

  static ThirdGameWebViewManger get sharedInstance => _getInstance();

  static ThirdGameWebViewManger? _instance;

  static ThirdGameWebViewManger _getInstance() {
    _instance ??= ThirdGameWebViewManger._internal();
    return _instance!;
  }

  ThirdGameWebViewManger._internal() : super();
}

/// 第三方游戏试玩预加载webviw
// class ThirdGameTryWebViewManger extends GameWebViewManagerImpl {
//   factory ThirdGameTryWebViewManger() => _getInstance();

//   static ThirdGameTryWebViewManger get sharedInstance => _getInstance();

//   static ThirdGameTryWebViewManger? _instance;

//   static ThirdGameTryWebViewManger _getInstance() {
//     _instance ??= ThirdGameTryWebViewManger._internal();
//     return _instance!;
//   }

//   ThirdGameTryWebViewManger._internal() : super();
// }

abstract class GameWebViewManagerImpl extends RestartServiceInterface {
  GameWebViewManagerImpl() {
    X5CoreService.sharedInstance.init().then((value) {
      init();
      X5CoreService.sharedInstance.submitInitEvent(value);
    }, onError: (_) {
      init();
      X5CoreService.sharedInstance.submitInitEvent(false);
    });
  }

  late WebViewController webViewController = () {
    late final PlatformWebViewControllerCreationParams params;
    if (WebViewPlatform.instance is WebKitWebViewPlatform) {
      // fixWU14655没有允许网页内部播放视频，导致默认全屏播放视频，无法正常交互
      params = WebKitWebViewControllerCreationParams(
        allowsInlineMediaPlayback: true,
        mediaTypesRequiringUserAction: const <PlaybackMediaTypes>{},
      );
    } else {
      params = const PlatformWebViewControllerCreationParams();
    }

    final WebViewController controller =
        WebViewController.fromPlatformCreationParams(params);
    if (controller.platform is AndroidWebViewController) {
      AndroidWebViewController.enableDebugging(kDebugMode);
      (controller.platform as AndroidWebViewController)
          .setMediaPlaybackRequiresUserGesture(false);
    } else if (controller.platform is WebKitWebViewController) {
      (controller.platform as WebKitWebViewController)
          .setInspectable(true);
    }
    controller.addJavaScriptChannel('GoGamingWebBridge',
        onMessageReceived: (message) {
      GamingEvent.webBridgeTrigger.notify(data: {'message': message.message});
    });
    return controller;
  }();

  Future<void> init() async {
    await webViewController.setJavaScriptMode(JavaScriptMode.unrestricted);
    await webViewController.setBackgroundColor(Colors.transparent);
    await webViewController.setNavigationDelegate(NavigationDelegate(
      onNavigationRequest: (request) async {
        return NavigationDecision.navigate;
      },
      onProgress: (int progress) {
        log('$progress', name: 'loadUrl');
      },
      onPageStarted: (String url) {
        log('onPageStarted', name: 'loadUrl');
      },
      onPageFinished: (String url) {
        log('onPageFinished', name: 'loadUrl');
      },
    ));
  }

  String get domain => Config.currentConfig.apiUrl;

  /// 用于网站需要完整UA的场景
  static String defaultUA =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";

  String? getUserAgent({
    String? providerId,
  }) {
    if (providerId == 'SaBaSport-1' && X5CoreService.sharedInstance.isX5Core) {
      // 修复腾讯x5内核无法进入沙巴体育
      return 'Mozilla/5.0 (Linux; ${DeviceUtil.systemVersion ?? 'Android 10'}; ${DeviceUtil.deviceName ?? 'gphone64_arm64'}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Mobile Safari/537.36';
    }
    return null;
  }

  String? _url;
  String get url => _url ?? '';

  Future<void> loadUrl({
    required String url,
  }) async {
    log(url, name: 'loadUrl');
    if (_url != url) {
      _url = url;
    }
    webViewController.loadRequest(Uri.parse(url.trim()));
  }

  Future<void> dispose([bool reInit = true]) async {
    if (reInit) {
      await init();
    }
    _url = null;
    await webViewController.loadHtmlString('''
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=3, initial-scale=1.0">
  <title>$runtimeType preload</title>
</head>
<body>
</body>
</html>
''');
  }

  @override
  void onClose() {
    dispose();
  }
}
