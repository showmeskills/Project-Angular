import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/widget_header.dart';

class LoginAccountView extends StatelessWidget {
  const LoginAccountView({
    Key? key,
    required this.accountPassword,
    required this.account,
    required this.buildFooter,
    required this.isRequesting,
  }) : super(key: key);

  final GamingTextFieldController accountPassword;
  final GamingTextFieldController account;
  final List<Widget> buildFooter;
  final RxBool isRequesting;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Container(
        padding: EdgeInsetsDirectional.only(start: 24.dp, end: 24.dp),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: 20.dp),
            _buildTitle(localized('username_text')),
            SizedBox(height: 8.dp),
            _buildAccountTF(),
            SizedBox(height: 24.dp),
            _buildTitle(localized('password')),
            SizedBox(height: 8.dp),
            _buildPasswordTF(),
            SizedBox(height: 24.dp),
            ...buildFooter,
          ],
        ),
      ),
    );
  }

  Widget _buildPasswordTF() {
    return Obx(() {
      return GamingPasswordTextField(
        controller: accountPassword,
        enabled: !isRequesting.value,
        fillColor:
            Config.isM1 ? GGColors.alertBackground : GGColors.moduleBackground,
      );
    });
  }

  Widget _buildAccountTF() {
    return Obx(() {
      return GamingTextField(
        controller: account,
        enabled: !isRequesting.value,
        fillColor:
            Config.isM1 ? GGColors.alertBackground : GGColors.moduleBackground,
      );
    });
  }

  Widget _buildTitle(String text) {
    return Text(
      text,
      style: GGTextStyle(
        fontSize: GGFontSize.content,
        color: GGColors.textSecond.color,
      ),
    );
  }
}
