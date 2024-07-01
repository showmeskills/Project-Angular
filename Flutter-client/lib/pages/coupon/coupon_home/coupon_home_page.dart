import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../R.dart';
import '../../../common/widgets/appbar/appbar.dart';
import 'coupon_home_logic.dart';
import 'coupon_list/view.dart';
import 'none_sticky/view.dart';

class CouponHomePage extends BaseView<CouponHomeLogic> {
  const CouponHomePage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => const CouponHomePage(),
    );
  }

  CouponHomeLogic get logic => Get.put(CouponHomeLogic());

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.userBottomAppbar(
      title: localized('bonus_center'),
      trailingWidgets: [
        GamingImage.asset(
          R.accountIdentityVerification,
          height: 36.dp,
        ),
        Gaps.hGap18,
      ],
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(CouponHomeLogic());
    return Column(
      children: [
        SizedBox(
          width: double.infinity,
          child: _buildTabBar(),
        ),
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              color: GGColors.moduleBackground.color,
              borderRadius: BorderRadius.vertical(
                top: Radius.circular(16.dp),
              ),
            ),
            child: _buildTabBarView(),
          ),
        ),
      ],
    );
  }

  Widget _buildTabBarView() {
    return Container(
      padding: EdgeInsets.only(left: 16.dp, right: 16.dp),
      child: TabBarView(
        controller: controller.tabController,
        children: [
          KeepAliveWrapper(
            child: NoneStickyComponent(),
          ),
          KeepAliveWrapper(
            child: CouponListComponent(),
          ),
        ],
      ),
    );
  }

  Widget _buildTabBar() {
    return TabBar(
      controller: controller.tabController,
      indicatorWeight: 4.dp,
      indicatorColor: GGColors.highlightButton.color,
      indicatorSize: TabBarIndicatorSize.label,
      indicatorPadding: EdgeInsets.zero,
      unselectedLabelStyle: TextStyle(
        fontSize: GGFontSize.content.fontSize,
      ),
      unselectedLabelColor: GGColors.textSecond.color,
      labelStyle: TextStyle(
        fontSize: GGFontSize.content.fontSize,
      ),
      labelColor: GGColors.textMain.color,
      tabs: [
        _buildTabItem(localized('cashable_bonus')),
        _buildTabItem(localized('coupon_center')),
      ],
    );
  }

  Widget _buildTabItem(String title) {
    return Container(
      margin: EdgeInsets.only(bottom: 3.dp, top: 7.dp),
      child: Text(title),
    );
  }
}
