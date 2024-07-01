import 'package:flutter/material.dart';
import 'package:flutter_countdown_timer/countdown_timer_controller.dart';
import 'package:gogaming_app/common/api/deposit/deposit_api.dart';
import 'package:gogaming_app/common/api/deposit/models/currency_deposit/gaming_deposit_virtual_to_currency_model.dart';
import 'package:gogaming_app/common/api/deposit/models/gaming_order_state_info_model.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_utils_mixin.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../../common/tracker/analytics_manager.dart';

enum GamingCurrencyVirtualDepositOrderStatus { handling, success, fail }

class CurrencyDepositVirtualResultConfirmLogic extends BaseController
    with GetTickerProviderStateMixin, DepositCommonUtilsMixin {
  final GamingDepositVirtualToCurrencyModel data;

  CurrencyDepositVirtualResultConfirmLogic({required this.data});

  final _status = GamingCurrencyVirtualDepositOrderStatus.handling.obs;
  GamingCurrencyVirtualDepositOrderStatus get status => _status.value;

  String get statusText {
    switch (status) {
      case GamingCurrencyVirtualDepositOrderStatus.fail:
        return localized('time_expired');
      case GamingCurrencyVirtualDepositOrderStatus.success:
        return localized('pay_succ00');
      default:
        return localized('to_paid');
    }
  }

  Color get statusColor {
    switch (status) {
      case GamingCurrencyVirtualDepositOrderStatus.fail:
        return GGColors.error.color;
      case GamingCurrencyVirtualDepositOrderStatus.success:
        return GGColors.success.color;
      default:
        return GGColors.brand.color;
    }
  }

  late int expireTime = data.expireTime;
  late CountdownTimerController timerController = CountdownTimerController(
    endTime: expireTime,
    onEnd: _onEnd,
    vsync: this,
  );

  @override
  void onInit() {
    super.onInit();
    timerController.addListener(_refresh);
    GamingEvent.onDeposit.subscribe(onDeposit);
  }

  @override
  void onReady() {
    super.onReady();
    Toast.showSuccessful(localized('pay_amou_corre02'));
    _openWebView();
  }

  @override
  void onClose() {
    GamingEvent.onDeposit.unsubscribe(onDeposit);
    timerController.removeListener(_refresh);
    timerController.dispose();
    super.onClose();
  }

  void _openWebView() {
    // if (data.isHtmlOnlineBank) {
    //   if (data.html != null) {
    //     Get.toNamed<void>(
    //       Routes.webview.route,
    //       arguments: {
    //         'htmlString': data.html,
    //         'title': localized('dep_fiat'),
    //       },
    //     );
    //   }
    // } else if (data.isEWallet) {
    //   if (data.redirectUrl != null) {
    //     Get.toNamed<void>(
    //       Routes.webview.route,
    //       arguments: {
    //         'link': data.redirectUrl,
    //         'title': localized('dep_fiat'),
    //       },
    //     );
    //   }
    // }
  }

  void _onEnd() {
    if (status != GamingCurrencyVirtualDepositOrderStatus.handling) return;
    _status.value = GamingCurrencyVirtualDepositOrderStatus.fail;
  }

  void _refresh() {
    if (status != GamingCurrencyVirtualDepositOrderStatus.handling) return;
    expireTime -= 1;
    if (expireTime <= 0 &&
        status != GamingCurrencyVirtualDepositOrderStatus.handling) {
      _status.value = GamingCurrencyVirtualDepositOrderStatus.fail;
    } else if (expireTime % 5 == 0) {
      PGSpi(Deposit.orderStateInfo.toTarget(
        input: {
          'orderId': data.orderId,
        },
      )).rxRequest<GamingOrderStateInfoModel?>((value) {
        if (value['data'] is Map) {
          return GamingOrderStateInfoModel.fromJson(
              value['data'] as Map<String, dynamic>);
        }
        return null;
      }).doOnData((event) {
        if (event.data?.state == 'Fail') {
          _status.value = GamingCurrencyVirtualDepositOrderStatus.fail;
        } else if (event.data?.state == 'Success') {
          AnalyticsManager.logEvent(name: 'deposit_success');
          _status.value = GamingCurrencyVirtualDepositOrderStatus.success;
          timerController.disposeTimer();
        }
      }).listen(null, onError: (err, p1) {});
    }
  }

  void onDeposit(Map<String, dynamic> data) {
    navigateToWalletHome();
  }
}
