import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/widget_header.dart';

class LoginEmailView extends StatelessWidget {
  const LoginEmailView({
    Key? key,
    required this.emailPassword,
    required this.email,
    required this.buildFooter,
    required this.isRequesting,
  }) : super(key: key);

  final GamingTextFieldController emailPassword;
  final GamingTextFieldController email;
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
            _buildTitle(localized('email')),
            SizedBox(height: 4.dp),
            _buildEmailTF(),
            SizedBox(height: 24.dp),
            _buildTitle(localized('password')),
            SizedBox(height: 4.dp),
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
        controller: emailPassword,
        enabled: !isRequesting.value,
        fillColor: GGColors.alertBackground,
      );
    });
  }

  Widget _buildEmailTF() {
    return Obx(() {
      return GamingTextField(
        controller: email,
        enabled: !isRequesting.value,
        fillColor: GGColors.alertBackground,
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
