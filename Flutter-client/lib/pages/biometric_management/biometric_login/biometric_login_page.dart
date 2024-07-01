import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../common/widgets/gaming_close_button.dart';
import 'biometric_login_logic.dart';

class BiometricLoginPage extends BaseView<BiometricLoginLogic> {
  const BiometricLoginPage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const BiometricLoginPage(),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      leadingIcon: buildCloseButton(),
    );
  }

  @override
  bool resizeToAvoidBottomInset() {
    return false;
  }

  @override
  bool ignoreBottomSafeSpacing() {
    return true;
  }

  Widget buildCloseButton() {
    return GamingCloseButton(
      onPressed: () {
        Get.back<void>();
      },
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(BiometricLoginLogic());
    controller.context = context;
    return Column(
      children: [
        SizedBox(
          height: 120.dp,
        ),
        GestureDetector(
          onTap: login,
          child: Image.asset(
            R.loginRegisterBiometricLogin,
            width: 196.dp,
            height: 196.dp,
            fit: BoxFit.contain,
          ),
        ),
        // 轻触解锁
        Gaps.vGap30,
        Text(
          localized('biometric_login'),
          style: GGTextStyle(
            fontSize: GGFontSize.hint,
            color: GGColors.textSecond.color,
          ),
        ),
        const Spacer(),
        SafeArea(
          bottom: true,
          maintainBottomViewPadding: true,
          minimum: EdgeInsets.only(bottom: 24.dp),
          child: Container(
            width: double.infinity,
            padding: EdgeInsets.symmetric(horizontal: 24.dp),
            child: Obx(() {
              return GGButton.main(
                onPressed: changeToPassword,
                enable: controller.enableChangeToPassword.value,
                isLoading: !controller.enableChangeToPassword.value,
                text: localized('change_to_password'),
              );
            }),
          ),
        ),
      ],
    );
  }
}

extension _Action on BiometricLoginPage {
  void login() {
    controller.login();
  }

  void changeToPassword() {
    Get.offNamed<dynamic>(Routes.login.route);
  }
}
