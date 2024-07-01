// ignore_for_file: unnecessary_overrides

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/account/account_api.dart';
import 'package:gogaming_app/common/api/account/models/gaming_user_model.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/base/go_gaming_service.dart';
import 'package:gogaming_app/common/api/country/models/gaming_country_model.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/country_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/service/h5_webview_manager.dart';
import 'package:gogaming_app/common/service/merchant_service/merchant_config_model.dart';
import 'package:gogaming_app/common/service/merchant_service/merchant_service.dart';
import 'package:gogaming_app/common/service/web_url_service/web_url_service.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/common/tools/url_tool.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/common/widgets/mobile_verification_code/mobile_verification_code_widget.dart';
import 'package:gogaming_app/helper/encrypt.dart';
import 'package:gogaming_app/models/gaming_google_info.dart';
import 'package:gogaming_app/pages/base/base_controller.dart';

import 'gaming_bind_google_state.dart';

class GamingBindGoogleLogic extends BaseController
    with StateMixin<GamingBindGoogleState> {
  @override
  final GamingBindGoogleState state = GamingBindGoogleState();

  RxInt curIndex = 1.obs;

  /// 是否已经绑定手机号
  late RxBool isBindMobile = false.obs;

  /// 密码
  late GamingTextFieldController passwordController;

  /// 谷歌验证码
  late GamingTextFieldController googleVerifyController;

  /// 手机验证码
  late GamingTextFieldController mobileOpt;

  RxBool isVoice = false.obs;

  MobilePhoneVerificationStatus verificationStatus =
      MobilePhoneVerificationStatus.unSend;

  RxBool smsVoice = false.obs;

  RxString unicode = ''.obs;

  late GamingUserModel user;

  RxString? fullMobileNo = ''.obs;

  GamingGoogleInfo? googleInfo;

  /// 默认国家
  GamingCountryModel country = CountryService.sharedInstance.currentCountry;

  /// 选择国家
  void onCountryChanged(GamingCountryModel value) {
    country = value;
  }

  // Timer? timer;

  @override
  void onInit() {
    super.onInit();
    requestGoogleInfo();
    isBindMobile.value =
        AccountService.sharedInstance.gamingUser?.isBindMobile ?? false;
    user = AccountService.sharedInstance.gamingUser!;
    passwordController = GamingTextFieldController();
    googleVerifyController = GamingTextFieldController();

    mobileOpt = GamingTextFieldController(validator: [
      GamingTextFieldValidator(
        reg: RegExp(r'^\d{6}$'),
      ),
    ])
      ..textController.addListener(() {});
  }

  /// 获取谷歌验证二维码和16进制
  Future<void> requestGoogleInfo() async {
    PGSpi(Account.getGoogleValidCode.toTarget())
        .rxRequest<GamingGoogleInfo?>((value) {
      final data = value['data'];
      if (data is Map<String, dynamic>) {
        return GamingGoogleInfo.fromJson(data);
      }
      return null;
    }).listen((event) {
      if (event.success) {
        googleInfo = event.data;
      } else {
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('failed'),
            message: event.message.toString());
      }
    });
  }

  String getGoogleInfoQRStr() {
    if (googleInfo == null) return '';
    int index = googleInfo!.qrCodeImageUrl.indexOf('otpauth');
    String str = googleInfo!.qrCodeImageUrl.substring(index);
    return Uri.decodeComponent(str);
  }

  /// 密码 + 谷歌验证码 或者 手机验证码 + 谷歌验证码
  void bindGoogle() {
    Map<String, dynamic> reqParams = {
      "googleCode": googleVerifyController.text.value,
      "smsVoice": smsVoice.value,
      "otpType": VerifyAction.bindGoogleVerify.value,
    };

    if (isBindMobile.value) {
      reqParams["areaCode"] = user.areaCode;
      reqParams["mobile"] = fullMobileNo?.value ?? '';
      reqParams["otpCode"] = mobileOpt.text.value;
    } else {
      reqParams["password"] =
          Encrypt.encodeString(passwordController.text.value);
    }
    PGSpi(isBindMobile.value
            ? Account.bindGoogleValidWithMobile.toTarget(inputData: reqParams)
            : Account.bindGoogleValid.toTarget(inputData: reqParams))
        .rxRequest<dynamic>((value) {
      return value;
    }).listen((event) {
      if (event.success) {
        debugPrint('success event = $event');

        /// 密码验证成功进行第二步
        curIndex.value = 5;
        AccountService().updateGamingUserInfo().listen((value) {
          /// 完成之后发送通知
          GamingEvent.bindGoogleSuccess.notify();
        });
      } else {
        Toast.showMessage(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            message: event.toString());
      }
    }).onError((Object error) {
      Toast.show(
          context: Get.overlayContext!,
          state: GgToastState.fail,
          title: localized('failed'),
          message: error.toString());
    });
  }

  // @override
  // void onClose() {
  //   super.onClose();
  //   // _stopTimer();
  // }

  void onClickUseAuth() {
    MerchantService().getMerchantConfig().listen((event) {
      if (event != null) {
        MerchantCustomConfig? model = event.config;
        String str = UrlTool.addParametersToUrl(
            "${WebUrlService.baseUrl}/"
            "${GoGamingService.sharedInstance.apiLang}/"
            "${model?.useAuth ?? ''}",
            [
              "isApp=1&isDark=${ThemeManager.shareInstacne.isDarkMode ? 1 : 0}",
              GoGamingService.sharedInstance.curToken
            ]);
        H5WebViewManager.sharedInstance.openWebView(
          url: str,
          title: localized('use_auth'),
        );
      }
    });
  }

  /// 发送验证码状态变更
  void onVerificationStatusChanged(MobilePhoneVerificationStatus value) {
    verificationStatus = value;
  }
}
