import 'package:flutter/cupertino.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';

import '../../common/api/base/base_api.dart';
import '../../common/theme/colors/go_gaming_colors.dart';
import '../../common/theme/text_styles/gg_text_styles.dart';
import '../../common/widgets/appbar/appbar.dart';
import '../../common/widgets/gg_button.dart';
import '../../generated/r.dart';
import '../base/base_view.dart';
import 'check_phone_logic.dart';

class CheckPhonePage extends BaseView<CheckPhoneLogic> {
  const CheckPhonePage({
    Key? key,
    this.mobile = '',
    this.areaCode = '',
    this.onSubmitted,
  }) : super(key: key);
  final String mobile;
  final String areaCode;
  final void Function(String)? onSubmitted;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () {
        Map<String, dynamic> arguments = Get.arguments as Map<String, dynamic>;
        String mobile = arguments['mobile'].toString();
        String areaCode = arguments['areaCode'].toString();
        return CheckPhonePage(
            mobile: mobile,
            areaCode: areaCode,
            onSubmitted:
                arguments['onSubmitted'] as void Function(String optCode));
      },
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
    final controller = Get.put(CheckPhoneLogic());
    controller.mobile = mobile;
    controller.areaCode = areaCode;
    return Container(
      margin: EdgeInsets.only(top: 30.dp),
      padding: EdgeInsets.only(left: 20.dp, right: 20.dp),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            getLocalString('phone_verification'),
            style: TextStyle(
                color: GGColors.textMain.color,
                fontSize: GGFontSize.superBigTitle.fontSize,
                fontFamily: GGFontFamily.c().fontFamily,
                fontWeight: FontWeight.bold),
          ),
          Container(
            margin: EdgeInsets.only(top: 10.dp, bottom: 40.dp),
            child: Text(
              "${getLocalString('enter_phones')}$areaCode ${controller.encryptedMobileNo(mobile)}${getLocalString('valid_time')}",
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
              getLocalString('sms_code'),
              style: TextStyle(
                color: GGColors.textSecond.color,
                fontSize: GGFontSize.content.fontSize,
                fontFamily: GGFontFamily.c().fontFamily,
              ),
            ),
          ),
          CheckPhoneTextField(
            controller: controller.checkPhone,
            onCheckPhone: () {
              switch (controller.phoneCodeState.value) {
                case PhoneCodeState.send:
                  break;
                case PhoneCodeState.unSend:
                  controller.sendPhoneCheck();
                  break;
                case PhoneCodeState.reSend:
                  controller.sendPhoneCheck();
                  break;
              }
            },
            checkPhoneSendWidget: Obx(() {
              return getCheckPhoneSendWidget();
            }),
          ),
          Obx(() {
            return Container(
                margin: EdgeInsets.only(top: 15.dp), child: _getTips());
          }),
          Container(
            margin: EdgeInsets.only(top: 40.dp),
            width: double.infinity,
            child: Obx(() {
              return GGButton(
                onPressed: () {
                  if (onSubmitted != null) {
                    onSubmitted!(controller.checkPhone.text.value);
                  }
                },
                enable: controller.buttonEnable.value,
                isLoading: false,
                text: getLocalString('sub'),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _getVoiceSmsDialogClickContent() {
    return GestureDetector(
      onTap: () {
        DialogUtil(
            context: Get.context!,
            iconHeight: 80.dp,
            iconWidth: 70.dp,
            contentMaxLine: 6,
            contentAlign: TextAlign.start,
            iconPath: R.iconNoRegisterCode,
            title: getLocalString('sms_ver_code00'),
            content:
                '${getLocalString('sms_ver_code01')}:\n1.${getLocalString('sms_ver_code02')}\n2.${getLocalString('sms_ver_code03')}\n3.${getLocalString('sms_ver_code04')}',
            onLeftBtnPressed: () {
              Get.back<dynamic>();
            },
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

  Widget _getTips() {
    switch (controller.phoneCodeState.value) {
      case PhoneCodeState.send:
        return _getVoiceSmsDialogClickContent();
      case PhoneCodeState.reSend:
        return Row(
          children: [
            _getVoiceSmsDialogClickContent(),
            Text(
              getLocalString('sms_info'),
              style: GGTextStyle(
                  fontSize: GGFontSize.content, color: GGColors.textMain.color),
            ),
            GestureDetector(
              onTap: () {
                controller.sendPhoneCheck(isVoice: true);
              },
              child: Container(
                margin: EdgeInsets.only(left: 5.dp),
                child: Text(
                  getLocalString('null_t'),
                  style: GGTextStyle(
                      fontSize: GGFontSize.content, color: GGColors.link.color),
                ),
              ),
            ),
          ],
        );
      case PhoneCodeState.unSend:
        return Container();
    }
  }

  Widget getCheckPhoneSendWidget() {
    switch (controller.phoneCodeState.value) {
      case PhoneCodeState.unSend:
        return Text(
          getLocalString('get_verification_code_button'),
          style: GGTextStyle(
              color: GGColors.brand.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular),
        );
      case PhoneCodeState.reSend:
        return Text(
          getLocalString('resend'),
          style: GGTextStyle(
              color: GGColors.brand.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular),
        );
      case PhoneCodeState.send:
        return Text(
          controller.secondLeft.value.toString() +
              getLocalString('resend_info_app'),
          style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular),
        );
    }
  }
}
