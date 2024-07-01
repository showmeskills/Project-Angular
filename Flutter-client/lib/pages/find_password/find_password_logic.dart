import 'dart:async';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/widgets/email_verification_code/email_verification_code_widget.dart';
import 'package:gogaming_app/common/widgets/mobile_verification_code/mobile_verification_code_widget.dart';
import 'package:gogaming_app/pages/register/check_phone_logic.dart';
import 'package:gogaming_app/router/customer_middle_ware.dart';
import '../../common/api/auth/auth_api.dart';
import '../../common/lang/locale_lang.dart';
import '../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../../router/app_pages.dart';
import '../base/base_controller.dart';
import 'find_password_state.dart';

enum CurType {
  email,
  phone,
}

class FindPasswordLogic extends BaseController
    with GetSingleTickerProviderStateMixin {
  final FindPasswordState state = FindPasswordState();
  late RxBool isLoginLoading = false.obs;
  RxBool submitEnable = false.obs;
  var phoneCodeState = PhoneCodeState.unSend.obs;
  final curType = CurType.email.obs;

  late TabController tabController = TabController(
    /// 直接设置为 0 跨级跳转的时候会出现无法跳转的问题，直接设置一个较短的时间则不会出现
    animationDuration: const Duration(milliseconds: 5),
    vsync: this,
    length: 2,
    initialIndex: 0,
  );

  @override
  void onReady() {
    super.onReady();
    state.code.textController.addListener(() {
      checkParams();
    });
    state.emailCode.textController.addListener(() {
      checkParams();
    });
    state.email.textController.addListener(() {
      checkParams();
    });
    state.mobile.textController.addListener(() {
      checkParams();
    });
    tabController.addListener(_handleTabSelection);
  }

  @override
  void onClose() {
    super.onClose();
    tabController.removeListener(_handleTabSelection);
  }

  void _handleTabSelection() {
    if (tabController.index == 0) {
      curType.value = CurType.email;
    } else {
      curType.value = CurType.phone;
    }
  }

  Future<void> _verifyOtpCodeFinal(
      String action, void Function(String token) onComplete,
      {bool isVoice = false}) async {
    Map<String, dynamic> reqParams = {
      "areaCode": state.country.areaCode,
      "mobile": state.mobile.text.value,
      "otpCode": state.code.text.value,
      "smsVoice": isVoice,
      "otpType": action
    };
    isLoginLoading.value = true;
    PGSpi(Auth.resetPwdMobileOtp.toTarget(inputData: reqParams))
        .rxRequest<dynamic>((value) {
      return value['data'];
    }).listen((event) {
      isLoginLoading.value = false;
      if (event.data is Map) {
        String uniCode = event.data['uniCode'] as String;
        onComplete.call(uniCode);
      }
    }).onError((Object error) {
      isLoginLoading.value = false;
      if (error is GoGamingResponse) {
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('failed'),
            message: error.toString());
      } else {
        Toast.showTryLater();
      }
    });
  }

  Future<void> _verifyEmailOtpCodeFinal(
    String action,
    void Function(String token) onComplete,
  ) async {
    Map<String, dynamic> reqParams = {
      "email": state.email.text.value,
      "emailCode": state.emailCode.text.value,
      "otpType": action
    };
    isLoginLoading.value = true;
    PGSpi(Auth.resetPwdEmailOtp.toTarget(inputData: reqParams))
        .rxRequest<dynamic>((value) {
      return value['data'];
    }).listen((event) {
      isLoginLoading.value = false;
      if (event.data is Map) {
        String uniCode = event.data['uniCode'] as String;
        onComplete.call(uniCode);
      }
    }).onError((Object error) {
      isLoginLoading.value = false;
      if (error is GoGamingResponse) {
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('failed'),
            message: error.toString());
      } else {
        Toast.showTryLater();
      }
    });
  }

  void contactService() {
    CustomerServiceRouter().toNamed();
  }

  void submit() {
    if (curType.value == CurType.phone) {
      _verifyOtpCodeFinal(VerifyAction.resetPwd.value, (unicode) {
        if (unicode.isNotEmpty) {
          Get.toNamed<dynamic>(Routes.resetPassword.route,
              arguments: {"uniCode": unicode});
        }
      });
    } else {
      _verifyEmailOtpCodeFinal(VerifyAction.resetPwd.value, (unicode) {
        if (unicode.isNotEmpty) {
          Get.toNamed<dynamic>(Routes.resetPassword.route,
              arguments: {"uniCode": unicode});
        }
      });
    }
  }

  void checkParams() {
    if (curType.value == CurType.phone) {
      submitEnable.value = state.code.isPass &&
          state.mobileVerificationStatus !=
              MobilePhoneVerificationStatus.unSend &&
          state.mobile.textController.text.isNotEmpty;
    } else {
      submitEnable.value = state.emailCode.isPass &&
          state.emailVerificationStatus != EmailVerificationStatus.unSend &&
          state.email.isPass;
    }
  }

  /// 发送手机验证码状态变更
  void onMobileVerificationStatusChanged(MobilePhoneVerificationStatus value) {
    state.mobileVerificationStatus = value;
    checkParams();
  }

  /// 发送邮箱验证码状态变更
  void onEmailVerificationStatusChanged(EmailVerificationStatus value) {
    state.emailVerificationStatus = value;
    checkParams();
  }
}
