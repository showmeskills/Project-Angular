import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/device/models/gaming_device_log_model.dart';
import 'package:gogaming_app/common/delegate/base_refresh_view_delegate.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/helper/time_helper.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import 'device_management_log_logic.dart';
part 'views/_device_management_log_item.dart';

class DeviceManagementLogPage extends BaseView<DeviceManagementLogLogic>
    with BaseRefreshViewDelegate {
  const DeviceManagementLogPage(
      {super.key, required this.title, required this.id});

  final String title;
  final int id;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => DeviceManagementLogPage.argument(
          Get.arguments as Map<String, dynamic>),
    );
  }

  factory DeviceManagementLogPage.argument(Map<String, dynamic> arguments) {
    return DeviceManagementLogPage(
      title: arguments['title'] as String,
      id: arguments['id'] as int,
    );
  }
  @override
  RefreshViewController get renderController => controller.controller;

  DeviceManagementLogState get state => controller.state;

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      title: localized('device_management'),
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(DeviceManagementLogLogic(id));
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap16,
          Text(
            title,
            style: GGTextStyle(
              fontSize: GGFontSize.smallTitle,
              color: GGColors.textMain.color,
            ),
          ),
          Gaps.vGap8,
          Expanded(
            child: Obx(() => RefreshView(
                  controller: controller,
                  delegate: this,
                  child: ListView.builder(
                    itemBuilder: (context, index) {
                      return _DeviceManagementLogItem(
                          data: state.data.list[index]);
                    },
                    itemCount: state.data.count,
                  ),
                )),
          ),
        ],
      ),
    );
  }
}
