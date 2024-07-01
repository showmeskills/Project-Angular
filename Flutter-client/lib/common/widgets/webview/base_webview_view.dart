import 'dart:collection';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/base/go_gaming_service.dart';
import 'package:gogaming_app/common/service/h5_webview_manager.dart';
import 'package:gogaming_app/common/widgets/webview/base_web_view_controller.dart';
import 'package:gogaming_app/widget_header.dart';

import 'web_error_page.dart';

class BaseWebView extends StatelessWidget {
  const BaseWebView({
    super.key,
    required this.controller,
    this.stackWidgets,
    this.injectJavascript,
    this.initialUserScripts = const [],
    this.userAgent,
    this.useDefaultUA = false,
    this.onLoadStart,
    this.onProgressChanged,
    this.onTitleChanged,
    this.onLoadError,
    this.handleNewWindow,
  });

  final BaseWebViewControllerImp controller;
  final String? injectJavascript;
  final List<UserScript> initialUserScripts;
  final String? userAgent;

  /// 是否使用默认的UA 默认false
  final bool useDefaultUA;
  final List<Widget>? stackWidgets;
  final void Function(InAppWebViewController, Uri?)? onLoadStart;
  final void Function(InAppWebViewController, int)? onProgressChanged;
  final void Function(InAppWebViewController, String?)? onTitleChanged;
  final void Function(InAppWebViewController, Uri?, int, String)? onLoadError;
  final Future<bool?> Function(InAppWebViewController controller,
      CreateWindowAction createWindowAction)? handleNewWindow;
  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        _buildWebView(context),
        Positioned.fill(
          child: Obx(() {
            return Visibility(
              visible: controller.showWebErrorPage,
              child: WebErrorPage(
                onReload: controller.reloadErrorPage,
              ),
            );
          }),
        ),
        if (stackWidgets != null)
          ...stackWidgets!.map((e) => Positioned.fill(child: e)).toList(),
      ],
    );
  }

  Widget _buildWebView(BuildContext context) {
    final options = H5WebViewManager.sharedInstance.options.copy();
    if (!useDefaultUA) {
      options.crossPlatform.userAgent =
          userAgent ?? GoGamingService.sharedInstance.userAgent;
    }

    options.crossPlatform.useShouldOverrideUrlLoading =
        controller.windowId == null;

    return InAppWebView(
      initialOptions: options,
      windowId: controller.windowId,
      initialUserScripts: UnmodifiableListView(
        List.from(initialUserScripts)
          ..addAll(H5WebViewUserScript.initializeSDK),
      ),
      onWebViewCreated: (webController) {
        controller.webController = webController;
      },
      onLoadStart: (c, uri) {
        controller.webError(false);
        controller.setProgress(0);
      },
      onProgressChanged: (c, progress) {
        controller.setProgress(progress);
        onProgressChanged?.call(c, progress);
        if (progress >= 100 && injectJavascript?.isNotEmpty == true) {
          Future.delayed(const Duration(seconds: 1), () {
            controller.webController
                .evaluateJavascript(source: injectJavascript!);
          });
        }
      },
      onTitleChanged: onTitleChanged,
      onLoadError: (c, url, code, message) {
        debugPrint('onLoadError url = $url, message = $message, code = $code');
        controller.setProgress(100);
        onLoadError?.call(c, url, code, message);
        controller.onLoadError(url, code, message);
      },
      onConsoleMessage: (c, message) {
        debugPrint('onConsoleMessage message = $message');
      },
      onCreateWindow: handleNewWindow ??
          (c, createWindowAction) async {
            debugPrint(
                'onCreateWindow createWindowAction = $createWindowAction');
            // controller.loadUrl(
            //   urlRequest: createWindowAction.request,
            // );
            Get.toNamed<void>(
              Routes.webview.route,
              arguments: {
                'windowId': createWindowAction.windowId,
                if (!useDefaultUA)
                  'userAgent':
                      userAgent ?? GoGamingService.sharedInstance.userAgent,
              },
              preventDuplicates: false,
            );
            return true;
          },
      onCloseWindow: (c) {
        debugPrint('onCloseWindow');
        if (controller.windowId != null) {
          Get.back<void>();
        }
      },
      androidOnPermissionRequest: (_, __, resources) async {
        return PermissionRequestResponse(
          resources: resources,
          action: PermissionRequestResponseAction.GRANT,
        );
      },
    );
  }
}
