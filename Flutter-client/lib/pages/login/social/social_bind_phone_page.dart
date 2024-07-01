import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/login/login_state.dart';
import 'package:gogaming_app/pages/login/views/login_mobile_view.dart';
import 'package:gogaming_app/widget_header.dart';

import 'social_bind_phone_logic.dart';

class SocialBindPhonePage extends BaseView<SocialBindPhoneLogic> {
  const SocialBindPhonePage({
    super.key,
    required this.socialUserType,
    required this.socialUserId,
  });
  LoginState get state => controller.state;

  final String socialUserType;
  final String socialUserId;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () =>
          SocialBindPhonePage.argument(Get.arguments as Map<String, dynamic>),
    );
  }

  factory SocialBindPhonePage.argument(Map<String, dynamic> arguments) {
    final String socialUserType = arguments['socialUserType'] as String;
    final String socialUserId = arguments['socialUserId'] as String;

    return SocialBindPhonePage(
      socialUserId: socialUserId,
      socialUserType: socialUserType,
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(SocialBindPhoneLogic(socialUserType, socialUserId));
    return Column(
      mainAxisSize: MainAxisSize.max,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(height: 60.dp),
        inset(_buildTitle1()),
        SizedBox(height: 32.dp),
        Expanded(
          child: SingleChildScrollView(
            child: LoginMobileView(
              mobile: state.mobile,
              mobilePassword: state.mobilePassword,
              selectCountry: state.country,
              onCountryChanged: controller.onCountryChanged,
              buildFooter: _buildFooter(),
              isRequesting: controller.isLoginLoading,
            ),
          ),
        ),
      ],
    );
  }

  List<Widget> _buildFooter() {
    return [
      _buildBindButton(),
      Gaps.vGap20,
    ];
  }

  Widget _buildBindButton() {
    return Row(
      children: [
        Expanded(
          child: Obx(() {
            return GGButton.main(
              onPressed: _onBind,
              text: localized('binding_button'),
              enable: state.isEnableLogin.value,
              isLoading: controller.isLoginLoading.value,
            );
          }),
        ),
      ],
    );
  }

  Widget _buildTitle1() {
    return Row(
      children: [
        Text(
          localized('bound_phone'),
          style: GGTextStyle(
            fontSize: GGFontSize.superBigTitle,
            fontWeight: GGFontWeigh.bold,
            color: GGColors.textMain.color,
          ),
        ),
      ],
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

extension _Action on SocialBindPhonePage {
  /// 点击绑定
  void _onBind() {
    controller.socialLoginByPhone();
  }
}
