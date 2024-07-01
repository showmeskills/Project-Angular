// ignore_for_file: unused_element
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';
import 'package:gogaming_app/common/theme/text_styles/gg_text_styles.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/email_verification_code/email_verification_code_widget.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/mobile_verification_code/mobile_verification_code_widget.dart';
import 'package:gogaming_app/config/gaps.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/base/base_view.dart';

import 'gaming_bind_email_logic.dart';

class GamingBindEmailPage extends BaseView<GamingBindEmailLogic> {
  const GamingBindEmailPage({Key? key}) : super(key: key);

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const GamingBindEmailPage(),
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(GamingBindEmailLogic());
    return _contentWidget(context);
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(title: localized('bind_email'));
  }

  Widget _contentWidget(BuildContext context) {
    return Container(
      width: double.infinity,
      color: GGColors.background.color,
      child: Obx(() {
        return SingleChildScrollView(
          child: Container(
            height:
                MediaQuery.of(context).size.height - 115.dp - Util.bottomMargin,
            padding: EdgeInsets.only(left: 16.dp, top: 24.dp, right: 16.dp),
            child: Column(
              children: [
                _buildContent(context),
                const Spacer(),
                _buildBottomStep(context),
                Gaps.vGap24,
              ],
            ),
          ),
        );
      }), //GGColors.popBackground.color, // Colors.red, //
    );
  }

  Widget _buildContent(BuildContext context) {
    if (controller.state.curIndex.value == 1) {
      return _buildContentStep1();
    } else {
      return _buildSuccess(context);
    }
  }

  Widget _buildTextSecond(String str) {
    return Text(str,
        style: GGTextStyle(
          color: GGColors.textSecond.color,
          fontSize: GGFontSize.content,
          fontWeight: GGFontWeigh.regular,
        ));
  }

  Widget _buildContentStep1() {
    return Column(
      children: [
        _buildEmailStep1(),
        Gaps.vGap24,
        _buildSafe(),
      ],
    );
  }

  Widget _buildNextStep() {
    return GGButton.main(
      onPressed: () {
        /// 点击下一步
        if (!controller.state.submitButtonEnable.value) return;
        _onClickNext();
      },
      text: localized('submit'),
      enable: controller.state.submitButtonEnable.value,
    );
  }

  Widget _buildBottomStep(BuildContext context) {
    if (controller.state.curIndex.value == 1) {
      return SizedBox(
          width: MediaQuery.of(context).size.width, child: _buildNextStep());
    } else {
      return _buildBackBtn(context);
    }
  }

  /// 返回
  Widget _buildBackBtn(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.of(context).pop();
      },
      child: Container(
        padding: EdgeInsets.only(left: 16.dp, right: 16.dp),
        height: 48.dp,
        width: double.infinity,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: GGColors.highlightButton.color,
          borderRadius: BorderRadius.all(Radius.circular(4.dp)),
        ),
        child: Text(localized('return'),
            style: GGTextStyle(
              color: GGColors.buttonTextWhite.color,
              fontSize: GGFontSize.smallTitle,
              fontWeight: GGFontWeigh.regular,
            )),
      ),
    );
  }

  /// 邮箱输入框
  Widget _buildEmailTF() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(localized('Email'),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular,
            )),
        SizedBox(
          height: 4.dp,
        ),
        GamingTextField(
          controller: controller.state.emailController,
          keyboardType: TextInputType.emailAddress,
        ),
        SizedBox(
          height: 3.dp,
        ),
      ],
    );
  }

  /// 邮箱验证码
  Widget _buildEmailVerifyTF() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(localized('email_verification'),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular,
            )),
        EmailVerificationCodeWidget(
          controller.state.emailVerifyController,
          VerifyAction.bindEmail,
          fullEmailController: controller.state.emailController,
          resData: controller.onGetVerifyEmail,
        ),
      ],
    );
  }

  /// 安全验证
  Widget _buildSafe() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildTip(localized('security_veri')),
        Gaps.vGap24,
        _firstCodeWidget(),
      ],
    );
  }

  /// 密码输入框
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
        SizedBox(
          height: 4.dp,
        ),
        GamingPasswordTextField(
          controller: controller.state.passwordController,
        ),
        SizedBox(
          height: 3.dp,
        ),
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
  Widget _buildTip(String str) {
    return Container(
      alignment: Alignment.centerLeft,
      child: Text(str,
          style: GGTextStyle(
            color: GGColors.textMain.color,
            fontSize: GGFontSize.smallTitle,
            fontWeight: GGFontWeigh.regular,
          )),
    );
  }

  Widget _buildEmailStep1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildTip(localized('bind_email')),
        Gaps.vGap24,
        _buildEmailTF(),
        Gaps.vGap16,
        _buildEmailVerifyTF(),
      ],
    );
  }

  Widget _firstCodeWidget() {
    if (controller.state.isBindMobile.value) {
      return _buildOpt();
    } else {
      return _buildPasswordTF();
    }
  }

  /// 手机验证码
  Widget _buildOpt() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(localized('p_code'),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular,
            )),
        Gaps.vGap4,
        MobileVerificationCodeWidget(
          controller.state.mobileOpt,
          VerifyAction.bindEmail,
          isVoice: controller.state.isVoice,
          fullMobile: controller.state.fullMobileNo,
          onStatusChanged: controller.onVerificationStatusChanged,
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

  /// 成功之后的结果页
  Widget _buildSuccess(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          alignment: Alignment.center,
          child: Text(localized('auth_bound_email'),
              style: GGTextStyle(
                color: GGColors.textMain.color,
                fontSize: GGFontSize.smallTitle,
                fontWeight: GGFontWeigh.regular,
              )),
        ),
        Gaps.vGap36,
        Image.asset(
          R.iconBindSuccess,
          width: 92.dp,
          height: 84.dp,
          fit: BoxFit.contain,
        ),
        Gaps.vGap36,
        _buildTextSecond(localized('bounded_email_success')),
      ],
    );
  }

  void _onClickNext() async {
    controller.bindEmailSecond();
  }
}
