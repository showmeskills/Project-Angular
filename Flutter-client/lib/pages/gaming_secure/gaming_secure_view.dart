// ignore_for_file: unused_import

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/country/models/gaming_country_model.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/widgets/email_verification_code/email_verification_code_widget.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/common/widgets/mobile_verification_code/mobile_verification_code_widget.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/gaming_secure/gaming_secure_state.dart';

import '../../common/api/auth/models/gaming_login_model.dart';
import '../../common/api/auth/models/verify_action.dart';
import '../../common/api/base/go_gaming_response.dart';
import '../../common/service/account_service.dart';
import '../../common/widgets/gaming_popup.dart';
import '../../common/widgets/gaming_text_filed/gaming_text_filed.dart';
import '../../common/widgets/gg_button.dart';
import '../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../base/base_view.dart';
import '../login/mobile_fill/mobile_fill_full_view.dart';
import 'gaming_secure_logic.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingSecurePage extends BaseView<GamingSecureLogic> {
  const GamingSecurePage(
      {Key? key,
      this.info,
      required this.action,
      required this.on2FaSuccess,
      this.fMobile = '',
      this.fEmail = '',
      this.country})
      : super(key: key);

  GamingSecureState get state => controller.state;
  final GamingLoginModel? info;
  final VerifyAction action;
  final String? fMobile;
  final String? fEmail;
  final GamingCountryModel? country;
  final void Function(String token) on2FaSuccess;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () {
        Map<String, dynamic> arguments = Get.arguments as Map<String, dynamic>;
        VerifyAction action;
        final curAction = arguments['otpType'];
        if (curAction is String) {
          action = VerifyActionExtension.convert(curAction);
        } else {
          action = curAction as VerifyAction;
        }
        GamingLoginModel? info = arguments['secureInfo'] as GamingLoginModel?;
        String fMobile = '';
        if (arguments.containsKey('fMobile')) {
          fMobile = arguments['fMobile'].toString();
        }
        String fEmail = '';
        if (arguments.containsKey('fEmail')) {
          fEmail = arguments['fEmail'].toString();
        }

        GamingCountryModel? country =
            arguments['country'] as GamingCountryModel?;
        return GamingSecurePage(
            info: info,
            action: action,
            fMobile: fMobile,
            fEmail: fEmail,
            country: country,
            on2FaSuccess:
                arguments['on2FaSuccess'] as void Function(String token));
      },
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(GamingSecureLogic(action, info: info));

    if (fMobile!.isNotEmpty && !fMobile!.contains('*')) {
      controller.fullMobileNo?.value = fMobile ?? '';
    }

    if (fEmail!.isNotEmpty && !fEmail!.contains('*')) {
      controller.fullEmailNo?.value = fEmail ?? '';
    }

    return SingleChildScrollView(
      child: SizedBox(
        height: MediaQuery.of(context).size.height - 115.dp - Util.bottomMargin,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: 30.dp),
            inset(_buildTitle1()),
            SizedBox(height: 12.dp),
            inset(_buildTitle2()),
            SizedBox(height: 36.dp),
            inset(_buildTitleWidget()),
            _buildMobileTF(),
            _buildGoogleTF(),
            _buildEmailTF(),
            SizedBox(
              height: 16.dp,
            ),
            inset(Obx(() {
              return _buildChangeMode();
            })),
            SizedBox(
              height: 16.dp,
            ),
            inset(_buildSubmit(context)),
            SizedBox(height: 36.dp),
            // inset(_buildCantGetCode()),
          ],
        ),
      ),
    );
  }

  /// 手机验证码
  Widget _buildMobileTF() {
    return Obx(() {
      return inset(
        controller.curVerifyType.value == 1
            ? MobileVerificationCodeWidget(
                controller.mobileOptController,
                action,
                isVoice: controller.isVoice,
                fullMobile: controller.fullMobileNo,
                userInfo: info,
                country: () {
                  return country;
                },
              )
            : Container(),
      );
    });
  }

  /// 谷歌验证码
  Widget _buildGoogleTF() {
    return Obx(() {
      return Visibility(
          visible: controller.curVerifyType.value == 2,
          child: Column(
            children: [
              SizedBox(height: 4.dp),
              inset(GamingTextField(
                controller: controller.googleVerificationCode,
                dismissClearIcon: true,
                keyboardType: TextInputType.number,
              )),
              SizedBox(height: 4.dp),
              inset(_buildTips()),
            ],
          ));
    });
  }

  /// 邮箱验证码
  Widget _buildEmailTF() {
    return Obx(() {
      return inset(
        controller.curVerifyType.value == 3
            ? EmailVerificationCodeWidget(
                controller.emailController,
                action,
                fullEmail: controller.fullEmailNo,
                userInfo: info,
              )
            : Container(),
      );
    });
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

  Widget _buildSubmit(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(top: 20.dp),
      width: double.infinity,
      child: Obx(() {
        return GGButton(
          onPressed: () async {
            controller.submit(on2FaSuccess);
          },
          enable: controller.buttonEnable.value,
          isLoading: controller.isLoading.value,
          text: getLocalString('submit'),
        );
      }),
    );
  }

  Widget _buildTitle1() {
    return Row(
      children: [
        Text(
          localized('security_veri'),
          style: GGTextStyle(
            fontSize: GGFontSize.superBigTitle,
            fontWeight: GGFontWeigh.bold,
            color: GGColors.textMain.color,
          ),
        ),
      ],
    );
  }

  Widget _buildTitle2() {
    return Row(
      children: [
        Expanded(
          child: Text(
            localized('safe_infos'),
            style: GGTextStyle(
              fontSize: GGFontSize.smallTitle,
              fontWeight: GGFontWeigh.regular,
              color: GGColors.textSecond.color,
            ),
          ),
        ),
      ],
    );
  }

  /// 输入框下面的提示语
  Widget _buildTips() {
    return Row(
      children: [
        Expanded(
          child: Text(
            localized('enter_google_code'),
            style: GGTextStyle(
              fontSize: GGFontSize.hint,
              fontWeight: GGFontWeigh.regular,
              color: GGColors.textSecond.color,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTitleWidget() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Obx(() => Text(
              controller.showMobileOpt()
                  ? localized('p_code')
                  : controller.showGoogleOpt()
                      ? localized('google_code')
                      : localized('email_verification'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                fontWeight: GGFontWeigh.regular,
                color: GGColors.textMain.color,
              ),
            ))
      ],
    );
  }

  Widget _buildChangeMode() {
    if (controller.allType.value == 1) {
      // 只有一种验证方式，不需要切换
      return Container();
    } else if (controller.allType.value == 2) {
      // 2种验证方式。只需要切换一次
      if (controller.curVerifyType.value == 1) {
        //当前是手机验证
        return controller.canUseEmailOpt()
            ? _buildEmailLink()
            : _buildGoogleLink();
      } else if (controller.curVerifyType.value == 2) {
        //当前是谷歌验证
        return controller.canUseEmailOpt()
            ? _buildEmailLink()
            : _buildMobileLink();
      } else if (controller.curVerifyType.value == 3) {
        //当前是邮箱验证
        return controller.canUseGoogleOpt()
            ? _buildGoogleLink()
            : _buildMobileLink();
      }
    } else {
      // 三种都支持
      return Row(
        children: [
          _buildMobileLink(),
          Visibility(
            visible: controller.curVerifyType.value != 1,
            child: _buildOr(),
          ),
          _buildGoogleLink(),
          Visibility(
            visible: controller.curVerifyType.value == 1,
            child: _buildOr(),
          ),
          _buildEmailLink(),
        ],
      );
    }
    return Container();
  }

  Widget _buildOr() {
    return Text(
      localized('or'),
      style: GGTextStyle(
        fontSize: GGFontSize.hint,
        fontWeight: GGFontWeigh.regular,
        color: GGColors.textSecond.color,
      ),
    );
  }

  // 切换到手机
  Widget _buildMobileLink() {
    return Visibility(
      visible:
          controller.canUseMobileOpt() && controller.curVerifyType.value != 1,
      child: InkWell(
        onTap: () {
          controller.curVerifyType.value = 1;
        },
        child: Text(
          localized('swtich_phone'),
          style: GGTextStyle(
            fontSize: GGFontSize.hint,
            fontWeight: GGFontWeigh.regular,
            color: GGColors.link.color,
          ),
        ),
      ),
    );
  }

  // 切换到谷歌
  Widget _buildGoogleLink() {
    return Visibility(
      visible:
          controller.canUseGoogleOpt() && controller.curVerifyType.value != 2,
      child: InkWell(
        onTap: () {
          controller.curVerifyType.value = 2;
        },
        child: Text(
          localized('switch_google_auth'),
          style: GGTextStyle(
            fontSize: GGFontSize.hint,
            fontWeight: GGFontWeigh.regular,
            color: GGColors.link.color,
          ),
        ),
      ),
    );
  }

  // 切换到邮箱
  Widget _buildEmailLink() {
    return Visibility(
      visible:
          controller.canUseEmailOpt() && controller.curVerifyType.value != 3,
      child: InkWell(
        onTap: () {
          controller.curVerifyType.value = 3;
        },
        child: Text(
          localized('switch_email_auth'),
          style: GGTextStyle(
            fontSize: GGFontSize.hint,
            fontWeight: GGFontWeigh.regular,
            color: GGColors.link.color,
          ),
        ),
      ),
    );
  }
}
