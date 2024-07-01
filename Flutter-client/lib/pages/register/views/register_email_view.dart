import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/config/gaps.dart';
import 'package:gogaming_app/pages/register/register_logic.dart';

import '../../../common/theme/colors/go_gaming_colors.dart';
import '../../../common/theme/text_styles/gg_text_styles.dart';
import '../../../common/widgets/gaming_text_filed/gaming_text_filed.dart';

class RegisterEmailView extends StatelessWidget {
  final RegisterLogic controller;

  const RegisterEmailView(
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
              controller.getLocalString('email'),
              style: TextStyle(
                color: GGColors.textSecond.color,
                fontSize: GGFontSize.content.fontSize,
                fontFamily: GGFontFamily.c().fontFamily,
              ),
            ),
          ),
          GamingTextField(
            controller: controller.registerEmail,
            fillColor: GGColors.alertBackground,
          ),
          Container(
            margin: EdgeInsets.only(top: 10.dp),
          ),
          Container(
            margin: EdgeInsets.only(top: 10.dp, bottom: 5.dp),
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
            controller: controller.registerPasswordEmail,
            fillColor: GGColors.alertBackground,
          ),
          Gaps.vGap4,
          GamingVerifyLevelWidget(
            controller: controller.registerPasswordEmail,
          ),
          ...buildFooter,
        ],
      ),
    );
  }
}
