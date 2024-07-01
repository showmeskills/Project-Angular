import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/login/mobile_fill/mobile_fill_full_logic.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:otp_text_field/otp_text_field.dart';
import 'package:otp_text_field/style.dart';

/// 手机后六位填充
///
///     MobileFillFullView(
///       encryptedMobileNo: '15122******',
///       areaCode: '+86',
///       callBack: (mobileNumber) {
///         debugPrint('MobileFillFullView callback: $mobileNumber');
///       },
///     ).showFillFullDialog();
class MobileFillFullView extends StatelessWidget {
  const MobileFillFullView({
    Key? key,
    required this.encryptedMobileNo,
    required this.areaCode,
    required this.callBack,
  }) : super(key: key);

  /// 后六位***加密的手机号码: 15012******
  final String encryptedMobileNo;

  /// 手机区号'+86'
  final String areaCode;

  /// 点击确定后返回完整的手机号码
  final void Function(String fullMobileNo) callBack;

  void showFillFullDialog() async {
    Get.dialog<dynamic>(
      Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4.dp),
        ),
        insetPadding: EdgeInsets.symmetric(horizontal: 24.dp, vertical: 24.0),
        child: this,
      ),
      barrierDismissible: true,
      barrierColor: GGColors.alertMask.color,
    );
  }

  MobileFillFullLogic get logic => Get.find<MobileFillFullLogic>();

  @override
  Widget build(BuildContext context) {
    Get.put(MobileFillFullLogic());
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(4.dp),
        color: GGColors.alertBackground.color,
      ),
      padding: EdgeInsetsDirectional.only(
        top: 51.dp,
        bottom: 40.dp,
        start: 16.dp,
        end: 16.dp,
      ),
      child: _buildContent(context),
    );
  }

  Widget _buildContent(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Image.asset(
          R.iconMobilePhone,
          width: 34.dp,
          fit: BoxFit.cover,
        ),
        SizedBox(height: 26.dp),
        Text(
          localized('bind_p_tit'),
          style: GGTextStyle(
            fontSize: GGFontSize.bigTitle,
            color: GGColors.textMain.color,
          ),
        ),
        SizedBox(height: 16.dp),
        Text(
          localized('full_mobile_hint'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
          maxLines: 2,
          textAlign: TextAlign.center,
        ),
        SizedBox(height: 16.dp),
        _getNumberTextField(),
        SizedBox(height: 16.dp),
        _buildConfirmButton(),
      ],
    );
  }

  Widget _buildConfirmButton() {
    return Row(
      children: [
        Expanded(
          child: Obx(() {
            return GGButton.main(
              onPressed: _onConfirm,
              text: localized('sure'),
              enable: logic.enableNext.value,
            );
          }),
        ),
      ],
    );
  }

  Widget _getNumberTextField() {
    return Row(
      children: [
        _buildAreaCode(),
        SizedBox(width: 20.dp),
        Expanded(child: _buildMobileNo()),
        SizedBox(width: 13.dp),
        // Transform.translate(
        //   offset: Offset(0, 1.dp),
        //   child: _buildLastSixNumber(),
        // ),
        _buildLastSixNumber(),
      ],
    );
  }

  Widget _buildLastSixNumber() {
    return OTPTextField(
      length: 6,
      width: 165.dp,
      fieldWidth: 23.dp,
      isDense: true,
      controller: logic.fillController,
      contentPadding: EdgeInsets.only(bottom: 1.6.dp),
      style: GGTextStyle(
        fontSize: GGFontSize.smallTitle,
        fontFamily: GGFontFamily.dingPro,
        fontWeight: GGFontWeigh.medium,
        color: GGColors.textMain.color,
      ),
      otpFieldStyle: OtpFieldStyle(
        borderColor: GGColors.border.color,
        enabledBorderColor: GGColors.border.color,
        focusBorderColor: GGColors.brand.color,
      ),
      textFieldAlignment: MainAxisAlignment.spaceBetween,
      fieldStyle: FieldStyle.underline,
      onChanged: (pin) {
        logic.pin.value = pin;
      },
      onCompleted: (pin) {
        logic.pin.value = pin;
      },
    );
  }

  Widget _buildMobileNo() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: encryptedMobileNo
          .replaceAll('*', '')
          .characters
          .map(
            (e) => Text(
              e,
              style: GGTextStyle(
                fontSize: GGFontSize.smallTitle,
                fontFamily: GGFontFamily.dingPro,
                fontWeight: GGFontWeigh.medium,
                color: GGColors.textMain.color,
              ),
            ),
          )
          .toList(),
    );
  }

  Widget _buildAreaCode() {
    return SizedBox(
      width: 48.dp,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: areaCode.characters
            .map(
              (e) => Text(
                e,
                style: GGTextStyle(
                  fontSize: GGFontSize.smallTitle,
                  fontFamily: GGFontFamily.dingPro,
                  fontWeight: GGFontWeigh.medium,
                  color: GGColors.textMain.color,
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}

extension _Action on MobileFillFullView {
  void _onConfirm() {
    callBack(encryptedMobileNo.replaceAll('*', '') + logic.pin.value);
    Get.back<dynamic>();
  }
}
