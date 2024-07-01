import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/account/models/member_social_list.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/mobile_verification_code/mobile_verification_code_widget.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/gaming_secure/unbind_social/unbind_social_logic.dart';
import 'package:gogaming_app/widget_header.dart';

class UnbindSocialPage extends BaseView<UnbindSocialLogic> {
  const UnbindSocialPage({
    super.key,
    required this.socialInfo,
  });

  final SocialInfoList socialInfo;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () =>
          UnbindSocialPage.argument(Get.arguments as Map<String, dynamic>),
    );
  }

  factory UnbindSocialPage.argument(Map<String, dynamic> arguments) {
    final SocialInfoList socialInfo = arguments['socialInfo'] as SocialInfoList;
    return UnbindSocialPage(
      socialInfo: socialInfo,
    );
  }

  @override
  String get tag => socialInfo.toString();

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(title: localized('dis_third_acc'));
  }

  @override
  Widget body(BuildContext context) {
    Get.put(UnbindSocialLogic(socialInfo), tag: tag);

    return Container(
      width: double.infinity,
      padding: EdgeInsets.only(left: 16.dp, top: 24.dp, right: 16.dp),
      color: GGColors.background.color,
      child: _buildContent(context),
    );
  }

  Widget _buildContent(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap24,
        _buildPasswordTF(),
        Gaps.vGap16,
        Text(localized('p_code'),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular,
            )),
        SizedBox(height: 4.dp),
        MobileVerificationCodeWidget(
          controller.mobileOptController,
          VerifyAction.bindMobile,
          isVoice: controller.isVoice,
          fullMobile: controller.fullMobile,
          onStatusChanged: controller.onVerificationStatusChanged,
        ),
        Gaps.vGap60,
        _buildUnbindButton(),
      ],
    );
  }

  Widget _buildUnbindButton() {
    return Row(
      children: [
        Expanded(
          child: Obx(() {
            return GGButton.main(
              onPressed: controller.onPressUnbind,
              enable: controller.enableNext(),
              isLoading: controller.isLoading.value,
              text: localized('unbinding_button'),
            );
          }),
        ),
      ],
    );
  }

  /// 输入框
  Widget _buildPasswordTF() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(localized('password'),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular,
            )),
        Gaps.vGap4,
        GamingPasswordTextField(
          controller: controller.passwordController,
        ),
        Gaps.vGap4,
        Text(localized('enter_pwd'),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.hint,
              fontWeight: GGFontWeigh.regular,
            )),
      ],
    );
  }

  /// 提示
  // Widget _buildTip(String str, {GGFontWeigh weight = GGFontWeigh.regular}) {
  //   return Container(
  //     alignment: Alignment.center,
  //     child: Text(str,
  //         style: GGTextStyle(
  //           color: GGColors.textMain.color,
  //           fontSize: GGFontSize.smallTitle,
  //           fontWeight: weight,
  //         )),
  //   );
  // }
}
