import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/device/models/gaming_device_history_model.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/helper/time_helper.dart';
import 'package:gogaming_app/pages/dashboard/logics/device_logic.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../delegate/dashboard_render_view_delegate.dart';
import '../module_title.dart';
part '_device_manage_item.dart';

class DashboardDeviceManage extends StatelessWidget
    with BaseSingleRenderViewDelegate, DashboardRenderViewDelegate {
  const DashboardDeviceManage({super.key});
  @override
  SingleRenderViewController get renderController => logic.controller;
  DashboardDeviceLogic get logic => Get.find<DashboardDeviceLogic>();
  DashboardDeviceState get state => logic.state;

  @override
  Widget build(BuildContext context) {
    return DashboardModuleContainer(
      child: Column(
        children: [
          DashboardModuleTitle(
            title: localized('device_management'),
            subTitle: localized('dis_dev'),
            hasDivider: true,
            onPressed: () {
              Get.toNamed<void>(Routes.deviceManagement.route);
            },
          ),
          SingleRenderView(
            controller: logic,
            delegate: this,
            child: Obx(() => Column(
                  children: List.generate(
                    state.data.count,
                    (index) {
                      return _DeviceManageItem(
                        data: state.data.list[index],
                        hasDivider: index != state.data.count - 1,
                      );
                    },
                  ),
                )),
          ),
        ],
      ),
    );
  }
}
