import 'dart:async';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_date_range_selector/gaming_date_range_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_date_range_selector/src/gaming_date_range.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/pages/account_activity/common/account_activity_type_enum.dart';
import 'package:gogaming_app/pages/account_activity/common/account_activity_base_logic.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import 'account_activity_logic.dart';
import 'logics/account_activity_operation_logic.dart';
import 'views/login/login_view.dart';
import 'views/operation/operation_view.dart';

part 'common/views/filter_view.dart';
part 'views/_tab_bar.dart';

class AccountActivityPage extends BaseView<AccountActivityLogic> {
  const AccountActivityPage({
    super.key,
  });

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => const AccountActivityPage(),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      title: localized('account_activity_records'),
      centerTitle: true,
      actions: [
        Gaps.empty,
      ],
    );
  }

  @override
  bool ignoreBottomSafeSpacing() {
    return true;
  }

  @override
  Widget endDrawer() {
    return const AccountActivityFilterView<AccountActivityOperationLogic>();
  }

  @override
  Widget body(BuildContext context) {
    Get.put(AccountActivityLogic());
    return SizedBox(
      width: double.infinity,
      // decoration: BoxDecoration(
      //   color: GGColors.popBackground.color,
      //   borderRadius: const BorderRadiusDirectional.only(
      //     topStart: Radius.circular(25),
      //     topEnd: Radius.circular(25),
      //   ),
      // ),
      child: Column(
        children: [
          const _TabBar(),
          Expanded(
            child: TabBarView(
              controller: controller.tabController,
              children: const [
                AccountActivityLoginView(),
                AccountActivityOperationView(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
