import 'package:base_framework/base_controller.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/webview/base_webview.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:visibility_detector/visibility_detector.dart';

import '../../../common/service/account_service.dart';
import 'original_web_game_logic.dart';

class OriginalWebGamePage extends StatelessWidget {
  const OriginalWebGamePage({Key? key, required this.windowId})
      : super(key: key);
  final int windowId;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => OriginalWebGamePage.argument(
          Get.arguments as Map<String, dynamic>? ?? {}),
    );
  }

  factory OriginalWebGamePage.argument(Map<String, dynamic> arguments) {
    final windowId = arguments['windowId'] as int;
    return OriginalWebGamePage(
      windowId: windowId,
    );
  }

  OriginalWebGameLogic? get controller =>
      Get.findOrNull<OriginalWebGameLogic>(tag: tag);

  String get tag => windowId.toString();

  @override
  Widget build(BuildContext context) {
    Get.put(OriginalWebGameLogic(windowId), tag: tag);
    return VisibilityDetector(
      key: const Key('OriginalWebGameLogic'),
      onVisibilityChanged: (visibilityInfo) {
        if (visibilityInfo.visibleFraction == 0) {
          controller?.tempUpdateBalanceLock =
              AccountService.sharedInstance.updateBalanceLock;
          AccountService.sharedInstance.updateBalanceLock = false;
        } else {
          //还原加锁
          AccountService.sharedInstance.updateBalanceLock =
              controller?.tempUpdateBalanceLock ?? false;
        }
      },
      child: BaseWebViewPage(
        windowId: windowId,
        appBar: GGAppBar.userAppbar(),
      ),
    );
  }
}
