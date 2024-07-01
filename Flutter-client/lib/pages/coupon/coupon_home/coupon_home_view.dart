import 'package:base_framework/base_controller.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/common/widgets/go_gaming_loading.dart';
import 'package:gogaming_app/pages/coupon/coupon_home/views/coupon_home_list_item.dart';
import 'package:gogaming_app/router/customer_middle_ware.dart';

import '../../../common/api/bonus/models/gaming_coupon_model/gaming_coupon_model.dart';
import '../../../common/lang/locale_lang.dart';
import '../../../common/service/account_service.dart';
import '../../../common/widgets/go_gaming_empty.dart';
import '../../../config/gaps.dart';
import 'coupon_list/logic.dart';

class CouponHomeView extends StatelessWidget {
  const CouponHomeView({super.key, this.isFullScreen = false});

  final bool isFullScreen;

  CouponListLogic get logic => Get.find<CouponListLogic>();

  Widget _empty() {
    return Container(
      transform:
          Matrix4.translationValues(0, isFullScreen ? -50 : 60.dp / 2, 0),
      child: GoGamingEmpty(
        text: localized("no_coupons_yet"),
      ),
    );
  }

  Widget _loading() {
    return Container(
      transform:
          Matrix4.translationValues(0, isFullScreen ? -50 : 60.dp / 2, 0),
      child: const GoGamingLoading(),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!AccountService.sharedInstance.isLogin) {
      return _empty();
    } else {
      return Obx(() {
        if (logic.state.isLoading.value) {
          return _loading();
        } else if (logic.state.data.value.list.isEmpty) {
          return _empty();
        } else {
          return Column(
            mainAxisSize: MainAxisSize.min,
            children: _buildContentList(),
          );
        }
      });
    }
  }

  List<Widget> _buildContentList() {
    return logic.state.data.value.list.map((element) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          GestureDetector(
            onTap: () {},
            child: GamingCouponHomeListItem(
              data: element,
              couponStatusList: logic.state.couponSelectType,
              onReveice: () => _onReceiveCoupon(element),
              onReject: () => _onRejectCoupon(element),
            ),
          ),
          Gaps.vGap20,
        ],
      );
    }).toList();
  }
}

extension _Action on CouponHomeView {
  void _onReceiveCoupon(GamingCouponModel model) {
    logic.onReceiveCoupon(model, callback: (success) {
      if (success) {
        Toast.showSuccessful(localized("coupon.get_succes"));
      } else {
        Toast.showFailed(localized('coupon.get_fail'));
      }
    });
  }

  void _onRejectCoupon(GamingCouponModel model) {
    DialogUtil(
      title: localized('hint'),
      context: Get.context!,
      content: localized('account_abnormal'),
      rightBtnName: localized("con_cus_ser00"),
      onLeftBtnPressed: () {
        Get.back<void>();
      },
      onRightBtnPressed: () {
        Get.back<void>();
        CustomerServiceRouter().toNamed();
      },
    ).showNoticeDialogWithTwoButtons();
  }
}
