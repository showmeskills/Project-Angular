import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/device/models/gaming_device_history_model.dart';
import 'package:gogaming_app/common/delegate/base_refresh_view_delegate.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_overlay.dart';
import 'package:gogaming_app/common/widgets/gaming_popup.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/helper/time_helper.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import 'device_management_logic.dart';
part 'views/_device_management_item.dart';

class DeviceManagementPage extends BaseView<DeviceManagementLogic>
    with BaseRefreshViewDelegate {
  const DeviceManagementPage({super.key});

  DeviceManagementState get state => controller.state;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => const DeviceManagementPage(),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      title: localized('device_management'),
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(DeviceManagementLogic());
    return Obx(() => RefreshView(
          delegate: this,
          controller: controller,
          child: ListView.builder(
            padding:
                EdgeInsets.symmetric(horizontal: 16.dp).copyWith(top: 16.dp),
            itemBuilder: (context, index) {
              return _DeviceManagementItem(data: state.data.list[index]);
            },
            itemCount: state.data.count,
          ),
        ));
  }

  @override
  RefreshViewController get renderController => controller.controller;
}
