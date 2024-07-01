import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/config/gaps.dart';
import 'package:gogaming_app/pages/register/register_logic.dart';

import '../../../common/theme/colors/go_gaming_colors.dart';
import '../../../common/theme/text_styles/gg_text_styles.dart';
import '../../../common/widgets/gaming_text_filed/gaming_text_filed.dart';

class RegisterUserView extends StatelessWidget {
  final RegisterLogic controller;

  const RegisterUserView(
      {Key? key, required this.controller, required this.buildFooter})
      : super(key: key);

  final List<Widget> buildFooter;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: EdgeInsets.only(bottom: 30.dp),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            margin: EdgeInsets.only(top: 20.dp, bottom: 8.dp),
            child: Text(
              controller.getLocalString('username_text'),
              style: TextStyle(
                color: GGColors.textSecond.color,
                fontSize: GGFontSize.content.fontSize,
                fontFamily: GGFontFamily.c().fontFamily,
              ),
            ),
          ),
          GamingVerifyLinkWidget(
            controller: controller.userNameUser,
            targetAnchor: Alignment.bottomCenter,
            followerAnchor: Alignment.topCenter,
            child: GamingTextField(
              controller: controller.userNameUser,
              fillColor: Config.isM1
                  ? GGColors.alertBackground
                  : GGColors.moduleBackground,
            ),
          ),
          SizedBox(height: 24.dp),
          _buildTitle(localized('email'), '(${localized('optional')})'),
          SizedBox(height: 8.dp),
          _buildEmailTF(),
          Container(
            margin: EdgeInsets.only(top: 14.dp),
          ),
          Container(
            margin: EdgeInsets.only(top: 10.dp, bottom: 8.dp),
            child: Text(
              controller.getLocalString('password_text'),
              style: TextStyle(
                color: GGColors.textSecond.color,
                fontSize: GGFontSize.content.fontSize,
                fontFamily: GGFontFamily.c().fontFamily,
              ),
            ),
          ),
          GamingPasswordTextField(
            controller: controller.passwordUser,
            fillColor: Config.isM1
                ? GGColors.alertBackground
                : GGColors.moduleBackground,
          ),
          Gaps.vGap4,
          GamingVerifyLevelWidget(
            controller: controller.passwordUser,
          ),
          ...buildFooter,
        ],
      ),
    );
  }

  Widget _buildTitle(String text, [String? subText]) {
    final painter = TextPainter(
      textDirection: TextDirection.ltr,
      text: TextSpan(
        text: text,
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.textSecond.color,
        ),
      ),
    )..layout();
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          text,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        if (subText?.isNotEmpty ?? false)
          Baseline(
            baseline: painter.computeLineMetrics()[0].baseline,
            baselineType: TextBaseline.alphabetic,
            child: Container(
              margin: EdgeInsets.only(left: 10.dp),
              child: Text(
                subText!,
                style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  color: GGColors.textSecond.color,
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildEmailTF() {
    return GamingTextField(
      controller: controller.email,
      fillColor:
          Config.isM1 ? GGColors.alertBackground : GGColors.moduleBackground,
      // enabled: !isRequesting.value,
    );
  }
}
