import 'package:base_framework/base_controller.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/theme/text_styles/gg_text_styles.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/set_password/set_password_logic.dart';

import '../../common/lang/locale_lang.dart';
import '../../common/theme/colors/go_gaming_colors.dart';
import '../../common/widgets/appbar/appbar.dart';
import '../../common/widgets/gaming_text_filed/gaming_text_filed.dart';
import '../../common/widgets/gg_button.dart';

class SetPasswordView extends BaseView<SetPasswordLogic> {
  const SetPasswordView({super.key, this.navigateToModifyPwd = true});

  final bool navigateToModifyPwd;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => SetPasswordView.argument(
          Get.arguments as Map<String, dynamic>? ?? {}),
    );
  }

  factory SetPasswordView.argument(Map<String, dynamic> arguments) {
    return SetPasswordView(
      navigateToModifyPwd: arguments['navigateToModifyPwd'] as bool? ?? true,
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(SetPasswordLogic(navigateToModifyPwd));
    return SingleChildScrollView(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(height: 24.dp),
          _inset(_buildTitle(localized("set_password"))),
          SizedBox(height: 4.dp),
          _inset(_buildNewPasswordTF()),
        ],
      ),
    );
  }

  Widget _buildSubmitButton() {
    return Obx(() {
      return SizedBox(
        width: double.infinity,
        child: GGButton(
          onPressed: () => controller.sure(),
          enable: controller.submitEnable.value,
          isLoading: controller.isLoginLoading.value,
          text: getLocalString('confirm_button'),
        ),
      );
    });
  }

  Widget _buildNewPasswordTF() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GamingPasswordTextField(controller: controller.password),
        SizedBox(height: 4.dp),
        GamingVerifyLevelWidget(controller: controller.password)
      ],
    );
  }

  Widget _buildTitle(String title) {
    return Row(
      children: [
        Text(
          title,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            fontWeight: GGFontWeigh.regular,
            color: GGColors.textSecond.color,
          ),
        ),
      ],
    );
  }

  Widget _inset(Widget child, {double? start, double? end}) {
    return Padding(
      padding: EdgeInsetsDirectional.only(
        start: start ?? 16.dp,
        end: end ?? 16.dp,
      ),
      child: child,
    );
  }

  @override
  Widget? bottomNavigationBar() {
    return Padding(
      padding: EdgeInsets.only(left: 16.dp, right: 16.dp),
      child: SafeArea(
        minimum: EdgeInsets.only(bottom: 10.dp),
        child: _buildSubmitButton(),
      ),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) =>
      GGAppBar.normal(title: localized("set_password"));
}
