import 'package:flutter/material.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/base/go_gaming_response.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_wallet_overview/gaming_wallet_overview_model.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/widget_header.dart';

import '../common/service/kyc_service.dart';
import '../common/service/wallet_service.dart';

class WithdrawRouterUtil {
  static final _cryptoRoutes = [
    Routes.withdrawHome.route,
    Routes.withdrawal.route,
  ];
  static final _currencyRoutes = [
    Routes.withdrawHome.route,
    Routes.fiatWithdraw.route,
  ];

  static void close() {
    Get.until((route) =>
        !_cryptoRoutes.contains(route.settings.name) &&
        !_currencyRoutes.contains(route.settings.name));
  }

  static void goWithdrawHome({bool replace = false}) {
    if (replace) {
      Get.offNamed<void>(Routes.withdrawHome.route);
    } else {
      Get.toNamed<void>(Routes.withdrawHome.route);
    }
  }

  static void goCryptoWithdraw([String? currency]) {
    KycService.sharedInstance.checkPrimaryDialog(
      () {
        _checkAllowWithdrawal(() {
          Get.toNamed<void>(Routes.withdrawal.route, arguments: {
            'category': currency,
          });
        });
      },
      Get.overlayContext!,
      title: localized('safety_rem00'),
    );
  }

  static void goCurrencyWithdraw([String? currency]) {
    SmartDialog.showLoading<void>();
    _checkAllowWithdrawal(() {
      Get.toNamed<void>(
        Routes.fiatWithdraw.route,
        arguments: {
          'currency': currency,
        },
      );
    });
  }

  static void _checkAllowWithdrawal(VoidCallback onSuccess) {
    WalletService().allowWithdrawal().doOnDone(() {
      SmartDialog.dismiss<void>(status: SmartStatus.loading);
    }).listen((event) {
      if (event) {
        onSuccess();
      } else {
        WalletService().overview(useCahce: true).listen((event) {
          WithdrawRouterUtil()._onPressClearCoupon(event);
        }, onError: (_) {});
      }
    }, onError: (Object e) {
      if (e is GoGamingResponse) {
        Toast.showFailed(e.message);
      } else {
        Toast.showTryLater();
      }
    });
  }

  /// 抵用金额清零
  void _onPressClearCoupon(GamingWalletOverviewModel overviewModel) {
    DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('confirm_clear_credit_title'),
      moreWidget: _buildClearCreditContent("${overviewModel.totalBonus}",
          "${overviewModel.totalNonStickyBonus}"),
      backDismissible: false,
      leftBtnName: localized('cancels'),
      rightBtnName: localized('clear_zero'),
      rightCountdown: 5,
      onLeftBtnPressed: () {
        Get.back<void>();
        Get.back<void>();
      },
      onRightBtnPressed: () {
        Get.back<void>();
        clearCredit();
      },
    ).showNoticeDialogWithTwoButtons();
  }

  Widget _buildClearCreditContent(String balance, String nonstickBonus) {
    final textList = [
      localized('clear_desc1'),
      localized('clear_desc2'),
      localized('clear_desc3'),
      localized('clear_desc4'),
      localized('clear_desc5'),
      localized('clear_desc6')
    ]
        .asMap()
        .entries
        .map((entry) => _buildClearContent(
            entry.value,
            entry.key % 2 == 0
                ? GGColors.textSecond.color
                : GGColors.textMain.color))
        .toList();

    Widget buildTitleRow(String title, String num) {
      return Row(
        children: [
          Expanded(
            child: Text.rich(
              textAlign: TextAlign.center,
              TextSpan(
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                ),
                children: [
                  TextSpan(
                    text: '$title: ',
                  ),
                  TextSpan(
                    text: '$num USDT',
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.brand.color,
                    ),
                  )
                ],
              ),
            ),
          ),
        ],
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (num.tryParse(balance)?.isGreaterThan(0) == true) ...[
          buildTitleRow(localized('current_credit_bal'), balance),
          Gaps.vGap10,
        ],
        if (num.tryParse(nonstickBonus)?.isGreaterThan(0) == true)
          buildTitleRow(localized('current_nonstick_bonus'), nonstickBonus),
        Container(
          width: double.infinity,
          padding:
              EdgeInsetsDirectional.only(top: 10.dp, start: 10.dp, end: 10.dp),
          margin: EdgeInsets.all(20.dp),
          decoration: BoxDecoration(
            color: GGColors.border.color,
            borderRadius: BorderRadius.circular(10),
          ),
          child: ConstrainedBox(
            constraints: BoxConstraints(maxHeight: 200.dp),
            child: ListView(
              children: textList,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildClearContent(String text, Color textColor) {
    return Padding(
      padding: EdgeInsets.only(bottom: 10.dp),
      child: Row(
        children: [
          Expanded(
              child: Text(
            text,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: textColor,
            ),
          )),
        ],
      ),
    );
  }

  /// 清除抵用券
  void clearCredit() {
    WalletService().clearCredit().listen((event) {
      if (event) {
        Toast.showSuccessful(localized('bonus_success'));
      } else {
        Toast.showFailed(localized('bonus_fail'));
      }
    }, onError: (Object e) {
      if (e is GoGamingResponse) {
        Toast.showFailed(e.message);
      } else {
        Toast.showFailed(localized('bonus_fail'));
      }
    });
  }
}
