import 'package:base_framework/base_controller.dart';
import 'package:flutter/material.dart';
// import 'package:get/get.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/theme/text_styles/gg_text_styles.dart';
import 'package:gogaming_app/pages/base/base_view.dart';

import '../../common/lang/locale_lang.dart';
import '../../common/theme/colors/go_gaming_colors.dart';
import '../../common/widgets/appbar/appbar.dart';
import '../../common/widgets/gaming_text_filed/gaming_text_filed.dart';
import '../../common/widgets/gg_button.dart';
import '../../generated/r.dart';
import 'modify_password_logic.dart';

class ModifyPasswordPage extends BaseView<ModifyPasswordLogic> {
  const ModifyPasswordPage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const ModifyPasswordPage(),
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(ModifyPasswordLogic());
    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(height: 36.dp),
                _inset(Container(
                  decoration: BoxDecoration(
                    color: const Color(0x20FB6943),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(24.dp, 16.dp, 24.dp, 16.dp),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Image.asset(
                          R.commonLightIcon,
                          width: 18.dp,
                          height: 18.dp,
                        ),
                        SizedBox(width: 16.dp),
                        Expanded(
                          child: Text(
                            localized("withdraw_forbidden_text"),
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: GGColors.brand.color,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                )),
                SizedBox(height: 24.dp),
                _inset(_buildTitle(localized("old_password"))),
                SizedBox(height: 4.dp),
                _inset(_buildOldPasswordTF()),
                SizedBox(height: 16.dp),
                _inset(_buildTitle(localized("new_password"))),
                SizedBox(height: 4.dp),
                _inset(_buildNewPasswordTF()),
                SizedBox(height: 16.dp),
                _inset(_buildTitle(localized("confirm_pwd"))),
                SizedBox(height: 4.dp),
                _inset(_buildPasswordAgainTF()),
              ],
            ),
          ),
        ),
        _buildSubmitButton(),
      ],
    );
  }

  Widget _buildSubmitButton() {
    return Padding(
      padding: EdgeInsets.only(left: 16.dp, right: 16.dp, bottom: 24.dp),
      child: Obx(() {
        return SizedBox(
          width: double.infinity,
          child: GGButton(
            onPressed: () => controller.sure(),
            enable: controller.submitEnable.value,
            isLoading: controller.isLoginLoading.value,
            text: getLocalString('next'),
          ),
        );
      }),
    );
  }

  Widget _buildOldPasswordTF() {
    return GamingPasswordTextField(controller: controller.oldPassword);
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

  Widget _buildPasswordAgainTF() {
    return GamingPasswordTextField(controller: controller.passwordAgain);
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
  PreferredSizeWidget? appBar(BuildContext context) =>
      GGAppBar.normal(title: localized("change_pwd"));
}
