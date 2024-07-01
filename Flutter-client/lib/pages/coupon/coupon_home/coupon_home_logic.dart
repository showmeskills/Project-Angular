import 'package:flutter/material.dart';
import 'package:gogaming_app/controller_header.dart';

import 'coupon_home_state.dart';

class CouponHomeLogic extends BaseController
    with GetSingleTickerProviderStateMixin {
  final CouponHomeState state = CouponHomeState();
  late TabController tabController;

  @override
  void onInit() {
    super.onInit();

    tabController = TabController(length: 2, vsync: this, initialIndex: 0);
    tabController.addListener(_handleTabSelection);
  }

  void _handleTabSelection() {
    state.tabIndex.value = tabController.index;
  }

  @override
  void onClose() {
    super.onClose();
    tabController.removeListener(_handleTabSelection);
  }
}
