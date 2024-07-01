import 'dart:ui';

import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/bonus/models/gaming_coupon_model/gaming_coupon_model.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_close_button.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/coupon/coupon_home/coupon_home_logic.dart';
import 'package:gogaming_app/pages/coupon/coupon_home/views/coupon_home_list_item.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import '../coupon_home/coupon_list/logic.dart';
import 'coupon_sort_logic.dart';

part 'views/_sort_item_view.dart';

enum DraggingMode {
  iOS,
  android,
}

class CouponSortPage extends BaseView<CouponSortLogic>
    with BaseSingleRenderViewDelegate {
  const CouponSortPage({super.key});

  CouponSortState get state => controller.state;

  CouponListLogic get homeLogic => Get.find<CouponListLogic>();

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => const CouponSortPage(),
    );
  }

  @override
  String get emptyText => localized('no_coupons_yet');

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      leadingIcon: Gaps.empty,
      leadingWidth: 16.dp,
      title: localized('order_tips_txt'),
      centerTitle: false,
      actions: [
        GamingCloseButton(
          padding: EdgeInsets.symmetric(vertical: 12.dp, horizontal: 16.dp),
        ),
      ],
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(CouponSortLogic());
    return Column(
      children: [
        Container(
          padding:
              EdgeInsets.symmetric(horizontal: 16.dp).copyWith(bottom: 20.dp),
          alignment: Alignment.centerLeft,
          child: Text(
            localized('order_tips'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            ),
          ),
        ),
        Expanded(
          child: SingleRenderView(
            controller: controller,
            delegate: this,
            child: Obx(() {
              return ReorderableListView(
                padding: EdgeInsets.symmetric(horizontal: 16.dp),
                buildDefaultDragHandles: false,
                onReorder: controller.onReorder,
                proxyDecorator: (child, index, animation) {
                  final e = state.data.list[index];
                  return Container(
                    margin: EdgeInsets.only(bottom: 20.dp),
                    child: AnimatedBuilder(
                      animation: animation,
                      builder: (BuildContext context, Widget? child) {
                        final double animValue =
                            Curves.easeInOut.transform(animation.value);
                        final double elevation = lerpDouble(0, 6, animValue)!;
                        final double scale = lerpDouble(1, 1.02, animValue)!;
                        return Transform.scale(
                          scale: scale,
                          child: Material(
                            elevation: elevation,
                            shadowColor: const Color.fromRGBO(0, 0, 0, 1),
                            child: child,
                          ),
                        );
                      },
                      child: _SortItemView(
                        key: e.sortKey,
                        data: e,
                        index: index,
                        couponStatusList: homeLogic.state.couponSelectType,
                        hideMargin: true,
                      ),
                    ),
                  );
                },
                children: List.generate(state.data.list.length, (index) {
                  final e = state.data.list[index];
                  return _SortItemView(
                    key: e.sortKey,
                    data: e,
                    index: index,
                    couponStatusList: homeLogic.state.couponSelectType,
                  );
                }),
              );
            }),
          ),
        ),
        SafeArea(
          minimum: EdgeInsets.only(bottom: 16.dp),
          child: Container(
            width: double.infinity,
            padding: EdgeInsets.symmetric(horizontal: 16.dp),
            child: Obx(() {
              return GGButton.main(
                onPressed: controller.submit,
                isLoading: state.isLoading,
                enable: state.enable,
                text: localized('confirm_order'),
              );
            }),
          ),
        ),
      ],
    );
  }

  @override
  SingleRenderViewController get renderController => controller.controller;
}
