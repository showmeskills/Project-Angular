// ignore_for_file: unused_element

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/email_verification_code/email_verification_code_widget.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/mobile_verification_code/mobile_verification_code_widget.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:gogaming_app/common/components/util.dart';

import 'gaming_unbind_email_logic.dart';

class GamingUnbindEmailView extends BaseView<GamingUnbindEmailLogic> {
  const GamingUnbindEmailView({Key? key}) : super(key: key);

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const GamingUnbindEmailView(),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(title: localized('un_bind_email_ver'));
  }

  @override
  Widget body(BuildContext context) {
    return _contentWidget(context);
  }

  Widget _contentWidget(BuildContext context) {
    Get.put(GamingUnbindEmailLogic());
    return Container(
      width: double.infinity,
      color: GGColors.background.color,
      child: Obx(() {
        return Container(
          padding: EdgeInsets.only(
              left: 16.dp,
              top: 24.dp,
              right: 16.dp,
              bottom: Util.iphoneXBottom),
          child: Column(
            children: [
              _buildContent(context),
              Gaps.vGap30,
              const Spacer(),
              _buildBottomStep(context),
              Gaps.vGap24,
            ],
          ),
        );
      }),
    );
  }

  Widget verticalLine(int index) {
    return Container(
      width: 24.dp,
      alignment: Alignment.center,
      child: Container(
        width: 4.dp,
        height: 15.dp,
        color: controller.curIndex.value > index
            ? GGColors.brand.color
            : GGColors.border.color,
      ),
    );
  }

  Widget _buildStep(int index) {
    return Row(
      children: [
        Container(
          width: 24.dp,
          height: 24.dp,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: controller.curIndex.value >= index
                ? GGColors.brand.color
                : GGColors.border.color,
            borderRadius: BorderRadius.all(Radius.circular(12.0.dp)),
          ),
          child: Text('$index',
              style: GGTextStyle(
                color: controller.curIndex.value >= index
                    ? GGColors.textMain.color
                    : GGColors.textSecond.color,
                fontSize: GGFontSize.smallTitle,
                fontWeight: GGFontWeigh.regular,
              )),
        ),
        SizedBox(
          width: 16.dp,
        ),
        Text(
            index == 1
                ? localized('identification')
                : (index == 2
                    ? localized('enter_phone_label')
                    : localized('change_success_msg')),
            style: GGTextStyle(
              color: controller.curIndex.value >= index
                  ? GGColors.textMain.color
                  : GGColors.textSecond.color,
              fontSize: GGFontSize.smallTitle,
              fontWeight: GGFontWeigh.medium,
            )),
      ],
    );
  }

  Widget _buildContent(BuildContext context) {
    if (controller.curIndex.value == 1) {
      return _buildContent1();
    } else {
      return _buildSuccess(context);
    }
  }

  Widget _buildContent1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(localized('email_verification'),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular,
            )),
        Gaps.vGap4,
        _buildEmailTF(),
        Gaps.vGap16,
        Text(localized('p_code'),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular,
            )),
        SizedBox(
          height: 4.dp,
        ),
        MobileVerificationCodeWidget(
          controller.mobileOptController,
          VerifyAction.unBindEmail,
          isVoice: controller.isVoice,
          fullMobile: controller.fullMobile,
          onStatusChanged: controller.onVerificationStatusChanged,
        ),
        Gaps.vGap16,
      ],
    );
  }

  /// 邮箱验证码
  Widget _buildEmailTF() {
    return EmailVerificationCodeWidget(
      controller.emailOptController,
      VerifyAction.unBindEmail,
      // userInfo: info,
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
        // GamingPasswordTextField(
        //   controller: controller.passwordController,
        // ),
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

  Widget _buildSuccess(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.only(top: 160.dp),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildTip(localized('auth_unbound_email'),
              weight: GGFontWeigh.regular),
          Gaps.vGap30,
          Image.asset(
            R.iconBindSuccess,
            width: 92.dp,
            height: 84.dp,
            fit: BoxFit.contain,
          ),
          Gaps.vGap26,
          _buildTextSecond(localized('unbounded_email_success')),
        ],
      ),
    );
  }

  /// 提示
  Widget _buildTip(String str, {GGFontWeigh weight = GGFontWeigh.regular}) {
    return Container(
      alignment: Alignment.center,
      child: Text(str,
          style: GGTextStyle(
            color: GGColors.textMain.color,
            fontSize: GGFontSize.smallTitle,
            fontWeight: weight,
          )),
    );
  }

  Widget _buildTextSecond(String str) {
    return Text(str,
        style: GGTextStyle(
          color: GGColors.textSecond.color,
          fontSize: GGFontSize.content,
          fontWeight: GGFontWeigh.regular,
        ));
  }

  Widget _buildBottomStep(BuildContext context) {
    if (controller.curIndex.value == 1) {
      return SizedBox(
          width: MediaQuery.of(context).size.width,
          child: _buildNextStep(context));
    } else {
      return _buildBackBtn(context);
    }
  }

  /// 上一步
  Widget _buildPreStep() {
    return GestureDetector(
      onTap: () {
        /// 点击上一步
        controller.curIndex.value--;
      },
      child: Container(
        padding: EdgeInsets.only(left: 16.dp, right: 16.dp),
        height: 48.dp,
        width: double.infinity,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: GGColors.border.color,
          borderRadius: BorderRadius.all(Radius.circular(4.dp)),
        ),
        child: Text(localized('previous'),
            style: GGTextStyle(
              color: GGColors.textMain.color,
              fontSize: GGFontSize.smallTitle,
              fontWeight: GGFontWeigh.regular,
            )),
      ),
    );
  }

  Widget _buildNextStep(BuildContext context) {
    return GestureDetector(
      onTap: () {
        if (!controller.enableNext.value) return;
        _onClickNext();
      },
      child: Container(
        padding: EdgeInsets.only(left: 16.dp, right: 16.dp),
        height: 48.dp,
        width: double.infinity,
        child: GGButton(
          onPressed: _onClickNext,
          textStyle: GGTextStyle(
              fontSize: GGFontSize.content, fontWeight: GGFontWeigh.regular),
          enable: controller.enableNext.value,
          isLoading: controller.isLoading.value,
          text: localized('unbinding_button'),
        ),
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

  Widget _buildBackBtn(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(left: 16.dp, right: 16.dp),
      height: 48.dp,
      width: double.infinity,
      child: GGButton(
        onPressed: _onClickNext,
        textStyle: GGTextStyle(
            fontSize: GGFontSize.smallTitle, fontWeight: GGFontWeigh.regular),
        enable: true,
        isLoading: controller.isLoading.value,
        text: localized('return'),
      ),
    );
  }

  void _onClickNext() async {
    if (controller.curIndex.value == 1) {
      controller.unbindEmail();
    } else {
      Navigator.of(Get.overlayContext!).pop();
    }
  }
}
