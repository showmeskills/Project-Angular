import 'dart:async';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/auth/models/gaming_login_model.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/base/go_gaming_service.dart';
import 'package:gogaming_app/common/api/country/models/gaming_country_model.dart';
import 'package:gogaming_app/common/components/extensions/gg_reg_exp.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/service/merchant_service/merchant_config_model.dart';
import 'package:gogaming_app/common/service/merchant_service/merchant_service.dart';
import 'package:gogaming_app/common/service/oauth_service/oauth_service.dart';
import 'package:gogaming_app/common/service/web_url_service/web_url_service.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/common/tools/geetest.dart';
import 'package:gogaming_app/common/tools/phone_number_util.dart';
import 'package:gogaming_app/common/tools/url_tool.dart';
import 'package:gogaming_app/common/tracker/event.dart';
import 'package:gogaming_app/common/tracker/gaming_data_collection.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/helper/device_util.dart';
import 'package:gogaming_app/helper/encrypt.dart';
import 'package:gogaming_app/pages/login/login_logic.dart';

import '../../common/api/auth/auth_api.dart';
import '../../common/service/fingerprint_service/fingerprint_service.dart';
import '../../common/service/market_link_service/market_link_service.dart';
import '../../common/service/biometric_service.dart';
import '../../common/tracker/analytics_manager.dart';

class RegisterLogic extends BaseController
    with GetSingleTickerProviderStateMixin {
  RegisterLogic();

  late TabController tabController;

  late GamingTextFieldWithVerifyLevelController userNameUser;
  late GamingTextFieldWithVerifyLevelController passwordUser;
  late GamingTextFieldController phoneUser;
  late GamingTextFieldWithVerifyLevelController passwordPhone;
  late GamingTextFieldController registerEmail;
  late GamingTextFieldWithVerifyLevelController registerPasswordEmail;
  late GamingTextFieldController referrer;

  RxBool checkboxSelected = true.obs;
  RxBool isLoadingUser = false.obs;
  RxBool registerButtonEnable = false.obs;
  RxBool showReferrerUser = false.obs;
  final referrerCode = ''.obs;
  late final index = tabController.index.obs;

  final offsetY = 0.0.obs;

  /// 邮箱
  late final GamingTextFieldController email = GamingTextFieldController(
    obscureText: false,
    validator: [
      GamingTextFieldValidator(
        reg: GGRegExp.emailOREmptyRule,
        errorHint: localized('email_err'),
      ),
    ],
  );

  /// 默认国家
  GamingCountryModel country = GamingCountryModel.defaultCountry();
  RxString termsUrl = ''.obs;
  late BuildContext context;

  @override
  void onInit() {
    super.onInit();
    initUserController();
    initPhoneController();
    initEmailController();
    _loadTermsUrl();
    referrerCode.value =
        MarketLinkService.sharedInstance.readReferrerCodeCache();
    tabController = TabController(
        vsync: this,
        length: 3,
        animationDuration: const Duration(microseconds: 5));
    tabController.addListener(_handleTabSelection);

    GamingDataCollection.sharedInstance.submitDataPoint(
      TrackEvent.visitRegister,
    );
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void onReady() {
    super.onReady();
    checkboxSelected.listen((p0) {
      checkParams();
    });
    userNameUser.textController.addListener(() {
      checkParams();
    });
    passwordUser.textController.addListener(() {
      checkParams();
    });
    phoneUser.textController.addListener(() {
      phoneNumberValid().then((value) {
        phoneUser.addFieldError(
          showErrorHint: value == false,
          hint: localized('phone_error_msg'),
        );
        checkParams();
      });
    });
    passwordPhone.textController.addListener(() {
      checkParams();
    });
    email.textController.addListener(() {
      checkParams();
    });
    registerPasswordEmail.textController.addListener(() {
      checkParams();
    });
    registerEmail.textController.addListener(() {
      checkParams();
    });
  }

  void _handleTabSelection() {
    // resetTF();
    // state.isLoginByAccount = tabController.index == 0;
    index.value = tabController.index;
    email.textController.clear();
    checkParams();
  }

  void _loadTermsUrl() {
    MerchantService().getMerchantConfig().listen((event) {
      if (event != null) {
        MerchantCustomConfig? model = event.config;
        termsUrl.value = UrlTool.addParametersToUrl(
            "${WebUrlService.baseUrl}/"
            "${GoGamingService.sharedInstance.apiLang}/"
            "${model?.termsUrl ?? ''}",
            [
              "isApp=1&isDark=${ThemeManager.shareInstacne.isDarkMode ? 1 : 0}",
              GoGamingService.sharedInstance.curToken
            ]);
      }
    });
  }

  Future<bool> phoneNumberValid() async {
    final result = await GGPhoneNumberUtil.isValidPhoneNumber(
        phoneNumber: phoneUser.text.value, isoCode: country.iso);
    return result == true && phoneUser.text.value.isNotEmpty;
  }

  void checkParams() {
    final isValid =
        (referrer.isPass || !referrer.isNotEmpty) && checkboxSelected.value;
    if (tabController.index == 0) {
      registerButtonEnable.value = userNameUser.isPass &&
          passwordUser.isPass &&
          isValid &&
          (!email.isNotEmpty || email.isPass);
    } else if (tabController.index == 1) {
      registerButtonEnable.value = !phoneUser.showErrorHint &&
          passwordPhone.isPass &&
          isValid &&
          (!email.isNotEmpty || email.isPass);
    } else {
      registerButtonEnable.value =
          registerEmail.isPass && registerPasswordEmail.isPass && isValid;
    }
  }

  Stream<GoGamingResponse<String?>> _registerByAccount(
      Map<String, dynamic> geetestParams, String deviceName) {
    final emailText = email.text.value;
    Map<String, dynamic> accountParams = {
      "password": Encrypt.encodeString(passwordUser.text.value),
      "userName": userNameUser.text.value,
      "clientName": deviceName,
      if (emailText.isNotEmpty) "email": emailText,
      if (getReferrerCode().isNotEmpty) "referrer": getReferrerCode(),
    };
    accountParams.addAll(geetestParams);
    return PGSpi(Auth.registerByUser.toTarget(inputData: accountParams))
        .rxRequest<String?>((value) {
      final data = value['data'];
      if (data is String) {
        return data;
      } else {
        return null;
      }
    });
  }

  void onSocialLogin(OAuth auth) {
    auth.onSocialLogin(
      context,
      (loginResult) {
        /// 刷新api的用户token
        GoGamingService.sharedInstance
            .updateToken(loginResult?.token, isUser: true);

        if (loginResult?.need2Fa == true) {
          toLogin2fa(loginResult!);
        } else {
          loginSuccess();
        }
      },
      (token) {
        /// 刷新api的用户token
        GoGamingService.sharedInstance.updateToken(token, isUser: true);
        loginSuccess();
      },
    );
  }

  void toLogin2fa(GamingLoginModel secureInfo) {
    Get.toNamed<dynamic>(Routes.secure.route, arguments: {
      'secureInfo': secureInfo,
      'otpType': VerifyAction.login,
      'on2FaSuccess': (String token) => loginSuccess(),
      'country': country,
    });
  }

  Future<String?> getOTPCode() async {
    final c = Completer<String?>();

    final result =
        await Get.toNamed<dynamic>(Routes.checkPhone.route, arguments: {
      "mobile": phoneUser.text.value,
      "areaCode": country.areaCode,
      "onSubmitted": (String optCode) {
        Get.back<dynamic>(result: optCode);
      }
    });
    result is String ? c.complete(result) : c.complete(null);
    return c.future;
  }

  Future<String?> getEmailOTPCode() async {
    final c = Completer<String?>();

    final result =
        await Get.toNamed<dynamic>(Routes.checkEmail.route, arguments: {
      "email": registerEmail.text.value,
      "onSubmitted": (String optCode) {
        Get.back<dynamic>(result: optCode);
      }
    });
    result is String ? c.complete(result) : c.complete(null);
    return c.future;
  }

  Stream<GoGamingResponse<String?>> registerByEmail(
      Map<String, dynamic> geetestParams, String deviceName, String otpCode) {
    final referrerText = getReferrerCode();
    Map<String, dynamic> emailParams = {
      "password": Encrypt.encodeString(registerPasswordEmail.text.value),
      "email": registerEmail.text.value,
      "clientName": deviceName,
      "otpCode": otpCode,
      if (referrerText.isNotEmpty) "referrer": referrerText,
    };
    emailParams.addAll(geetestParams);
    return PGSpi(Auth.registerByEmail.toTarget(inputData: emailParams))
        .rxRequest<String?>((value) {
      final data = value['data'];
      if (data is String) {
        return data;
      } else {
        return null;
      }
    });
  }

  Stream<GoGamingResponse<String?>> registerByMobile(
      Map<String, dynamic> geetestParams, String deviceName, String otpCode) {
    final emailText = email.text.value;
    final referrerText = getReferrerCode();

    Map<String, dynamic> mobileParams = {
      "password": Encrypt.encodeString(passwordPhone.text.value),
      "mobile": phoneUser.text.value,
      "clientName": deviceName,
      "otpCode": otpCode,
      "areaCode": country.areaCode,
      if (emailText.isNotEmpty) "email": emailText,
      if (referrerText.isNotEmpty) "referrer": referrerText,
    };
    mobileParams.addAll(geetestParams);
    return PGSpi(Auth.registerByMobile.toTarget(inputData: mobileParams))
        .rxRequest<String?>((value) {
      final data = value['data'];
      if (data is String) {
        return data;
      } else {
        return null;
      }
    });
  }

  Future<void> postRegister() async {
    /// 关闭强度检测2种方式
    /// 1. 使用controller hasFocus属性 和 hidePopup() 方法
    /// 2. 移除聚焦，则自动关闭
    primaryFocus?.unfocus();
    isLoadingUser.value = true;
    if (FingerprintService.sharedInstance.readVisitorId().isEmpty) {
      await FingerprintService.sharedInstance.load();
    }
    final deviceName = await DeviceUtil.getDeviceName();
    GeeTest.getCaptcha(VerifyAction.register).flatMap((geetestParams) {
      if (geetestParams == null) return Stream.value(false);
      if (tabController.index == 0) {
        Map<String, dynamic> dataMap = {
          "actionvalue1": 1,
        };
        GamingDataCollection.sharedInstance
            .submitDataPoint(TrackEvent.clickRegister, dataMap: dataMap);
        return _registerByAccount(geetestParams, deviceName);
      } else if (tabController.index == 1) {
        return getOTPCode().asStream().flatMap((value) {
          if (value == null) {
            return Stream.value(false);
          } else {
            Map<String, dynamic> dataMap = {
              "actionvalue1": 0,
            };
            GamingDataCollection.sharedInstance
                .submitDataPoint(TrackEvent.clickRegister, dataMap: dataMap);
            return registerByMobile(geetestParams, deviceName, value);
          }
        });
      } else {
        return getEmailOTPCode().asStream().flatMap((value) {
          if (value == null) {
            return Stream.value(false);
          } else {
            return registerByEmail(geetestParams, deviceName, value);
          }
        });
      }
    }).listen((event) {
      isLoadingUser.value = false;
      if (event is GoGamingResponse<dynamic> && event.data is String) {
        /// 刷新api的用户token
        GoGamingService.sharedInstance
            .updateToken(event.data as String, isUser: true);
        MarketLinkService.sharedInstance.clearReferrerCodeCache();
        loginSuccess();
      }
    }).onError((Object error) {
      isLoadingUser.value = false;
      if (error is GoGamingResponse) {
        loginFail(error);
      } else {
        Toast.showTryLater();
      }
    });
  }

  String getReferrerCode() {
    if (referrerCode.isNotEmpty) {
      return referrerCode.value;
    }
    return referrer.text.value;
  }

  void loginSuccess() {
    AnalyticsManager.logEvent(
        name: 'login', parameters: {"login_type": "register"});
    AccountService().updateGamingUserInfo().listen((value) {
      if (value == true) {
        // 关闭登录、注册相关页面
        Get.until((route) => !Routes.loginRoutes.contains(route.settings.name));

        Future.delayed(const Duration(milliseconds: 900), () {
          if (tabController.index == 0) {
            GamingEvent.usernameRegistered.notify();
          }
          GamingEvent.userRegistered.notify();
          GamingEvent.login.notify();
        });
      }
    });
  }

  void loginFail(GoGamingResponse<dynamic> response) {
    if (response.success) return;
    String content = response.message ?? '';
    if (GoGamingError.inviterError == response.error) {
      referrer.addFieldError(hint: content);
      return;
    } else if (GoGamingError.accountExist == response.error ||
        GoGamingError.mobileExist == response.error) {
      content = localized('reg_tip01');
    }
    final dialog = DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('reg_tip00'),
      content: content,
    );
    dialog.showNoticeDialogWithTwoButtons();
  }

  void onCountryChanged(GamingCountryModel? value) {
    if (value != null) country = value;
  }

  void toLogin() {
    bool hasLoginPage = Get.findOrNull<LoginLogic>() != null;
    if (hasLoginPage || Get.previousRoute == Routes.login.route) {
      Get.back(result: null);
    } else {
      if (BiometricService.sharedInstance.canBiometricLogin()) {
        Get.offNamed<dynamic>(Routes.biometricLogin.route);
      } else {
        Get.offNamed<dynamic>(Routes.login.route);
      }
    }
  }

  void toCheckPhone(String phoneNum) {
    Get.toNamed<dynamic>(Routes.checkPhone.route, arguments: phoneNum);
  }

  void initUserController() {
    userNameUser = GamingTextFieldWithVerifyLevelController(
      validator: GamingTextFieldValidator.userNameRules(),
      detector: GamingTextFieldValidator.userNameRules(),
    );
    passwordUser = GamingTextFieldWithVerifyLevelController(
      obscureText: true,
      validator: GamingTextFieldValidator.passwordRules(),
      detector: [
        ...GamingTextFieldValidator.passwordRules(),
        GamingTextFieldValidator.specialChar(),
      ],
    );
    referrer = GamingTextFieldController(
      validator: [
        GamingTextFieldValidator(
          reg: RegExp(r'^(?![\s\S])|([\s\S]{8,8})$'),
          errorHint: getLocalString('referrer_msg_error'),
        ),
      ],
    );
  }

  void initPhoneController() {
    phoneUser = GamingTextFieldController();
    passwordPhone = GamingTextFieldWithVerifyLevelController(
      obscureText: true,
      validator: GamingTextFieldValidator.passwordRules(),
      detector: [
        ...GamingTextFieldValidator.passwordRules(),
        GamingTextFieldValidator.specialChar(),
      ],
    );
  }

  void initEmailController() {
    registerEmail = GamingTextFieldController(
      obscureText: false,
      validator: [
        GamingTextFieldValidator(
          reg: GGRegExp.emailRule,
          errorHint: localized('email_err'),
        ),
      ],
    );

    registerPasswordEmail = GamingTextFieldWithVerifyLevelController(
      obscureText: true,
      validator: GamingTextFieldValidator.passwordRules(),
      detector: [
        ...GamingTextFieldValidator.passwordRules(),
        GamingTextFieldValidator.specialChar(),
      ],
    );
  }

  @override
  void didChangeMetrics() {
    if (!passwordUser.hasFocus.value &&
        !passwordPhone.hasFocus.value &&
        !registerPasswordEmail.hasFocus.value &&
        !referrer.hasFocus.value) {
      offsetY.value = 0;
    } else {
      /// 获取键盘高度
      /// 3.10.1版本之后，废弃[窗口单例](https://docs.flutter.dev/release/breaking-changes/window-singleton)
      final double viewInsetsBottom = EdgeInsets.fromViewPadding(
              WidgetsBinding.instance.platformDispatcher.views.first.viewInsets,
              WidgetsBinding
                  .instance.platformDispatcher.views.first.devicePixelRatio)
          .bottom;
      if (viewInsetsBottom <= 0) {
        return;
      }
      offsetY.value = viewInsetsBottom;
    }
  }

  @override
  void onClose() {
    super.onClose();
    tabController.removeListener(_handleTabSelection);
    WidgetsBinding.instance.removeObserver(this);
  }
}
