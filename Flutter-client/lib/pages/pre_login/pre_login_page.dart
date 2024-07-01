import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/router/customer_middle_ware.dart';

import '../../common/service/biometric_service.dart';
import '../../common/widgets/appbar/appbar.dart';
import '../../widget_header.dart';
import 'pre_login_logic.dart';

class PreLoginPage extends BaseView<PreLoginLogic> {
  const PreLoginPage({Key? key}) : super(key: key);

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const PreLoginPage(),
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
    Get.put(PreLoginLogic());
    return Padding(
      padding: EdgeInsetsDirectional.only(start: 24.dp, end: 24.dp),
      child: Column(
        children: [
          SizedBox(height: 30.dp),
          _buildLoginButton(),
          SizedBox(height: 12.dp),
          _buildRegisterButton(),
          _buildCustomer(),
        ],
      ),
    );
  }

  Widget _buildCustomer() {
    return Row(
      children: [
        Expanded(
          child: GGButton(
            backgroundColor: GGColors.transparent.color,
            textColor: GGColors.brand.color,
            onPressed: _onOnlineCs,
            text: localized('online_cs'),
          ),
        ),
      ],
    );
  }

  Widget _buildLoginButton() {
    return Row(
      children: [
        Expanded(
          child: GGButton.minor(
            onPressed: _onLogin,
            text: localized('login_button'),
          ),
        ),
      ],
    );
  }

  Widget _buildRegisterButton() {
    return Row(
      children: [
        Expanded(
          child: GGButton.main(
            onPressed: _onRegister,
            text: localized('register_button'),
          ),
        ),
      ],
    );
  }
}

extension _Action on PreLoginPage {
  void _onOnlineCs() {
    CustomerServiceRouter().offNamed();
  }

  void _onLogin() {
    if (BiometricService.sharedInstance.canBiometricLogin()) {
      Get.offNamed<dynamic>(Routes.biometricLogin.route);
    } else {
      Get.offNamed<dynamic>(Routes.login.route);
    }
  }

  void _onRegister() {
    Get.offNamed<dynamic>(Routes.register.route);
  }
}
