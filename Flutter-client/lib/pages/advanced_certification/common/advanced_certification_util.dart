import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../common/api/risk_form/enum.dart';

class AdvancedCertificationUtil {
  static void showCertificationDialogWithType({
    required String type,
  }) {
    if (type.toLowerCase() == 'wealthsource') {
      showCertificationDialog(type: AdvancedCertificationType.wealthSource);
    } else if (type.toLowerCase() == 'riskassessment') {
      showCertificationDialog(type: AdvancedCertificationType.riskAssessment);
    } else if (type.toLowerCase() == 'FullAudit') {
      showCertificationDialog(type: AdvancedCertificationType.fullCertificate);
    } else {}
  }

  static void showCertificationDialog({
    bool autoClose = true,
    AdvancedCertificationType type = AdvancedCertificationType.riskAssessment,
    void Function()? onDismiss,
  }) {
    DialogUtil(
      context: Get.overlayContext!,
      backDismissible: true,
      iconWidget: Container(
        alignment: Alignment.center,
        child: Container(
          decoration: BoxDecoration(
            color: GGColors.background.color,
            shape: BoxShape.circle,
          ),
          child: Image.asset(
            R.advancedCertificationDialog,
            width: 111.dp,
            height: 111.dp,
          ),
        ),
      ),
      title: localized('edd_a'),
      titleSize: GGFontSize.bigTitle20,
      contentPadding: EdgeInsets.only(
        bottom: 20.dp,
        top: 26.dp,
        left: 16.dp,
        right: 16.dp,
      ),
      padding: EdgeInsets.symmetric(vertical: 16.dp, horizontal: 30.dp),
      // content: content,
      moreWidget: Container(
        padding: EdgeInsets.symmetric(horizontal: 16.dp),
        child: Column(
          children: [
            Text(
              localized('edd_b'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
              ),
            ),
            Gaps.vGap10,
            // Row(
            //   mainAxisAlignment: MainAxisAlignment.center,
            //   children: [
            //     Container(
            //       decoration: BoxDecoration(
            //         color: GGColors.error.color,
            //         shape: BoxShape.circle,
            //       ),
            //       width: 4.dp,
            //       height: 4.dp,
            //     ),
            //     Gaps.hGap10,
            //     Flexible(
            //       child: Text(
            //         type.action,
            //         style: GGTextStyle(
            //           fontSize: GGFontSize.content,
            //           color: GGColors.error.color,
            //         ),
            //       ),
            //     ),
            //   ],
            // ),
            // Gaps.vGap10,
            Text(
              localized('edd_c'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.error.color,
              ),
            ),
            Gaps.vGap16,
          ],
        ),
      ),
      rightBtnName: localized('start_now'),
      leftBtnName: '',
      onRightBtnPressed: () {
        if (autoClose) {
          Get.back<void>();
        }
        if (type == AdvancedCertificationType.riskAssessment) {
          Get.toNamed<void>(Routes.riskAssessment.route);
        } else if (type == AdvancedCertificationType.wealthSource) {
          Get.toNamed<void>(Routes.wealthSourceCertificate.route);
        } else if (type == AdvancedCertificationType.fullCertificate) {
          Get.toNamed<void>(Routes.fullCertificate.route);
        }
      },
      onDismiss: onDismiss,
    ).showNoticeDialogWithTwoButtons();
  }

  static void showRiskAssessmentResult({
    bool autoClose = true,
    void Function()? onConfirm,
    void Function()? onDismiss,
  }) {
    DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogWait,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('kyc_in_verification'),
      content: localized('edd_popup_tips'),
      rightBtnName: localized('sure_btn'),
      leftBtnName: '',
      contentMaxLine: null,
      onRightBtnPressed: () {
        if (autoClose) {
          Get.back<void>();
        }
        onConfirm?.call();
      },
      onDismiss: onDismiss,
    ).showNoticeDialogWithTwoButtons();
  }

  static void showWealthSourceResult() {
    DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogWait,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('kyc_in_verification'),
      content: localized('wealth_source_under_review_content'),
      rightBtnName: localized('confirm_button'),
      leftBtnName: '',
      contentMaxLine: null,
      onRightBtnPressed: () {
        Get.back<void>();
        Get.back<void>();
      },
    ).showNoticeDialogWithTwoButtons();
  }

  static void showUploadSpecifiedFileResult() {
    DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogWait,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('upload_specified_file_under_review'),
      content: localized('upload_specified_file_under_review_content'),
      rightBtnName: localized('confirm_button'),
      leftBtnName: '',
      contentMaxLine: null,
      onRightBtnPressed: () {
        Get.back<void>();
        Get.back<void>();
      },
    ).showNoticeDialogWithTwoButtons();
  }
}
