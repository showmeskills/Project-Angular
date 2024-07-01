// ignore_for_file: unused_field

import 'dart:collection';

import 'package:base_framework/base_framework.dart';
import 'package:flutter/foundation.dart';
import 'package:gogaming_app/common/api/base/go_gaming_service.dart';
import 'package:gogaming_app/common/service/web_url_service/web_url_service.dart';
import 'package:gogaming_app/common/widgets/webview/base_web_view_controller.dart';
import 'package:gogaming_app/router/app_pages.dart';

/// ios UserScript 无法和windowid同时使用，放在父窗口进行初始化
class H5WebViewUserScript {
  static List<UserScript> initializeSDK = [
    UserScript(
      source: '''
window.WebViewSDK = (function () {
  function _callHandler(method, args) {
    return window.flutter_inappwebview.callHandler(method, args);
  }

  return {
    actionApp: function(args) {
      return _callHandler('actionApp', args);
    },
  };
})();
window.addEventListener("flutterInAppWebViewPlatformReady", function(event) {
  window.dispatchEvent(new Event('WebViewSDKReady'));
});
''',
      injectionTime: UserScriptInjectionTime.AT_DOCUMENT_START,
    ),
    UserScript(
      source: _disableFullScreenJS,
      injectionTime: UserScriptInjectionTime.AT_DOCUMENT_START,
    ),
  ];

  static const String _disableFullScreenJS = '''
Object.defineProperty(document, 'requestFullscreen', {
  value: () => {}
});
Object.defineProperty(document, 'mozRequestFullScreen', {
  value: () => {}
});
Object.defineProperty(document, 'webkitRequestFullscreen', {
  value: () => {}
});
Object.defineProperty(document, 'msRequestFullscreen', {
  value: () => {}
});

Object.defineProperty(Element.prototype, 'requestFullscreen', {
  value: () => {}
});
Object.defineProperty(Element.prototype, 'mozRequestFullScreen', {
  value: () => {}
});
Object.defineProperty(Element.prototype, 'webkitRequestFullscreen', {
  value: () => {}
});
Object.defineProperty(Element.prototype, 'msRequestFullscreen', {
  value: () => {}
});

Object.defineProperty(document, 'fullscreenEnabled', {
  value: false
});
Object.defineProperty(document, 'mozFullScreenEnabled', {
  value: false
});
Object.defineProperty(document, 'webkitFullscreenEnabled', {
  value: false
});
Object.defineProperty(document, 'msFullscreenEnabled', {
  value: false
});

Object.defineProperty(document, 'fullscreen', {
  value: true
});
Object.defineProperty(document, 'mozFullScreen', {
  value: true
});
Object.defineProperty(document, 'webkitFullscreen', {
  value: true
});
Object.defineProperty(document, 'msFullscreen', {
  value: true
});

Object.defineProperty(Element.prototype, 'fullscreenEnabled', {
  value: false
});
Object.defineProperty(Element.prototype, 'mozFullScreenEnabled', {
  value: false
});
Object.defineProperty(Element.prototype, 'webkitFullscreenEnabled', {
  value: false
});
Object.defineProperty(Element.prototype, 'msFullscreenEnabled', {
  value: false
});


Object.defineProperty(Element.prototype, 'fullscreen', {
  value: true
});
Object.defineProperty(Element.prototype, 'mozFullScreen', {
  value: true
});
Object.defineProperty(Element.prototype, 'webkitFullscreen', {
  value: true
});
Object.defineProperty(Element.prototype, 'msFullscreen', {
  value: true
});
''';
}

class H5WebViewManager {
  factory H5WebViewManager() => _getInstance();

  static H5WebViewManager get sharedInstance => _getInstance();

  static H5WebViewManager? _instance;

  static H5WebViewManager _getInstance() {
    _instance ??= H5WebViewManager._internal();
    return _instance!;
  }

  H5WebViewManager._internal();

  bool _loaded = false;
  String? _url;
  String? _title;
  bool _isOriginalWebGame = false;
  bool _replace = false;
  WebViewBackMode _backMode = WebViewBackMode.backAndExit;
  void Function(int windowId)? _openWindowCallback;

  final options = InAppWebViewGroupOptions(
    crossPlatform: InAppWebViewOptions(
      userAgent: GoGamingService.sharedInstance.userAgent,
      // useShouldOverrideUrlLoading = true会导致无法触发onCloseWindow
      useShouldOverrideUrlLoading: false,
      mediaPlaybackRequiresUserGesture: false,
      transparentBackground: true,
      javaScriptCanOpenWindowsAutomatically: true,
    ),
    android: AndroidInAppWebViewOptions(
      useHybridComposition: true,
      domStorageEnabled: true,
      databaseEnabled: true,
      // thirdPartyCookiesEnabled: true,
      supportMultipleWindows: true,
    ),
    ios: IOSInAppWebViewOptions(
      allowsInlineMediaPlayback: true,
      sharedCookiesEnabled: true,
    ),
  );

  final String _closeWheelShown =
      "window.localStorage.setItem('storage.platform.wheelShown', true);";

  final String _loadedScript = 'window.removeAllListeners();';

  late final UnmodifiableListView<UserScript> _initialUserScripts =
      UnmodifiableListView(
    [
      ...H5WebViewUserScript.initializeSDK,
      UserScript(
        source: _closeWheelShown,
        injectionTime: UserScriptInjectionTime.AT_DOCUMENT_START,
      ),
      UserScript(
        source: _loadedScript,
        injectionTime: UserScriptInjectionTime.AT_DOCUMENT_END,
      ),
    ],
  );

  HeadlessInAppWebView? webview;

  Future<void> openOriginalWebGame({
    required String url,
  }) {
    return openWebView(url: url, isOriginalWebGame: true);
  }

  Future<void> openWebView({
    required String url,
    String? title,
    bool isOriginalWebGame = false,
    bool replace = false,
    WebViewBackMode backMode = WebViewBackMode.backAndExit,
    void Function(int windowId)? openWindowCallback,
  }) async {
    _url = url;
    _title = title;
    _isOriginalWebGame = isOriginalWebGame;
    _replace = replace;
    _backMode = backMode;
    _openWindowCallback = openWindowCallback ?? _openWindow;

    return webview!.webViewController.evaluateJavascript(
      source: "window.open('$url', '_blank')",
    );
  }

  Future<void> _removeAllListeners() async {
    await webview!.webViewController.evaluateJavascript(
      source: _loadedScript,
    );
  }

  void _openWindow(int windowId) {
    late String route;
    final arguments = {
      'windowId': windowId,
      'backMode': _backMode,
    };
    if (_isOriginalWebGame) {
      route = Routes.originalWebGame.route;
    } else {
      route = Routes.webview.route;
    }

    if (_replace) {
      Get.offAndToNamed<void>(
        route,
        arguments: arguments,
      );
    } else {
      Get.toNamed<void>(
        route,
        arguments: arguments,
        preventDuplicates: false,
      );
    }
  }

  void _reset() {
    _url = null;
    _title = null;
    _isOriginalWebGame = false;
    _replace = false;
    _backMode = WebViewBackMode.backAndExit;
    _loaded = false;
  }

  void dispose() {
    webview?.dispose();
    webview = null;
    _reset();
  }

  Future<void> init() async {
    webview ??= HeadlessInAppWebView(
      // initialUrlRequest: URLRequest(url: WebUri(WebUrlService.url2('', false))),
      initialOptions: options,
      initialUserScripts: _initialUserScripts,
      onCreateWindow: (controller, createWindowAction) async {
        await _removeAllListeners();
        _openWindowCallback!(createWindowAction.windowId);
        return true;
      },
      onConsoleMessage: (c, message) {
        debugPrint('onConsoleMessage message = $message');
      },
      onLoadStop: (controller, url) {
        if (!_loaded) {
          _loaded = true;
        }
      },
      onProgressChanged: (controller, progress) {
        debugPrint('onProgressChanged progress = $progress');
      },
    );

    await webview!.run();
    _reset();
    await webview!.webViewController.clearCache();
    webview!.webViewController.loadUrl(
        urlRequest: URLRequest(url: Uri.parse(WebUrlService.url2('', false))));
  }
}
