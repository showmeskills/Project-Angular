import 'package:flutter/material.dart';
import 'package:gogaming_app/common/delegate/base_refresh_view_delegate.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/pages/base/top_tips_widget.dart';
import 'package:gogaming_app/pages/dashboard/dashboard_logic.dart';
import 'package:gogaming_app/pages/home/views/home_footer.dart';
import 'package:gogaming_app/widget_header.dart';

import 'views/announcement/announcement.dart';
import 'views/wallet/wallet.dart';
import 'views/device_manage/device_manage.dart';
import 'views/invite.dart';
import 'views/activity/activity.dart';
import 'views/recent_transactions/recent_transactions.dart';
import 'views/safety.dart';
import 'views/user_info.dart';
import 'views/vip_info/vip_info.dart';

class DashboardPage extends StatelessWidget with BaseRefreshViewDelegate {
  const DashboardPage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const DashboardPage(),
    );
  }

  DashboardLogic get logic => Get.find<DashboardLogic>();

  @override
  RefreshViewController get renderController => logic.controller;

  @override
  Widget build(BuildContext context) {
    Get.put(DashboardLogic());
    return Scaffold(
      appBar: GGAppBar.userBottomAppbar(
        title: localized('dashboard'),
      ),
      backgroundColor: GGColors.background.color,
      body: RefreshView(
        controller: logic,
        delegate: this,
        child: SingleChildScrollView(
          child: Column(
            children: [
              const TopTipsWidget(),
              const DashboardUserInfo(),
              Gaps.vGap16,
              const DashboardWallet(),
              Gaps.vGap16,
              const DashboardInvite(),
              Gaps.vGap16,
              const DashboardAnnouncement(),
              Gaps.vGap16,
              const DashboardDeviceManage(),
              Gaps.vGap16,
              const DashboardSafety(),
              Gaps.vGap16,
              const DashboardActivity(),
              Gaps.vGap16,
              const DashboardRecentTransactions(),
              Gaps.vGap16,
              const DashboardVipInfo(),
              Gaps.vGap16,
              const HomeFooter(),
            ],
          ),
        ),
      ),
    );
  }
}
