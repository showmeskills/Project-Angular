import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/pages/reset_password/reset_password_state.dart';

import '../../common/api/base/base_api.dart';
import '../../common/lang/locale_lang.dart';
import '../../common/theme/colors/go_gaming_colors.dart';
import '../../common/theme/text_styles/gg_text_styles.dart';
import '../../common/widgets/appbar/appbar.dart';
import '../../common/widgets/gg_button.dart';
import '../base/base_view.dart';
import 'reset_password_logic.dart';

class ResetPasswordPage extends BaseView<ResetPasswordLogic> {
  const ResetPasswordPage({
    Key? key,
    this.uniCode = '',
  }) : super(key: key);
  final String uniCode;

  ResetPasswordState get state => controller.state;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () {
        Map<String, dynamic> arguments = Get.arguments as Map<String, dynamic>;
        String code = arguments['uniCode'].toString();
        return ResetPasswordPage(
          uniCode: code,
        );
      },
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(backgroundColor: GGColors.loginBackground.color);
  }

  @override
  Color? backgroundColor() {
    return GGColors.loginBackground.color;
  }

  @override
  Widget body(BuildContext context) {
    Get.put(ResetPasswordLogic());
    return SingleChildScrollView(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(height: 24.dp),
          inset(_buildTitle1()),
          SizedBox(height: 36.dp),
          inset(_buildTitle(localized("new_password"))),
          SizedBox(height: 4.dp),
          inset(_buildNewPasswordTF()),
          SizedBox(height: 36.dp),
          inset(_buildTitle(localized("confirm_pwd"))),
          SizedBox(height: 4.dp),
          inset(_buildPasswordAgainTF()),
          SizedBox(height: 36.dp),
          inset(_buildSubmitButton())
        ],
      ),
    );
  }

  Widget _buildNewPasswordTF() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GamingPasswordTextField(
          controller: controller.password,
          fillColor: GGColors.alertBackground,
        ),
        SizedBox(height: 4.dp),
        GamingVerifyLevelWidget(controller: controller.password)
      ],
    );
  }

  Widget _buildPasswordAgainTF() {
    return GamingPasswordTextField(
      controller: controller.passwordAgain,
      fillColor: GGColors.alertBackground,
    );
  }

  Widget _buildSubmitButton() {
    return Obx(() {
      return SizedBox(
        width: double.infinity,
        child: GGButton(
          onPressed: () => controller.submit(uniCode),
          enable: controller.submitEnable.value,
          isLoading: controller.isLoginLoading.value,
          text: getLocalString('submit'),
        ),
      );
    });
  }

  Widget _buildTitle1() {
    return Row(
      children: [
        Text(
          localized('reset_pwd'),
          style: GGTextStyle(
            fontSize: GGFontSize.superBigTitle,
            fontWeight: GGFontWeigh.bold,
            color: GGColors.textMain.color,
          ),
        ),
      ],
    );
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

  Widget inset(Widget child, {double? start, double? end}) {
    return Padding(
      padding: EdgeInsetsDirectional.only(
        start: start ?? 24.dp,
        end: end ?? 24.dp,
      ),
      child: child,
    );
  }
}
