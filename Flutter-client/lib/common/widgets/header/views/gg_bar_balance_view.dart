import 'package:base_framework/base_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';
import 'package:gogaming_app/common/theme/text_styles/gg_text_styles.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/config/gaps.dart';
import 'package:gogaming_app/generated/r.dart';

import '../gg_user_app_bar_controller.dart';

class GGBarBalanceView extends StatelessWidget {
  const GGBarBalanceView({
    Key? key,
    required this.onPressRecharge,
    required this.onPressBalance,
    required this.controller,
  }) : super(key: key);

  final void Function() onPressRecharge;
  final void Function() onPressBalance;
  final GGUserAppBarController controller;

  @override
  Widget build(BuildContext context) {
    return GetBuilder(
        init: controller,
        builder: (logic) {
          return Container(
            width: 191.dp,
            height: 36.dp,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(4),
              color: GGColors.darkBackground.color,
            ),
            child: Row(
              children: [
                Gaps.hGap12,
                Expanded(
                  child: buildCurrency(),
                ),
                SizedBox(
                  width: 1.dp,
                ),
                _buildWalletImage(),
              ],
            ),
          );
        });
  }

  Widget buildCurrency() {
    return Obx(() {
      return InkWell(
        onTap: onPressBalance,
        child: Row(
          children: [
            ConstrainedBox(
              constraints: BoxConstraints(maxWidth: 70.dp),
              child: FittedBox(
                alignment: AlignmentDirectional.centerStart,
                fit: BoxFit.scaleDown,
                child: Text(
                  controller.selectedBalanceText,
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    fontFamily: GGFontFamily.dingPro,
                    color: GGColors.textMain.color,
                    fontWeight: GGFontWeigh.bold,
                  ),
                ),
              ),
            ),
            SizedBox(
              width: 5.dp,
            ),
            GamingImage.network(
              url: controller.selectedIconUrl,
              width: 14.dp,
              height: 14.dp,
            ),
            const Spacer(),
            SvgPicture.asset(
              R.appbarAppbarArrowDown,
              width: 11.dp,
              // height: 14.dp,
              fit: BoxFit.cover,
              color: GGColors.textSecond.color,
            ),
            Gaps.hGap10,
          ],
        ),
      );
    });
  }

  Widget _buildWalletImage() {
    return InkWell(
      onTap: onPressRecharge,
      child: Container(
        decoration: BoxDecoration(
          color: GGColors.brand.color,
          borderRadius: const BorderRadius.only(
            topRight: Radius.circular(3),
            bottomRight: Radius.circular(3),
          ),
        ),
        alignment: Alignment.center,
        width: 54.dp,
        padding: EdgeInsetsDirectional.only(start: 3.dp, end: 3.dp),
        child: FittedBox(
          fit: BoxFit.scaleDown,
          child: Text(
            localized('deposit'),
            style: GGTextStyle(
              fontSize: GGFontSize.smallTitle,
              color: GGColors.buttonTextWhite.color,
            ),
          ),
        ),
      ),
    );
  }
}
