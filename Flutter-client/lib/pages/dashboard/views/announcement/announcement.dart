import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/announcement/models/gaming_announcement_model.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/common/service/h5_webview_manager.dart';
import 'package:gogaming_app/common/service/web_url_service/web_url_model.dart';
import 'package:gogaming_app/helper/time_helper.dart';
import 'package:gogaming_app/pages/dashboard/delegate/dashboard_render_view_delegate.dart';
import 'package:gogaming_app/pages/dashboard/logics/announcement_logic.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../../common/service/web_url_service/web_url_service.dart';
import '../module_title.dart';
part '_announcement_item.dart';

class DashboardAnnouncement extends StatelessWidget
    with BaseSingleRenderViewDelegate, DashboardRenderViewDelegate {
  const DashboardAnnouncement({super.key});
  @override
  SingleRenderViewController get renderController => logic.controller;
  DashboardAnnouncementLogic get logic =>
      Get.find<DashboardAnnouncementLogic>();
  DashboardAnnouncementState get state => logic.state;

  String get webUrl {
    String str = WebUrlService.url(WebUrl.announcement.toTarget());
    return str;
  }

  @override
  Widget build(BuildContext context) {
    return DashboardModuleContainer(
      child: Column(
        children: [
          DashboardModuleTitle(
            title: localized('announcements'),
            hasDivider: true,
            onPressed: () {
              H5WebViewManager.sharedInstance.openWebView(
                url: webUrl,
                title: localized('announcements'),
              );
            },
          ),
          SingleRenderView(
            controller: logic,
            delegate: this,
            child: Obx(
              () => Column(
                children: List.generate(
                  state.data.length,
                  (index) {
                    return _AnnouncementItem(
                      data: state.data[index],
                      hasDivider: index != state.data.length - 1,
                    );
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
