import 'package:base_framework/base_framework.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/webview/base_web_view_controller.dart';
import 'package:gogaming_app/common/widgets/webview/base_webview.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';

class WebViewPage extends StatelessWidget {
  const WebViewPage({
    super.key,
    this.link,
    this.htmlString,
    this.windowId,
    this.title,
    this.userAgent,
    this.hasGoBack,
    this.localHtml,
    this.injectJavascript,
    this.backMode = WebViewBackMode.backAndExit,
  });

  final String? link;
  final String? htmlString;
  final int? windowId;
  final String? title;
  final String? userAgent;
  final bool? hasGoBack;
  final String? localHtml;
  final String? injectJavascript;
  final WebViewBackMode backMode;

  static GetPage<dynamic> needLoginPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => WebViewPage.argument(Get.arguments as Map<String, dynamic>),
    );
  }

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => WebViewPage.argument(Get.arguments as Map<String, dynamic>),
    );
  }

  factory WebViewPage.argument(Map<String, dynamic> arguments) {
    final link = arguments['link'] as String?;
    final localHtml = arguments['localHtml'] as String?;
    final htmlString = arguments['htmlString'] as String?;
    final windowId = arguments['windowId'] as int?;
    final title = arguments['title'] as String?;
    final userAgent = arguments['userAgent'] as String?;
    final injectJavascript = arguments['injectJavascript'] as String?;
    final backMode = arguments['backMode'] as WebViewBackMode? ??
        WebViewBackMode.backAndExit;
    assert(
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
    return WebViewPage(
      link: link,
      localHtml: localHtml,
      htmlString: htmlString,
      windowId: windowId,
      title: title,
      userAgent: userAgent,
      injectJavascript: injectJavascript,
      backMode: backMode,
    );
  }

  @override
  Widget build(BuildContext context) {
    return BaseWebViewPage(
      link: link,
      htmlString: htmlString,
      localHtml: localHtml,
      windowId: windowId,
      title: title,
      userAgent: userAgent,
      backMode: backMode,
      injectJavascript: injectJavascript,
    );
  }
}
