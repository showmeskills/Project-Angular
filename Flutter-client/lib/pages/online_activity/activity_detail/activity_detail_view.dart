import 'package:base_framework/base_framework.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';
import 'package:gogaming_app/pages/base/base_view.dart';

import '../../../R.dart';
import '../../../common/widgets/appbar/appbar.dart';
import '../../../common/widgets/webview/base_webview.dart';
import 'activity_detail_logic.dart';

class ActivityDetailPage extends BaseView<ActivityDetailLogic>
    with BaseSingleRenderViewDelegate {
  const ActivityDetailPage({super.key, required this.activitiesNo});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () =>
          ActivityDetailPage.argument(Get.arguments as Map<String, dynamic>),
    );
  }

  final String activitiesNo;

  factory ActivityDetailPage.argument(Map<String, dynamic> arguments) {
    return ActivityDetailPage(
      activitiesNo: arguments['activitiesNo'] as String,
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.userBottomAppbar(
      bottomBackgroundColor: GGColors.popBackground.color,
      leadingIcon: InkWell(
        onTap: () => Get.back<void>(),
        child: Container(
          margin: EdgeInsets.only(left: 16.dp),
          child: Image.asset(
            R.commonRoundBack,
            width: 27.dp,
            height: 27.dp,
            color: GGColors.textMain.color,
          ),
        ),
      ),
    );
  }

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  SingleRenderViewController get renderController => controller.controller;

  @override
  Widget body(BuildContext context) {
    Get.put(ActivityDetailLogic(activitiesNo));
    return SingleRenderView(
      delegate: this,
      controller: controller,
      child: Builder(builder: (context) {
        return BaseWebViewPage(
          windowId: controller.state.windowId.value,
          hideRiskWidget: true,
          appBar: const PreferredSize(
            preferredSize: Size(0, 0),
            child: SizedBox(),
          ),
        );
      }),
    );
  }
}
