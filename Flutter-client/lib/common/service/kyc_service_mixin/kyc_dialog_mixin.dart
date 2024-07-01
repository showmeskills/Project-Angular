// ignore_for_file: sdk_version_since

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:intl/intl.dart';

mixin KycDialogMixin {
  void onNeedKycLevelAlert(
    BuildContext context,
    String action, {
    String? message,
    String? title,
    void Function()? onDismiss,
    // route 跳转参数
    Map<String, dynamic>? arguments,
  }) {
    _checkKycStatus(
      action,
      onResolver: () {
        String message = localized('kyc_error00');
        if (action == Routes.kycMiddle.route) {
          message = localized('kyc_error02');
        }
        final dialog = DialogUtil(
          context: context,
          iconPath: R.commonDialogErrorBig,
          iconWidth: 80.dp,
          iconHeight: 80.dp,
          title: title ?? localized('safety_rem00'),
          content: message,
          rightBtnName: localized('verification'),
          leftBtnName: '',
          onRightBtnPressed: () {
            Get.back<dynamic>();
            Get.toNamed<dynamic>(action, arguments: arguments);
          },
          onDismiss: onDismiss,
        );
        dialog.showNoticeDialogWithTwoButtons();
      },
    );
  }

  void showDialog({
    String? message,
    String? title,
    String? rightBtnName,
    String? leftBtnName,
    String? iconPath,
    Color? rightBtnColor,
    Color? rightBtnBackgroundColor,
    bool autoClose = true,
    void Function()? onLeftBtnPressed,
    void Function()? onConfirm,
    void Function()? onDismiss,
  }) {
    final dialog = DialogUtil(
      context: Get.overlayContext!,
      iconPath: iconPath ?? R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: title ?? localized('safety_rem00'),
      content: message!,
      rightBtnName: rightBtnName ?? localized('verification'),
      rightBtnBackgroundColor: rightBtnBackgroundColor,
      rightBtnColor: rightBtnColor,
      leftBtnName: leftBtnName ?? '',
      contentMaxLine: null,
      onLeftBtnPressed: () {
        if (autoClose) Get.back<dynamic>();
        onLeftBtnPressed?.call();
      },
      onRightBtnPressed: () {
        if (autoClose) Get.back<dynamic>();
        onConfirm?.call();
      },
      onDismiss: onDismiss,
    );
    dialog.showNoticeDialogWithTwoButtons();
  }

  /// 欧洲版kyc弹窗
  void showKycEuDialog(
    String action, {
    bool autoClose = true,
    bool checkKycStatus = false,
    String? message,
    String? title,
    void Function()? onDismiss,
  }) {
    assert(
        action == Routes.kycPrimary.route ||
            action == Routes.kycMiddle.route ||
            action == Routes.kycAdvance.route ||
            action == Routes.kycPOA.route,
        '仅限初级、中级、高级弹窗');
    final Completer<void> completer = Completer<void>();
    if (action == Routes.kycPrimary.route) {
      completer.complete();
    } else {
      _checkKycStatus(action, autoClose: autoClose, onDismiss: onDismiss,
          onResolver: () {
        completer.complete();
      });
    }
    completer.future.then((value) {
      if (message == null) {
        if (action == Routes.kycPrimary.route) {
          message = localized('complete_primary');
        } else if (action == Routes.kycMiddle.route) {
          message = localized('auth_acc_notice');
        } else if (action == Routes.kycAdvance.route) {
          message = localized('complete_adv');
        }
      }
      showDialog(
        message: message,
        title: title,
        autoClose: autoClose,
        rightBtnName: localized('verify_now'),
        leftBtnName: localized('sure_btn'),
        onConfirm: () {
          Get.toNamed<dynamic>(action);
        },
        onLeftBtnPressed: () {
          onDismiss?.call();
        },
        onDismiss: onDismiss,
      );
    });
  }

  // 检查kyc状态，如果正在审核中则提示审核中弹窗，反之跳转
  void _checkKycStatus(
    String action, {
    bool autoClose = true,
    void Function()? onDismiss,
    void Function()? onResolver,
  }) {
    if (action != Routes.kycMiddle.route && action != Routes.kycAdvance.route) {
      onResolver?.call();
      return;
    }
    KycService.sharedInstance.getKycStatus().doOnData((event) {
      bool showTips = false;
      if (action == Routes.kycMiddle.route) {
        showTips = event.elementAtOrNull(1)?.status == 'P';
      } else if (action == Routes.kycAdvance.route) {
        showTips = event.elementAtOrNull(2)?.status == 'P';
      }
      if (showTips) {
        showKycReviewEuDialog(
          autoClose: autoClose,
          onDismiss: onDismiss,
        );
        return;
      }
      onResolver?.call();
    }).listen(null, onError: (err) {});
  }

  /// kyc审核中弹窗
  void showKycReviewEuDialog({
    bool autoClose = true,
    void Function()? onConfirm,
    void Function()? onDismiss,
  }) {
    showDialog(
      autoClose: autoClose,
      message: localized('status_notice'),
      rightBtnColor: GGColors.textMain.color,
      rightBtnBackgroundColor: GGColors.border.color,
      rightBtnName: localized('sure_btn'),
      // leftBtnName: action == Routes.kycHome.route ? '' : localized('sure_btn'),
      onDismiss: onDismiss,
      onConfirm: onConfirm,
    );
  }

  /// kyc id身份验证弹窗
  void showIdVerificationDialog() {
    showDialog(
      message: localized('verification_acc_notice'),
      rightBtnName: localized('verification_acc'),
      onConfirm: () {
        Get.toNamed<void>(Routes.kycHome.route);
      },
    );
  }

  /// kyc补充材料弹窗
  void showDocumentDialog({
    bool autoClose = true,
    void Function()? onDismiss,
  }) {
    showDialog(
      message: localized('kyc_error05'),
      autoClose: autoClose,
      onConfirm: () {
        Get.toNamed<void>(Routes.kycHome.route);
      },
      onDismiss: onDismiss,
    );
  }

  /// 审核中弹窗
  void showReviewDialog({
    void Function()? onConfirm,
  }) {
    final DateTime date = DateTime.now().toUtc().add(const Duration(days: 3));
    final dialog = DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogWait,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('kyc_in_verification'),
      content: localized('kyc_expected_date'),
      moreWidget: Container(
        margin: EdgeInsets.only(bottom: 16.dp),
        child: Text(
          '${DateFormat('yyyy-MM-dd').format(date)}(UTC)',
          style: GGTextStyle(
            fontSize: GGFontSize.hint,
            color: GGColors.highlightButton.color,
          ),
        ),
      ),
      rightBtnName: localized('sure_btn'),
      leftBtnName: '',
      onRightBtnPressed: () {
        Get.back<dynamic>();
        onConfirm?.call();
      },
    );
    dialog.showNoticeDialogWithTwoButtons();
  }
}
