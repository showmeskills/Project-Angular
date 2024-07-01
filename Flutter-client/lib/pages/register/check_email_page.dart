import 'package:flutter/cupertino.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';

import '../../common/api/base/base_api.dart';
import '../../common/theme/colors/go_gaming_colors.dart';
import '../../common/theme/text_styles/gg_text_styles.dart';
import '../../common/widgets/gg_button.dart';
import '../../config/gaps.dart';
import '../../generated/r.dart';
import '../base/base_view.dart';
import 'check_email_logic.dart';

class CheckEmailPage extends BaseView<CheckEmailLogic> {
  const CheckEmailPage({
    Key? key,
    this.email = '',
    this.onSubmitted,
  }) : super(key: key);
  final String email;
  final void Function(String)? onSubmitted;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () {
        Map<String, dynamic> arguments = Get.arguments as Map<String, dynamic>;
        String email = arguments['email'].toString();
        return CheckEmailPage(
            email: email,
            onSubmitted:
                arguments['onSubmitted'] as void Function(String optCode));
      },
    );
  }

  @override
  Widget body(BuildContext context) {
    final controller = Get.put(CheckEmailLogic());
    controller.email = email;
    return Container(
      margin: EdgeInsets.only(top: 30.dp),
      padding: EdgeInsets.only(left: 20.dp, right: 20.dp),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            localized('email_verification'),
            style: TextStyle(
                color: GGColors.textMain.color,
                fontSize: GGFontSize.superBigTitle.fontSize,
                fontFamily: GGFontFamily.c().fontFamily,
                fontWeight: FontWeight.bold),
          ),
          Container(
            margin: EdgeInsets.only(top: 10.dp, bottom: 40.dp),
            child: Text(
              "${localized('enter_email')}$email${localized('valid_time')}",
              style: TextStyle(
                color: GGColors.textSecond.color,
                fontSize: GGFontSize.smallTitle.fontSize,
                fontFamily: GGFontFamily.c().fontFamily,
              ),
            ),
          ),
          Container(
            margin: EdgeInsets.only(top: 10.dp, bottom: 5.dp),
            child: Text(
              localized('email_verification'),
              style: TextStyle(
                color: GGColors.textSecond.color,
                fontSize: GGFontSize.content.fontSize,
                fontFamily: GGFontFamily.c().fontFamily,
              ),
            ),
          ),
          CheckPhoneTextField(
            controller: controller.checkEmail,
            onCheckPhone: () {
              switch (controller.codeState.value) {
                case CodeState.send:
                  break;
                case CodeState.unSend:
                  controller.sendEmailCheck();
                  break;
                case CodeState.reSend:
                  controller.sendEmailCheck();
                  break;
              }
            },
            checkPhoneSendWidget: Obx(() {
              return _getCheckEmailSendWidget();
            }),
          ),
          Container(
            margin: EdgeInsets.only(top: 40.dp),
            width: double.infinity,
            child: Obx(() {
              return GGButton(
                onPressed: () {
                  if (onSubmitted != null) {
                    onSubmitted!(controller.checkEmail.text.value);
                  }
                },
                enable: controller.buttonEnable.value,
                isLoading: false,
                text: localized('sub'),
              );
            }),
          ),
          Gaps.vGap24,
          _getEmailSmsDialogClickContent(),
        ],
      ),
    );
  }

  Widget _getEmailSmsDialogClickContent() {
    return GestureDetector(
      onTap: () {
        DialogUtil(
            context: Get.context!,
            iconHeight: 60.dp,
            iconWidth: 52.dp,
            contentMaxLine: 10,
            contentAlign: TextAlign.start,
            iconPath: R.iconNoEmailCode,
            title: localized('no_rece'),
            leftBtnName: "",
            content:
                '${localized('email_ver_code00')}:\n1.${localized('email_ver_code01')}\n2.${localized('email_ver_code02', params: [
                  email
                ])}\n3.${localized('email_ver_code03')}\n4.${localized("email_ver_code04")}',
            onRightBtnPressed: () {
              Get.back<dynamic>();
            }).showNoticeDialogWithTwoButtons();
      },
      child: Text(
        getLocalString('null'),
        style: GGTextStyle(
            fontSize: GGFontSize.content, color: GGColors.link.color),
      ),
    );
  }

  Widget _getCheckEmailSendWidget() {
    switch (controller.codeState.value) {
      case CodeState.unSend:
        return Text(
          localized('get_verification_code_button'),
          style: GGTextStyle(
              color: GGColors.brand.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular),
        );
      case CodeState.reSend:
        return Text(
          localized('resend'),
          style: GGTextStyle(
              color: GGColors.brand.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular),
        );
      case CodeState.send:
        return Text(
          controller.secondLeft.value.toString() + localized('resend_info_app'),
          style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular),
        );
    }
  }
}
