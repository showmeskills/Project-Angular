import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/widget_header.dart';

mixin AppealCommonUtilsMixin {
  void showSubmitSuccessfulDialog({
    required String id,
  }) {
    DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogSuccessBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('submitted'),
      // content: content,
      moreWidget: Container(
        decoration: BoxDecoration(
          color: GGColors.border.color,
          borderRadius: BorderRadius.circular(4.dp),
        ),
        padding: EdgeInsets.all(16.dp),
        margin: EdgeInsets.symmetric(horizontal: 20.dp).copyWith(bottom: 30.dp),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${localized('appeal_id')}$id',
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
              ),
            ),
            Gaps.vGap14,
            Text(
              "${localized('cen_first')}"
              "5-7"
              "${localized('cen_two')}",
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
              ),
            )
          ],
        ),
      ),
      rightBtnName: localized('back'),
      leftBtnName: '',
      onRightBtnPressed: () {
        Get.back<void>();
        Get.until((route) => route.settings.name == Routes.appeal.route);
      },
    ).showNoticeDialogWithTwoButtons();
  }
}
