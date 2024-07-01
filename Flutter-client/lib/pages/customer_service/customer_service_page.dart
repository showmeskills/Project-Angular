// import 'package:base_framework/base_controller.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/service/game_webview_manager.dart';
import 'package:gogaming_app/common/widgets/webview/base_webview.dart';
import 'package:gogaming_app/router/customer_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import 'customer_service_logic.dart';

class CustomerServicePage extends StatelessWidget {
  const CustomerServicePage({Key? key}) : super(key: key);

  CustomerServiceLogic get controller => Get.find<CustomerServiceLogic>();

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      fullscreenDialog: true,
      page: () => const CustomerServicePage(),
    );
  }

  @override
  Widget build(BuildContext context) {
    Get.put(CustomerServiceLogic());

    return Obx(() {
      final comm100Url = controller.comm100Url.value;
      if (comm100Url.isEmpty) {
        return const SizedBox();
      } else {
        return BaseWebViewPage(
          title: localized('online_cs'),
          link: comm100Url,
          injectJavascript: controller.chatLiveJS(),
          handleNewWindow: controller.handleNewWindow,
          resizeToAvoidBottomInset: true,
          // useDefaultUA: true,
          userAgent: GameWebViewManagerImpl.defaultUA,
        );
      }
    });
  }
}
