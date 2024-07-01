import 'dart:async';
import 'package:flutter/cupertino.dart';
import 'package:gogaming_app/common/api/account/models/gaming_user_model.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import '../../common/api/auth/auth_api.dart';
import '../../common/api/auth/models/gaming_login_model.dart';
import '../../common/api/base/go_gaming_service.dart';
import '../../common/lang/locale_lang.dart';
import '../../common/widgets/gaming_text_filed/gaming_text_filed.dart';
import '../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../base/base_controller.dart';
import 'gaming_secure_state.dart';

class GamingSecureLogic extends BaseController
    with StateMixin<GamingSecureState>, GetSingleTickerProviderStateMixin {
  GamingSecureLogic(this.action, {this.info});

  @override
  final GamingSecureState state = GamingSecureState();
  final GamingLoginModel? info;
  final VerifyAction action;

  // 当前的验证 1：手机验证 2：谷歌验证 3：邮箱验证
  RxInt curVerifyType = 1.obs;
  RxBool isLoading = false.obs;
  RxBool buttonEnable = false.obs;
  RxBool isVoice = false.obs;

  RxString? fullMobileNo = ''.obs;
  RxString? fullEmailNo = ''.obs;
  late GamingUserModel? user;
  // 总共支持几种验证方式
  RxInt allType = 0.obs;
  // 谷歌验证码
  late final GamingTextFieldController googleVerificationCode =
      GamingTextFieldController(
    obscureText: false,
    validator: [
      GamingTextFieldValidator(
        reg: RegExp(r'^[\s\S]{6}$'),
      ),
    ],
  );

  late GamingTextFieldController emailController;

  ///  手机验证码
  late GamingTextFieldController mobileOptController;

  @override
  void onInit() {
    super.onInit();
    user = AccountService.sharedInstance.gamingUser;
    _loadDefaultType();

    emailController = GamingTextFieldController(validator: [
      GamingTextFieldValidator(
        reg: RegExp(r'^\d{6}$'),
      ),
    ])
      ..textController.addListener(() {
        checkParams();
      });

    mobileOptController = GamingTextFieldController(validator: [
      GamingTextFieldValidator(
        reg: RegExp(r'^\d{6}$'),
      ),
    ])
      ..textController.addListener(() {
        checkParams();
      });
    _setAllType();
  }

  void _setAllType() {
    if (canUseEmailOpt()) {
      allType.value++;
    }
    if (canUseGoogleOpt()) {
      allType.value++;
    }
    if (canUseMobileOpt()) {
      allType.value++;
    }
  }

  void _loadDefaultType() {
    if (info?.tFaMobile == true || user?.isBindMobile == true) {
      curVerifyType.value = 1;
    } else if (user?.isBindGoogleValid == true || info?.tFaGoogle == true) {
      curVerifyType.value = 2;
    } else {
      curVerifyType.value = 3;
    }
  }

  // 手机安全验证(非登录)
  Future<void> verifyOtpCodeMobile(String otpCode, VerifyAction action,
      void Function(String token) on2FaSuccess, BuildContext context) async {
    isLoading.value = true;
    Map<String, dynamic> reqParams = {
      "verifyAction": action.value,
      "areaCode": areaCode,
      "mobile": fullMobileNo?.value ?? '',
      "otpCode": otpCode,
      "smsVoice": isVoice.value,
      "googleCode": '',
    };

    debugPrint('verifyOtpCodeMobile reqParams = $reqParams');
    PGSpi(Auth.general2faVerifyMobile.toTarget(inputData: reqParams))
        .rxRequest<String>((value) {
      return value['data'].toString();
    }).listen((event) {
      isLoading.value = false;
      String token = event.data;
      on2FaSuccess(token);
      Get.back(result: token);
      debugPrint('verifyOtpCode listen event = $event');
      if (event.success == false) {
        Toast.show(
            context: context,
            state: GgToastState.fail,
            title: localized('failed'),
            message: event.message.toString());
      }
    }).onError((Object error) {
      isLoading.value = false;
      Toast.show(
          context: context,
          state: GgToastState.fail,
          title: localized('failed'),
          message: error.toString());
    });
  }

  // 手机安全验证(登录)
  Future<void> verifyOtpCodeMobileLogin(String otpCode, VerifyAction action,
      void Function(String token) on2FaSuccess, BuildContext context) async {
    isLoading.value = true;
    Map<String, dynamic> reqParams = {
      // "verifyAction": action,
      "areaCode": areaCode,
      "mobile": fullMobileNo?.value ?? '',
      "otpCode": otpCode,
      "smsVoice": isVoice.value,
      "uniCode": info?.uniCode ?? ''
    };
    PGSpi(Auth.verify2faMobile.toTarget(inputData: reqParams))
        .rxRequest<String>((value) {
      return value['data'].toString();
    }).listen((event) {
      isLoading.value = false;
      String token = event.data;
      GoGamingService.sharedInstance.updateToken(token, isUser: true);
      on2FaSuccess(token);
      Get.back(result: token);
      debugPrint('verifyOtpCode listen event = $event');
      if (event.success == false) {
        Toast.show(
            context: context,
            state: GgToastState.fail,
            title: localized('failed'),
            message: event.message.toString());
      }
    }).onError((Object error) {
      isLoading.value = false;
      Toast.show(
          context: context,
          state: GgToastState.fail,
          title: localized('failed'),
          message: error.toString());
    });
  }

  // 安全验证谷歌(非登录)
  Future<void> verifyOtpCodeGoogle(
    String otpCode,
    void Function(String token) on2FaSuccess,
    BuildContext context,
  ) async {
    isLoading.value = true;
    Map<String, dynamic> reqParams = {
      "verifyAction": action.value,
      "googleCode": otpCode,
    };

    if (action == VerifyAction.login) {
      reqParams["uniCode"] = info?.uniCode ?? '';
    }
    PGSpi(Auth.general2faVerifyGoogle.toTarget(inputData: reqParams))
        .rxRequest<String>((value) {
      return value['data'].toString();
    }).listen((event) {
      isLoading.value = false;
      String token = event.data;
      on2FaSuccess(token);
      Get.back(result: token);
      debugPrint('verifyOtpCode listen event = $event');
      if (event.success == false) {
        Toast.show(
            context: context,
            state: GgToastState.fail,
            title: localized('failed'),
            message: event.message.toString());
      }
    }).onError((Object error) {
      isLoading.value = false;
      Toast.show(
          context: context,
          state: GgToastState.fail,
          title: localized('failed'),
          message: error.toString());
    });
  }

  // 安全验证谷歌(登录)
  Future<void> verifyOtpCodeGoogleLogin(
    String otpCode,
    void Function(String token) on2FaSuccess,
    BuildContext context,
  ) async {
    isLoading.value = true;
    Map<String, dynamic> reqParams = {
      "uniCode": info?.uniCode ?? '',
      "googleCode": otpCode,
    };

    PGSpi(Auth.verify2faGoogle.toTarget(inputData: reqParams))
        .rxRequest<String>((value) {
      return value['data'].toString();
    }).listen((event) {
      isLoading.value = false;
      String token = event.data;
      GoGamingService.sharedInstance.updateToken(token, isUser: true);
      on2FaSuccess(token);
      Get.back(result: token);
      debugPrint('verifyOtpCode listen event = $event');
      if (event.success == false) {
        Toast.show(
            context: context,
            state: GgToastState.fail,
            title: localized('failed'),
            message: event.message.toString());
      }
    }).onError((Object error) {
      isLoading.value = false;
      Toast.show(
          context: context,
          state: GgToastState.fail,
          title: localized('failed'),
          message: error.toString());
    });
  }

  // 邮箱安全验证(登录)
  Future<void> verifyOtpCodeEmailLogin(String otpCode,
      void Function(String token) on2FaSuccess, BuildContext context) async {
    isLoading.value = true;
    Map<String, dynamic> reqParams = {
      "uniCode": info?.uniCode ?? '',
      "emailCode": otpCode,
      "email": GGUtil.parseStr(fullEmailNo?.value),
    };
    PGSpi(Auth.verify2faEmail.toTarget(inputData: reqParams))
        .rxRequest<String>((value) {
      return value['data'].toString();
    }).listen((event) {
      isLoading.value = false;
      String token = event.data;
      GoGamingService.sharedInstance.updateToken(token, isUser: true);
      on2FaSuccess(token);
      Get.back(result: token);
      debugPrint('verifyOtpCode listen event = $event');
      if (event.success == false) {
        Toast.show(
            context: context,
            state: GgToastState.fail,
            title: localized('failed'),
            message: event.message.toString());
      }
    }).onError((Object error) {
      isLoading.value = false;
      Toast.show(
          context: context,
          state: GgToastState.fail,
          title: localized('failed'),
          message: error.toString());
    });
  }

  // 安全验证邮箱(非登录)
  Future<void> verifyOtpCodeEmail(
    String otpCode,
    void Function(String token) on2FaSuccess,
    BuildContext context,
  ) async {
    isLoading.value = true;
    Map<String, dynamic> reqParams = {
      "verifyAction": action.value,
      "email": GGUtil.parseStr(fullEmailNo?.value),
      'emailCode': otpCode
    };
    PGSpi(Auth.general2faVerifyEmail.toTarget(inputData: reqParams))
        .rxRequest<String>((value) {
      return value['data'].toString();
    }).listen((event) {
      isLoading.value = false;
      String token = event.data;
      on2FaSuccess(token);
      Get.back(result: token);
      debugPrint('verifyOtpCodeEmail listen event = $event');
      if (event.success == false) {
        Toast.show(
            context: context,
            state: GgToastState.fail,
            title: localized('failed'),
            message: event.message.toString());
      }
    }).onError((Object error) {
      isLoading.value = false;
      Toast.show(
          context: context,
          state: GgToastState.fail,
          title: localized('failed'),
          message: error.toString());
    });
  }

  @override
  void onReady() {
    googleVerificationCode.textController.addListener(() {
      checkParams();
    });

    super.onReady();
  }

  void checkParams() {
    if (curVerifyType.value == 1) {
      buttonEnable.value = mobileOptController.text.value.isNotEmpty &&
          mobileOptController.text.value.length >= 6;
    } else if (curVerifyType.value == 2) {
      buttonEnable.value = googleVerificationCode.text.value.isNotEmpty &&
          googleVerificationCode.text.value.length >= 6;
    } else {
      buttonEnable.value = emailController.text.value.isNotEmpty &&
          emailController.text.value.length >= 6;
    }
  }

  Future<void> submit(
    void Function(String token) on2FaSuccess,
  ) async {
    if (curVerifyType.value == 1) {
      // 手机验证
      if (action == VerifyAction.login) {
        verifyOtpCodeMobileLogin(mobileOptController.text.value, action,
            on2FaSuccess, Get.overlayContext!);
      } else {
        verifyOtpCodeMobile(mobileOptController.text.value, action,
            on2FaSuccess, Get.overlayContext!);
      }
    } else if (curVerifyType.value == 2) {
      // 谷歌验证
      if (action == VerifyAction.login) {
        verifyOtpCodeGoogleLogin(
          googleVerificationCode.text.value,
          on2FaSuccess,
          Get.overlayContext!,
        );
      } else {
        verifyOtpCodeGoogle(
          googleVerificationCode.text.value,
          on2FaSuccess,
          Get.overlayContext!,
        );
      }
    } else {
      // 邮箱验证
      if (action == VerifyAction.login) {
        verifyOtpCodeEmailLogin(
            emailController.text.value, on2FaSuccess, Get.overlayContext!);
      } else {
        // 通用2fa认证
        verifyOtpCodeEmail(
          emailController.text.value,
          on2FaSuccess,
          Get.overlayContext!,
        );
      }
    }
  }

  String get areaCode {
    final value =
        AccountService.sharedInstance.gamingUser?.areaCode ?? info?.areaCode;
    return value ?? "";
  }

  String get mobile {
    final value =
        AccountService.sharedInstance.gamingUser?.mobile ?? info?.mobile;
    return value ?? "";
  }

  bool showMobileOpt() {
    return curVerifyType.value == 1 && canUseMobileOpt();
  }

  bool showGoogleOpt() {
    return curVerifyType.value == 2 && canUseGoogleOpt();
  }

  bool showEmailOpt() {
    return curVerifyType.value == 3 && canUseEmailOpt();
  }

  bool canUseMobileOpt() {
    return user?.isBindMobile == true || info?.tFaMobile == true;
  }

  bool canUseGoogleOpt() {
    return user?.isBindGoogleValid == true || info?.tFaGoogle == true;
  }

  bool canUseEmailOpt() {
    return user?.isBindEmail == true || info?.tFaEmail == true;
  }
}
