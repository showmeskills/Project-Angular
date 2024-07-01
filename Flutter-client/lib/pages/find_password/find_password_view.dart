import 'package:base_framework/base_framework.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/widgets/email_verification_code/email_verification_code_widget.dart';
import 'package:gogaming_app/common/widgets/mobile_verification_code/mobile_verification_code_widget.dart';
import 'package:gogaming_app/config/gaps.dart';

import '../../common/lang/locale_lang.dart';
import '../../common/theme/colors/go_gaming_colors.dart';
import '../../common/theme/text_styles/gg_text_styles.dart';
import '../../common/widgets/gaming_country_selector/gaming_country_selector.dart';
import '../../common/widgets/gaming_text_filed/gaming_text_filed.dart';
import '../../common/widgets/gg_button.dart';
import '../base/base_view.dart';
import 'find_password_logic.dart';
import 'find_password_state.dart';
import 'package:base_framework/base_controller.dart';

class FindPasswordPage extends BaseView<FindPasswordLogic> {
  const FindPasswordPage({Key? key}) : super(key: key);

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const FindPasswordPage(),
    );
  }

  FindPasswordState get state => controller.state;

  @override
  Widget body(BuildContext context) {
    Get.put(FindPasswordLogic());
    return SingleChildScrollView(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(height: 60.dp),
          inset(_buildTitle1()),
          SizedBox(height: 16.dp),
          Gaps.vGap32,
          inset(_buildTabBar(), start: 24.dp),
          Gaps.vGap16,
          inset(_buildTitle2()),
          SizedBox(height: 16.dp),
          inset(_buildTitle3()),
          SizedBox(height: 48.dp),
          inset(Obx(() {
            return _buildNumberView();
          })),
          SizedBox(height: 24.dp),
          inset(Obx(() {
            return _buildOptView();
          })),
          SizedBox(height: 15.dp),
          SizedBox(height: 24.dp),
          inset(_buildSubmitButton()),
        ],
      ),
    );
  }

  Widget _buildNumberView() {
    return controller.curType.value == CurType.email
        ? _buildEmailView()
        : _buildMobileView();
  }

  Widget _buildOptView() {
    return controller.curType.value == CurType.email
        ? _buildEmailCodeView()
        : _buildCodeView();
  }

  /// 邮箱输入框
  Widget _buildEmailView() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildTitle(localized('email')),
        SizedBox(height: 8.dp),
        _buildEmailTF(),
      ],
    );
  }

  Widget _buildEmailTF() {
    return GamingTextField(
      controller: state.email,
      enabled: true,
    );
  }

  /// 邮箱验证码
  Widget _buildEmailCodeView() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildTitle(localized('email_verification')),
        SizedBox(height: 8.dp),
        EmailVerificationCodeWidget(
          state.emailCode,
          VerifyAction.resetPwd,
          fullEmailController: state.email,
          showNoReceiveEmail: false,
          onStatusChanged: controller.onEmailVerificationStatusChanged,
        ),
      ],
    );
  }

  /// 手机号输入
  Widget _buildMobileView() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildTitle(localized('phone_tab')),
        SizedBox(height: 8.dp),
        _buildMobileTF(),
      ],
    );
  }

  /// 短信验证码
  Widget _buildCodeView() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildTitle(localized('sms_code')),
        SizedBox(height: 8.dp),
        MobileVerificationCodeWidget(
          state.code,
          VerifyAction.resetPwd,
          isVoice: state.smsVoice,
          fullMobileController: state.mobile,
          onStatusChanged: controller.onMobileVerificationStatusChanged,
          country: () {
            return state.country;
          },
        ),
      ],
    );
  }

  Widget _buildMobileTF() {
    return Row(
      children: [
        GamingCountrySelector(
          background: GGColors.alertBackground.color,
          onChanged: (country) {
            if (country != null) {
              state.country = country;
            }
          },
        ),
        SizedBox(width: 8.dp),
        Expanded(
          child: GamingTextField(
            fillColor: GGColors.alertBackground,
            controller: state.mobile,
            keyboardType: TextInputType.number,
            inputFormatters: [
              FilteringTextInputFormatter.allow(RegExp(r'[0-9]')),
            ],
          ),
        )
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

  Widget _buildSubmitButton() {
    return Obx(() {
      return SizedBox(
        width: double.infinity,
        child: GGButton(
          onPressed: () => controller.submit(),
          enable: controller.submitEnable.value,
          isLoading: false,
          text: getLocalString('submit'),
        ),
      );
    });
  }

  Widget _buildTitle3() {
    return Row(
      children: [
        Expanded(child: Obx(() {
          return RichText(
              text: TextSpan(
                  text: controller.curType.value == CurType.email
                      ? localized('customer_retrieve_email_00')
                      : localized('customer_retrieve_password_00'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.smallTitle,
                    color: GGColors.textSecond.color,
                  ),
                  children: [
                TextSpan(
                    text: ' ${localized('online_cs').toLowerCase()} ',
                    style: GGTextStyle(
                      fontSize: GGFontSize.smallTitle,
                      color: GGColors.highlightButton.color,
                    ),
                    recognizer: state.contactServiceRecognizer
                      ..onTap = () {
                        controller.contactService();
                      }),
                TextSpan(
                  text: localized('to_retrieve'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.smallTitle,
                    fontWeight: GGFontWeigh.regular,
                    color: GGColors.textSecond.color,
                  ),
                )
              ]));
        })),
      ],
    );
  }

  Widget _buildTitle2() {
    return Obx(() {
      return Row(
        children: [
          Expanded(
            child: Text(
              controller.curType.value == CurType.email
                  ? localized('email_retrieve_password')
                  : localized('phone_retrieve_password'),
              style: GGTextStyle(
                fontSize: GGFontSize.smallTitle,
                color: GGColors.textSecond.color,
              ),
            ),
          ),
        ],
      );
    });
  }

  Widget _buildTabBar() {
    return Obx(() {
      final titles = ["email", "phone_tab"];
      return TabBar(
        controller: controller.tabController,
        isScrollable: true,
        overlayColor: MaterialStateProperty.all<Color>(Colors.transparent),
        indicator: const BoxDecoration(),
        indicatorWeight: 0,
        labelPadding: EdgeInsets.zero,
        tabs: titles
            .map(
              (e) => Tab(
                height: 36.dp,
                child: Container(
                  height: 36.dp,
                  margin: EdgeInsets.only(right: 24.dp),
                  constraints: BoxConstraints(minWidth: 62.dp),
                  padding: EdgeInsets.symmetric(horizontal: 8.dp),
                  decoration: BoxDecoration(
                    color: e.contains(
                            controller.curType.value.toString().split('.')[1])
                        ? GGColors.tabBarHighlightButton.color
                        : null, // 底色
                    borderRadius: BorderRadius.circular((4.dp)),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    localized(e),
                    style: TextStyle(
                      color: e.contains(
                              controller.curType.value.toString().split('.')[1])
                          ? GGColors.textMain.color
                          : GGColors.textSecond.color,
                      fontSize: GGFontSize.content.fontSize,
                    ),
                  ),
                ),
              ),
            )
            .toList(),
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
