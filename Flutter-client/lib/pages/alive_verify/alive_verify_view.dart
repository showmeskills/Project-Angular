import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/go_gaming_loading.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import '../../common/api/base/base_api.dart';
import '../../common/lang/locale_lang.dart';
import '../../common/widgets/appbar/appbar.dart';
import '../../common/widgets/gaming_close_button.dart';
import '../../common/widgets/webview/base_webview.dart';
import '../base/base_view.dart';
import 'alive_verify_logic.dart';

class AliveVerifyPage extends BaseView<AliveVerifyLogic> {
  const AliveVerifyPage({super.key});

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      title: localized('alive_verify'),
      leadingIcon: const GamingCloseButton(),
    );
  }

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => const AliveVerifyPage(),
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(AliveVerifyLogic());
    return Obx(() {
      if (controller.redirectUrl.isEmpty) {
        return const Center(
          child: GoGamingLoading(),
        );
      } else {
        return BaseWebViewPage(
          link: controller.redirectUrl.value,
          hideRiskWidget: true,
          appBar: const PreferredSize(
            preferredSize: Size(0, 0),
            child: SizedBox(),
          ),
        );
      }
    });
  }
}
