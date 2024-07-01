import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/faq/faq_api.dart';
import 'package:gogaming_app/common/widgets/bottom_sheet/gaming_faq_bottom_sheet.dart';
import 'package:gogaming_app/widget_header.dart';

mixin DepositCommonUIMixin {
  Widget buildContainer({
    required Widget child,
    Color? color,
  }) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
        horizontal: 14.dp,
        vertical: color == null ? 16.dp : 17.dp,
      ),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(4.dp),
        border: color == null
            ? Border.all(
                color: GGColors.border.color,
                width: 1.dp,
              )
            : null,
      ),
      child: child,
    );
  }

  Widget buildTitle(
    String title,
    BuildContext context, {
    required FaqTag tag,
  }) {
    return Row(
      children: [
        buildSubTitle(title, context),
        if (title.isNotEmpty) Gaps.hGap8,
        ScaleTap(
          opacityMinValue: 0.8,
          scaleMinValue: 0.98,
          onPressed: () {
            Get.toNamed<void>(Routes.appeal.route);
          },
          child: Text(
            localized('dep_not_arrive'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.highlightButton.color,
            ),
            maxLines: 2,
          ),
        ),
        Gaps.hGap8,
        const Spacer(),
        ScaleTap(
          opacityMinValue: 0.8,
          scaleMinValue: 0.98,
          onPressed: () => _showFAQBottomSheet(tag: tag),
          child: Container(
            constraints: BoxConstraints(
                maxWidth: (MediaQuery.of(context).size.width - 32.dp) / 3),
            child: Text(
              localized('help_c_faq'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
              ),
              maxLines: 2,
            ),
          ),
        ),
      ],
    );
  }

  Widget buildSubTitle(String title, BuildContext context) {
    return Container(
      constraints: BoxConstraints(
          maxWidth: (MediaQuery.of(context).size.width - 32.dp) / 3),
      child: Text(
        title,
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.textSecond.color,
        ),
      ),
    );
  }

  Widget buildConfirmPageTitle(String title) {
    return Container(
      decoration: BoxDecoration(
        border: Border(
          left: BorderSide(
            color: GGColors.brand.color,
            width: 3.dp,
          ),
        ),
      ),
      padding: EdgeInsets.only(left: 8.dp),
      child: Text(
        title,
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.textSecond.color,
        ),
      ),
    );
  }
}

extension _Action on DepositCommonUIMixin {
  void _showFAQBottomSheet({
    required FaqTag tag,
  }) {
    GamingFAQBottomSheet.show(tag: tag);
  }
}
