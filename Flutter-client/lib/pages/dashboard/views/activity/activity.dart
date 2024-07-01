import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/bonus/models/gaming_activity_model/gaming_activity_model.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/helper/time_helper.dart';
import 'package:gogaming_app/pages/dashboard/logics/activity_logic.dart';
import 'package:gogaming_app/pages/main/main_logic.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../delegate/dashboard_render_view_delegate.dart';
import '../module_title.dart';
part '_activity_item.dart';

class DashboardActivity extends StatelessWidget
    with BaseSingleRenderViewDelegate, DashboardRenderViewDelegate {
  const DashboardActivity({super.key});
  @override
  SingleRenderViewController get renderController => logic.controller;

  DashboardActivityLogic get logic => Get.find<DashboardActivityLogic>();
  DashboardActivityState get state => logic.state;

  @override
  Widget build(BuildContext context) {
    return DashboardModuleContainer(
      child: Column(
        children: [
          DashboardModuleTitle(
            title: localized('pro'),
            hasDivider: true,
            onPressed: () {
              Get.until((route) => Get.currentRoute == Routes.main.route);
              Get.find<MainLogic>().changeSelectIndex(2);
            },
          ),
          SingleRenderView(
            controller: logic,
            delegate: this,
            child: Obx(() => Column(
                  children: List.generate(
                    state.data.length,
                    (index) {
                      return _ActivityItem(
                        data: state.data[index],
                        hasDivider: index != state.data.length - 1,
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
