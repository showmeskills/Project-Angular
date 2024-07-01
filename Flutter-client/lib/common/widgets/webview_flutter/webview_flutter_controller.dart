import 'dart:io';

import 'package:base_framework/base_framework.dart';
import 'package:flutter/foundation.dart';
import 'package:gogaming_app/common/service/game_webview_manager.dart';
import 'package:gogaming_app/common/service/x5_core_service.dart';

class WebViewFlutterController extends GetxController {
  WebViewFlutterController({
    required this.webController,
    String? title,
    this.userAgent,
    this.pageFinishedCallBack,
  }) {
    setTitle(title);
  }

  @override
  void onInit() {
    super.onInit();
    // 全局设置一次UA无效 必须每次都设置
    // webController.setUserAgent(GoGamingService.sharedInstance.userAgent);
    // UA设置不对导致https://gbd730.atlassian.net/browse/YM2021-2899
    // webController.setUserAgent(ThirdGameWebViewManger().ua);
    if (userAgent != null) {
      webController.setUserAgent(userAgent);
    }
    webController.setNavigationDelegate(NavigationDelegate(
      onNavigationRequest: (request) async {
        final uri = Uri.tryParse(request.url);
        if (uri?.host.isNotEmpty == true) {
          if (ThirdGameWebViewManger.sharedInstance.domain
                  .contains(uri!.host) &&
              !uri.path.contains('thirdpartygame')) {
            Get.back<dynamic>();
            return NavigationDecision.prevent;
          }
        } else {
          if (kReleaseMode) {
            if (RegExp(r'debugx5\.qq\.com|debugtbs\.qq\.com')
                .hasMatch(request.url)) {
              return NavigationDecision.prevent;
            }
          }
        }
        return NavigationDecision.navigate;
      },
      onProgress: (int progress) {
        setProgress(progress);
      },
      onPageStarted: (String url) {
        showLoading.value = true;
        webError.value = false;
        setProgress(0);
      },
      onWebResourceError: (error) {
        // webError.value = true;
        setProgress(100);
        // 过滤无意义的错误
        if (error.isForMainFrame == true &&
            (error.errorType == WebResourceErrorType.connect ||
                error.errorType == WebResourceErrorType.timeout)) {
          webController.currentUrl().then((value) {
            if (value != 'about:blank') {
              WebViewError customError = WebViewError(
                url: value,
                code: error.errorCode,
                message: error.description,
              );

              // 安卓记录x5内核加载情况
              if (Platform.isAndroid) {
                final version = X5CoreService.sharedInstance.version;
                customError = WebViewError.x5(
                  url: value,
                  code: error.errorCode,
                  message: error.description,
                  sdkVersion: version.sdkVersion,
                  coreVersion: version.coreVersion,
                  isX5Core: version.isX5Core,
                );
              }

              Sentry.captureException(customError);
            }
          });
        }
      },
      onPageFinished: (String url) {
        setProgress(100);
        pageFinishedCallBack?.call();
        if (url != 'about:blank') {
          showLoading.value = false;
        }
        webController.runJavaScript('''
          window.onhashchange = function() {
            console.log('onhashchange');
            window.location.reload();
          };
        ''');
      },
    ));
  }

  void readJS() async {
    final html = await webController.runJavaScriptReturningResult(
        "window.document.getElementsByTagName('html')[0].outerHTML;");
    debugPrint('html:$html');
  }

  final WebViewController webController;

  final String? userAgent;

  final _title = ''.obs;
  String get title => _title.value;

  void setTitle(String? title) {
    _title.value = title ?? '';
  }

  final progress = 0.obs;
  final progressAnimateFinish = false.obs;

  final void Function()? pageFinishedCallBack;

  /// 是否显示加载进度条
  final showProgress = true.obs;

  /// 是否显示加载占位图，因销毁也会触发finish，所以需要一个标识位
  final showLoading = true.obs;

  void setProgress(int value) {
    assert(value >= 0 && value <= 100);
    progress.value = value;
    progressAnimateFinish.value = value < 100;
  }

  final webError = false.obs;
  bool get showWebErrorPage => webError.value;

  void goBack() async {
    if (await webController.canGoBack()) {
      webController.goBack();
    } else {
      Get.back<void>();
    }
  }

  void reloadErrorPage() {
    webController.reload();
  }
}
