import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/service/h5_webview_manager.dart';
import 'package:gogaming_app/common/widgets/gaming_check_box.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/register/views/register_phone_view.dart';
import 'package:gogaming_app/widget_header.dart';

import 'social_register_phone_logic.dart';

class SocialRegisterPhonePage extends BaseView<SocialRegisterPhoneLogic> {
  const SocialRegisterPhonePage({
    super.key,
    required this.socialUserType,
    required this.socialUserId,
  });
  final String socialUserType;
  final String socialUserId;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => SocialRegisterPhonePage.argument(
          Get.arguments as Map<String, dynamic>),
    );
  }

  factory SocialRegisterPhonePage.argument(Map<String, dynamic> arguments) {
    final String socialUserType = arguments['socialUserType'] as String;
    final String socialUserId = arguments['socialUserId'] as String;

    return SocialRegisterPhonePage(
      socialUserId: socialUserId,
      socialUserType: socialUserType,
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(SocialRegisterPhoneLogic(socialUserType, socialUserId));
    return Container(
      padding: EdgeInsets.only(left: 20.dp, right: 20.dp),
      child: Column(
        mainAxisSize: MainAxisSize.max,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(height: 60.dp),
          _buildTitle1(),
          SizedBox(height: 32.dp),
          Expanded(
            child: SingleChildScrollView(
              child: RegisterPhoneView(
                controller: controller,
                buildFooter: _buildFooter(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildFooter() {
    return [
      _buildRefer(),
      _buildReferInput(),
      _buildCheckService(),
      _buildRegisterButton(),
      Gaps.vGap20,
    ];
  }

  Widget _buildRegisterButton() {
    return Container(
      margin: EdgeInsets.only(top: 24.dp),
      width: double.infinity,
      child: Obx(() {
        return GGButton.main(
          onPressed: _onPressRegister,
          enable: controller.registerButtonEnable.value,
          isLoading: controller.isLoadingUser.value,
          text: controller.getLocalString('register_button'),
        );
      }),
    );
  }

  Widget _buildCheckService() {
    return InkWell(
      highlightColor: Colors.transparent, // 长按时的扩散效果设置为透明
      onTap: _revertCheckService,
      child: Container(
        margin: EdgeInsets.only(top: 19.dp),
        child: Row(
          children: [
            Obx(() {
              return IgnorePointer(
                child: GamingCheckBox(
                  value: controller.checkboxSelected.value,
                  size: 18.dp,
                  activeColor: GGColors.brand.color,
                  onChanged: (v) {},
                ),
              );
            }),
            Container(
              margin: EdgeInsets.only(left: 8.dp),
              child: Text(
                controller.getLocalString('agree'),
                style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                    fontWeight: GGFontWeigh.regular),
              ),
            ),
            InkWell(
              onTap: _onPressServiceLink,
              child: Container(
                margin: EdgeInsets.only(left: 4.dp),
                child: Text(
                  controller.getLocalString('terms'),
                  style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.link.color,
                      fontWeight: GGFontWeigh.regular),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReferInput() {
    return Obx(() {
      return Visibility(
        visible: controller.showReferrerUser.value,
        child: GamingTextField(
          controller: controller.referrer,
          fillColor: GGColors.alertBackground,
        ),
      );
    });
  }

  Widget _buildRefer() {
    return Obx(() {
      if (controller.referrerCode.isNotEmpty) {
        return Container();
      }
      return Container(
        margin: EdgeInsets.only(top: 24.dp, bottom: 5.dp),
        child: GestureDetector(
          onTap: () {
            controller.showReferrerUser.value =
                !controller.showReferrerUser.value;
          },
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                '${controller.getLocalString('referrer_id')}(${controller.getLocalString('optional')})',
                style: TextStyle(
                  color: GGColors.textSecond.color,
                  fontSize: GGFontSize.content.fontSize,
                  fontFamily: GGFontFamily.c().fontFamily,
                ),
              ),
              Container(
                margin: EdgeInsets.only(left: 5.dp),
                child: controller.showReferrerUser.value
                    ? SvgPicture.asset(
                        R.iconUp,
                      )
                    : SvgPicture.asset(
                        R.iconDown,
                      ),
              ),
            ],
          ),
        ),
      );
    });
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

extension _Action on SocialRegisterPhonePage {
  void _onPressRegister() {
    controller.socialRegister();
  }

  void _onPressServiceLink() {
    H5WebViewManager.sharedInstance.openWebView(
      url: controller.termsUrl.value,
      title: controller.getLocalString('terms'),
    );
  }

  void _revertCheckService() {
    controller.checkboxSelected.value = !controller.checkboxSelected.value;
  }
}
