import 'dart:async';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/account/models/gaming_user_model.dart';
import 'package:gogaming_app/common/api/auth/models/gaming_login_model.dart';
import 'package:gogaming_app/common/api/country/models/gaming_country_model.dart';
import 'package:gogaming_app/common/tools/geetest.dart';
import 'package:gogaming_app/common/tools/phone_number_util.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/api/auth/auth_api.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/login/mobile_fill/mobile_fill_full_view.dart';
import 'package:gogaming_app/widget_header.dart';

enum MobilePhoneVerificationStatus {
  unSend,
  send,
  reSend,
}

class MobileVerificationCodeWidget extends StatefulWidget {
  const MobileVerificationCodeWidget(
    this.mobileOptController,
    this.action, {
    super.key,
    this.fullMobile,
    this.fullMobileController,
    this.userInfo,
    this.country,
    this.onStatusChanged,
    this.isVoice,
  });

  /// 手机验证码的controller
  final GamingTextFieldController mobileOptController;
  final VerifyAction action;
  final RxBool? isVoice;

  /// 依赖外部随便变动(手动输入)的controller
  final GamingTextFieldController? fullMobileController;

  /// 针对外部外部传入完整手机号(例如登录成功之后的安全认证)
  final RxString? fullMobile;

  /// 外部可传入userInfo,针对（例如登录成功之后的安全认证，去单例里面获取不到。就传入）
  final GamingLoginModel? userInfo;

  /// 修改外面的国家区号时候使用
  final GamingCountryModel? Function()? country;

  final void Function(MobilePhoneVerificationStatus value)? onStatusChanged;

  @override
  // ignore: library_private_types_in_public_api
  _MobileVerificationCodeWidgetState createState() {
    return _MobileVerificationCodeWidgetState();
  }
}

class _MobileVerificationCodeWidgetState
    extends State<MobileVerificationCodeWidget> {
  MobilePhoneVerificationStatus phoneCodeState =
      MobilePhoneVerificationStatus.unSend;
  Timer? timer;
  int secondLeft = 90;
  GamingUserModel? user;
  String? fullMobileNo = '';
  bool isLoading = false;
  bool checkAgagin = false;
  bool showVoiceWidget = false;

  @override
  void initState() {
    super.initState();
    // user = widget.userInfo ?? AccountService.sharedInstance.gamingUser;
    if (widget.userInfo == null) {
      user = AccountService.sharedInstance.gamingUser;
    }
    _getFullMobile();
  }

  void _getFullMobile() {
    fullMobileNo = widget.fullMobile?.value ??
        widget.fullMobileController?.text.value ??
        '';
    widget.fullMobile?.value = fullMobileNo ?? '';
  }

  @override
  void dispose() {
    _stopTimer();
    super.dispose();
  }

  void _startTimer() {
    if (GGUtil.parseInt(secondLeft) > 0) {
      // 需求变更发送验证码之后可以立即点击语音验证码。导致前面没结束就开始重新计时
      timer?.cancel();
      secondLeft = 90;
    }
    timer = Timer.periodic(const Duration(seconds: 1), (object) {
      if (secondLeft > 0) {
        secondLeft -= 1;
      } else {
        timer?.cancel();
        secondLeft = 90;
        phoneCodeState = MobilePhoneVerificationStatus.reSend;
        widget.onStatusChanged?.call(phoneCodeState);
      }
      _refresh();
    });
  }

  Future<bool> phoneNumberValid() async {
    GamingCountryModel? curCountry = widget.country?.call();

    final result = await GGPhoneNumberUtil.isValidPhoneNumber(
        phoneNumber: GGUtil.parseStr(fullMobileNo),
        isoCode: GGUtil.parseStr(curCountry?.iso));
    return result == true && fullMobileNo != null && fullMobileNo!.isNotEmpty;
  }

  void _sendPhoneCheck({bool isVoice = false}) async {
    if (checkAgagin == true) {
      return;
    }
    checkAgagin = true;
    _getFullMobile();
    widget.isVoice?.value = isVoice;
    bool checkRes = await phoneNumberValid();
    if (checkRes) {
      //手机号校验通过
      reqOtpCode(isVoice: isVoice);
    } else if (GGUtil.parseStr(widget.userInfo?.mobile ?? user?.mobile)
            .isNotEmpty &&
        widget.fullMobileController == null) {
      // 弹窗提示需要用户输入完整手机号
      MobileFillFullView(
        encryptedMobileNo:
            GGUtil.parseStr(widget.userInfo?.mobile ?? user?.mobile),
        areaCode: GGUtil.parseStr(widget.userInfo?.areaCode ?? user?.areaCode),
        callBack: (mobileNumber) {
          fullMobileNo = mobileNumber;
          reqOtpCode(isVoice: isVoice);
        },
      ).showFillFullDialog();
    } else {
      //提示手机不符合规则
      Toast.showFailed(localized('phone_error_msg'));
    }
  }

  void _stopTimer() {
    if (timer != null) {
      timer!.cancel();
      timer = null;
    }
  }

  void _refresh() {
    setState(() {});
  }

  Future<void> reqOtpCode({bool isVoice = false}) async {
    widget.fullMobile?.value = fullMobileNo ?? '';
    GeeTest.getCaptcha(widget.action).doOnData((value) {
      if (value != null) {
        reqOtpCodeFinal(value, isVoice: isVoice).asStream();
      }
    }).listen((event) {
      debugPrint('return $event');
    }, onError: (Object err) {
      checkAgagin = false;
      //获取失败
      Toast.show(
        context: Get.overlayContext!,
        state: GgToastState.fail,
        title: localized('failed'),
        message: err.toString(),
      );
    });
  }

  Future<bool> reqOtpCodeFinal(Map<String, dynamic> geetestData,
      {bool isVoice = false}) async {
    isLoading = true;
    _refresh();
    Map<String, dynamic> reqParams = {
      "areaCode": areaCode,
      "mobile": fullMobileNo ?? '',
      "smsVoice": isVoice,
      "otpType": widget.action.value,
    };
    reqParams.addAll(geetestData);

    debugPrint('reqParams = $reqParams');

    PGSpi(Auth.requestOtpCode.toTarget(inputData: reqParams))
        .rxRequest<bool>((value) {
      if ((value.isNotEmpty) && value['success'] == true) {
        phoneCodeState = MobilePhoneVerificationStatus.send;
        widget.onStatusChanged?.call(phoneCodeState);
        _startTimer();
      }
      return true;
    }).listen(
      (event) {
        checkAgagin = false;
        isLoading = false;
        showVoiceWidget = true;
        _refresh();
      },
      onError: (Object e) {
        checkAgagin = false;
        //获取失败
        isLoading = false;
        _refresh();
        debugPrint('error：$e');
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('failed'),
            message: e.toString());
      },
    );
    return true;
  }

  String get areaCode {
    GamingCountryModel? curCountry = widget.country?.call();
    return curCountry?.areaCode ??
        widget.userInfo?.areaCode ??
        user?.areaCode ??
        '';
  }

  @override
  Widget build(BuildContext context) {
    return _buildBody();
  }

  Widget _buildBody() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildCodeTF(),
        Text(
            widget.fullMobileController == null
                ? '${localized('enter_phone00')} ${widget.userInfo?.areaCode ?? user?.areaCode} ${widget.userInfo?.mobile ?? user?.mobile}${localized('received_verification_code')}'
                : localized('verification_error_msg'),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.hint,
              fontWeight: GGFontWeigh.regular,
            )),
        _buildCantGetCode(),
      ],
    );
  }

  Widget _buildCodeTF() {
    return CheckPhoneTextField(
      controller: widget.mobileOptController,
      fillColor: GGColors.transparent,
      contentPadding: EdgeInsets.all(16.dp).copyWith(right: 0),
      scrollPadding: EdgeInsets.all(16.dp).copyWith(right: 0),
      checkPhoneSendWidget: _getCheckPhoneSendWidget(),
    );
  }

  Widget _getCheckPhoneSendWidget() {
    switch (phoneCodeState) {
      case MobilePhoneVerificationStatus.unSend:
        return GGButton(
          onPressed: _sendPhoneCheck,
          textColor: GGColors.brand.color,
          backgroundColor: Colors.transparent,
          textStyle: GGTextStyle(
              fontSize: GGFontSize.content, fontWeight: GGFontWeigh.regular),
          enable: true,
          isLoading: isLoading,
          text: localized('get_verification_code_button'),
          padding: EdgeInsets.symmetric(horizontal: 16.dp),
        );

      case MobilePhoneVerificationStatus.reSend:
        return GGButton(
          onPressed: _sendPhoneCheck,
          textColor: GGColors.brand.color,
          backgroundColor: Colors.transparent,
          textStyle: GGTextStyle(
              fontSize: GGFontSize.content, fontWeight: GGFontWeigh.regular),
          enable: true,
          isLoading: isLoading,
          text: localized('resend'),
          padding: EdgeInsets.symmetric(horizontal: 16.dp),
        );
      case MobilePhoneVerificationStatus.send:
        return Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.dp),
          child: Text(
            secondLeft.toString() + localized('resend_info_app'),
            style: GGTextStyle(
                color: GGColors.textSecond.color,
                fontSize: GGFontSize.content,
                fontWeight: GGFontWeigh.regular),
          ),
        );
    }
  }

  /// 无法收到验证码
  Widget _buildCantGetCode() {
    return Visibility(
      visible: showVoiceWidget,
      child: Column(
        children: [
          if (phoneCodeState != MobilePhoneVerificationStatus.unSend)
            Gaps.vGap8,
          Row(
            children: [
              GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: () async {
                  DialogUtil(
                      context: Get.context!,
                      iconHeight: 80.dp,
                      iconWidth: 70.dp,
                      contentMaxLine: 8,
                      contentAlign: TextAlign.start,
                      iconPath: R.iconNoRegisterCode,
                      title: localized('sms_ver_code00'),
                      content:
                          '${localized('sms_ver_code01')}:\n1.${localized('sms_ver_code02')}\n2.${localized('sms_ver_code03')}\n3.${localized('sms_ver_code04')}\n4.${localized('sms_ver_code05')}\n5.${localized('sms_ver_code06')}',
                      onLeftBtnPressed: () {
                        Get.back<dynamic>();
                      },
                      leftBtnName: localized('i_ha_kn00'),
                      rightBtnName: localized('sms_ver_code08'),
                      onRightBtnPressed: () {
                        Get.back<dynamic>();
                        _sendPhoneCheck(isVoice: true);
                      }).showNoticeDialogWithTwoButtons();
                },
                child: Text(
                  '${localized('cannt_receive_verification_code')}?',
                  style: GGTextStyle(
                    fontSize: GGFontSize.hint,
                    fontWeight: GGFontWeigh.regular,
                    color: GGColors.link.color,
                  ),
                ),
              ),
              Gaps.hGap2,
              Text(
                localized('sms_info'),
                style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  fontWeight: GGFontWeigh.regular,
                  color: GGColors.textSecond.color,
                ),
              ),
              Gaps.hGap2,
              GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: () {
                  _sendPhoneCheck(isVoice: true);
                },
                child: Text(
                  localized('null_t'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.hint,
                    fontWeight: GGFontWeigh.regular,
                    color: GGColors.link.color,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
