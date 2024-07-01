// ignore_for_file: unused_element

import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';
import 'package:gogaming_app/common/theme/text_styles/gg_text_styles.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/mobile_verification_code/mobile_verification_code_widget.dart';
import 'package:gogaming_app/config/gaps.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/gaming_secure/gaming_bind_mobile/bind_mobile_view.dart';

import 'gaming_bind_mobile_logic.dart';

class GamingBindMobilePage extends BaseView<GamingBindMobileLogic> {
  const GamingBindMobilePage({
    Key? key,
    this.isChange = false,
    this.onSuccess,
  }) : super(key: key);

  final bool isChange;
  final VoidCallback? onSuccess;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => GamingBindMobilePage.argument(
        Get.arguments as Map<String, dynamic>? ?? {},
      ),
    );
  }

  factory GamingBindMobilePage.argument(Map<String, dynamic> arguments) {
    final onSuccess = arguments['onSuccess'];
    if (onSuccess != null && onSuccess is VoidCallback) {
      return GamingBindMobilePage(
        onSuccess: onSuccess,
      );
    }
    return const GamingBindMobilePage();
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
        title: isChange ? localized('change_p') : localized('bound_phone'));
  }

  @override
  Widget body(BuildContext context) {
    Get.put(GamingBindMobileLogic());
    return _contentWidget(context);
  }

  Widget _contentWidget(BuildContext context) {
    return Container(
      width: double.infinity,
      color: GGColors.background.color,
      child: Obx(() {
        return SingleChildScrollView(
          child: Container(
            padding: EdgeInsets.only(left: 16.dp, top: 24.dp, right: 16.dp),
            height:
                MediaQuery.of(context).size.height - 115.dp - Util.bottomMargin,
            child: Column(
              children: [
                /// 步骤
                _buildSteps(),
                Gaps.vGap30,
                _buildContent(context),
                Gaps.vGap30,
                const Spacer(),
                // 下一步
                Obx(() {
                  return _buildNextStep(context);
                }),
                Gaps.vGap24,
              ],
            ),
          ),
        );
      }), //GGColors.popBackground.color, // Colors.red, //
    );
  }

  void _onClickNext() async {
    controller.bindMobile();
  }

  Widget _buildContent(BuildContext context) {
    if (controller.curIndex.value == 1) {
      // return _buildPassword();
      return _buildOpt();
    } else {
      // return _buildOpt();
      return _buildSuccess(context);
    }
  }

  Widget _buildSuccess(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _buildTip(localized('bound_success')),
        Gaps.vGap36,
        Image.asset(
          R.iconBindSuccess,
          width: 92.dp,
          height: 84.dp,
          fit: BoxFit.contain,
        ),
        Gaps.vGap36,
        _buildTextSecond(localized('bounded_success')),
      ],
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

  Widget _buildOpt() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildTip(localized('please_input_your_mobile_and_code')),
        _buildMobileCode(),
        Gaps.vGap30,

        MobileVerificationCodeWidget(
          controller.mobileOpt,
          VerifyAction.bindMobile,
          isVoice: controller.smsVoice,
          fullMobileController: controller.mobile,
          onStatusChanged: controller.onVerificationStatusChanged,
          country: () {
            return controller.country;
          },
        ),
        Gaps.vGap4,

        Gaps.vGap24,
        // _buildCantGetCode(),
      ],
    );
  }

  Widget _buildMobileCode() {
    return BindMobileView(
      mobile: controller.mobile,
      onCountryChanged: controller.onCountryChanged,
    );
  }

  Widget _buildPassword() {
    return Column(
      children: [
        _buildTip(localized('bound_veri')),
        SizedBox(
          height: 30.dp,
        ),
        _buildPasswordTF(),
        SizedBox(
          height: 30.dp,
        ),
        if (controller.needGoogleVerify.value) _buildGoogleVerifyTF(),
        if (controller.needGoogleVerify.value)
          SizedBox(
            height: 30.dp,
          ),
      ],
    );
  }

  Widget _buildNextStep(BuildContext context) {
    return controller.curIndex.value == 2
        ? _buildBackBtn(context)
        : Obx(() {
            return GestureDetector(
              onTap: () {
                /// 点击下一步
                if (controller.enableNext.value) {
                  _onClickNext();
                }
              },
              child: Container(
                padding: EdgeInsets.only(left: 16.dp, right: 16.dp),
                height: 48.dp,
                width: double.infinity,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: controller.enableNext.value
                      ? GGColors.highlightButton.color
                      : GGColors.highlightButton.color.withOpacity(0.5),
                  borderRadius: BorderRadius.all(Radius.circular(4.dp)),
                ),
                child: Text(localized('next'),
                    style: GGTextStyle(
                      color: controller.enableNext.value
                          ? GGColors.buttonTextWhite.color
                          : GGColors.buttonTextWhite.color.withOpacity(0.5),
                      fontSize: GGFontSize.smallTitle,
                      fontWeight: GGFontWeigh.regular,
                    )),
              ),
            );
          });
  }

  Widget _buildBackBtn(BuildContext context) {
    return GestureDetector(
      onTap: () {
        if (onSuccess != null) {
          onSuccess?.call();
        } else {
          Navigator.of(context).pop();
        }
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
        child: Text(
          localized('return'),
          style: GGTextStyle(
            color: GGColors.buttonTextWhite.color,
            fontSize: GGFontSize.smallTitle,
            fontWeight: GGFontWeigh.regular,
          ),
        ),
      ),
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
              fontWeight: GGFontWeigh.medium,
            )),
        SizedBox(
          height: 4.dp,
        ),
        GamingPasswordTextField(
          controller: controller.passwordController,
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

  /// 谷歌验证码
  Widget _buildGoogleVerifyTF() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(localized('google_code'),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.medium,
            )),
        SizedBox(
          height: 4.dp,
        ),
        GamingPasswordTextField(
          controller: controller.googleVerifyController,
        ),
        SizedBox(
          height: 3.dp,
        ),
        Text(localized('enter_google_code'),
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
      alignment: Alignment.center,
      child: Text(str,
          style: GGTextStyle(
            color: GGColors.textMain.color,
            fontSize: GGFontSize.smallTitle,
            fontWeight: GGFontWeigh.regular,
          )),
    );
  }

  /// 第几步
  Widget _buildSteps() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          height: 8.dp,
        ),
        _buildStep(1),
        SizedBox(
          height: 8.dp,
        ),
        verticalLine(2),
        SizedBox(
          height: 8.dp,
        ),
        _buildStep(2)
      ],
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
                    ? GGColors.buttonTextWhite.color
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
                ? isChange
                    ? localized('change_p')
                    : localized('enter_phone_label')
                : isChange
                    ? localized('change_success_msg')
                    : localized('bind_succ'),
            style: GGTextStyle(
              color: controller.curIndex.value >= index
                  ? GGColors.textMain.color
                  : GGColors.textSecond.color,
              fontSize: GGFontSize.smallTitle,
              fontWeight: GGFontWeigh.regular,
            )),
      ],
    );
  }

  Widget _buildTitle(BuildContext context) {
    return Row(
      children: [
        SizedBox(
          width: 16.dp,
        ),
        GestureDetector(
          onTap: () {
            Navigator.of(context).pop();
          },
          child: SvgPicture.asset(
            R.iconAppbarLeftLeading,
            width: 18.dp,
            height: 18.dp,
            color: GGColors.textMain.color,
            fit: BoxFit.contain,
          ),
        ),
        SizedBox(
          width: 2.dp,
        ),
        Text(isChange ? localized('change_p') : localized('bound_phone'),
            style: GGTextStyle(
              color: GGColors.textMain.color,
              fontSize: GGFontSize.bigTitle20,
              fontWeight: GGFontWeigh.regular,
            )),
      ],
    );
  }
}
