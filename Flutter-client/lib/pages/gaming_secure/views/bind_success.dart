import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/widget_header.dart';

class BindSuccess extends StatelessWidget {
  const BindSuccess(
      {Key? key, required this.accountPassword, required this.account})
      : super(key: key);

  final GamingTextFieldController accountPassword;
  final GamingTextFieldController account;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsetsDirectional.only(start: 24.dp, end: 24.dp),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(height: 20.dp),
          _buildTitle(localized('username_text')),
          SizedBox(height: 4.dp),
          _buildAccountTF(),
          SizedBox(height: 24.dp),
          _buildTitle(localized('password')),
          SizedBox(height: 4.dp),
          _buildPasswordTF(),
          SizedBox(height: 24.dp),
        ],
      ),
    );
  }

  Widget _buildPasswordTF() {
    return GamingPasswordTextField(controller: accountPassword);
  }

  Widget _buildAccountTF() {
    return GamingTextField(controller: account);
  }

  Widget _buildTitle(String text) {
    return Text(
      text,
      style: GGTextStyle(
        fontSize: GGFontSize.content,
        color: GGColors.textMain.color,
      ),
    );
  }
}
