import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/auth/auth_api.dart';
import 'package:gogaming_app/common/api/auth/models/gaming_login_model.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/base/go_gaming_service.dart';
import 'package:gogaming_app/common/api/country/models/gaming_country_model.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/service/oauth_service/oauth_service.dart';
import 'package:gogaming_app/common/tools/geetest.dart';
import 'package:gogaming_app/common/tools/phone_number_util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/helper/device_util.dart';
import 'package:gogaming_app/helper/encrypt.dart';
import 'package:gogaming_app/router/customer_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../common/service/fingerprint_service/fingerprint_service.dart';
import '../../common/tracker/analytics_manager.dart';
import 'login_state.dart';
import 'models/remember_login.dart';

class LoginLogic extends BaseController with GetSingleTickerProviderStateMixin {
  late BuildContext context;
  late TabController tabController = TabController(
    /// 直接设置为 0 跨级跳转的时候会出现无法跳转的问题，直接设置一个较短的时间则不会出现
    animationDuration: const Duration(milliseconds: 5),
    vsync: this,
    length: 3,
    initialIndex: autoLogin.value.isRemember ? autoLogin.value.initialIndex : 0,
  );
  late final index = tabController.index.obs;
  LoginState state = LoginState();

  bool get isAutoLogin => autoLogin.value.isRemember;

  set isAutoLogin(bool value) => autoLogin.update((val) {
        val?.isRemember = value;
      });

  final _cacheAutoLogin = ReadWriteValue<Map<String, dynamic>?>(
    'LoginLogic.cacheAutoLogin',
    null,
    () => GetStorage(),
  );
  late final autoLogin = () {
    final rememberLogin = _cacheAutoLogin.val == null
        ? RememberLogin(
            isRemember: true,
            initialIndex: 0,
          )
        : RememberLogin.fromJson(_cacheAutoLogin.val!);
    return rememberLogin.obs;
  }();
  final isLoginLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    GamingDataCollection.sharedInstance.submitDataPoint(TrackEvent.visitLogin);
    everAll(
      [
        index,
        state.accountPassword.text,
        state.account.text,
        state.mobile.text,
        state.mobilePassword.text,
        state.email.text,
        state.emailPassword.text,
      ],
      (callback) => checkEnable(),
    );

    state.mobile.textController.addListener(() {
      phoneNumberValid().then((value) {
        state.mobile.addFieldError(
          showErrorHint: value == false,
          hint: localized('phone_error_msg'),
        );
        checkEnable();
      });
    });

    tabController.addListener(_handleTabSelection);
    autoLogin.listen((p0) {
      if (p0.isRemember == false) {
        p0 = RememberLogin(
          isRemember: p0.isRemember,
          initialIndex: 0,
        );
      }
      _cacheAutoLogin.val = p0.toJson();
    });
    _readRememberLogin();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void didChangeMetrics() {
    if (!state.accountPassword.hasFocus.value &&
        !state.mobilePassword.hasFocus.value &&
        !state.emailPassword.hasFocus.value) {
      state.offsetY.value = 0;
    } else {
      /// 获取键盘高度
      /// 3.10.1版本之后，废弃[窗口单例](https://docs.flutter.dev/release/breaking-changes/window-singleton)
      final double viewInsetsBottom = EdgeInsets.fromViewPadding(
              WidgetsBinding.instance.platformDispatcher.views.first.viewInsets,
              WidgetsBinding
                  .instance.platformDispatcher.views.first.devicePixelRatio)
          .bottom;
      if (viewInsetsBottom <= 0) {
        state.offsetY.value = 0;
      } else {
        state.offsetY.value = viewInsetsBottom - 150.dp;
      }
    }
  }

  Future<bool> phoneNumberValid() async {
    final phoneUser = state.mobile;
    final result = await GGPhoneNumberUtil.isValidPhoneNumber(
        phoneNumber: phoneUser.text.value, isoCode: state.country.iso);
    return result == true && phoneUser.text.value.isNotEmpty;
  }

  void _readRememberLogin() {
    final loginInfo = autoLogin.value;
    if (!loginInfo.isRemember) return;

    state.accountPassword.textController.text = loginInfo.accountPassword ?? '';
    state.account.textController.text = loginInfo.accountName ?? '';
    state.email.textController.text = loginInfo.emailName ?? '';
    state.emailPassword.textController.text = loginInfo.emailPassword ?? '';
    // 兼容PhoneNumberUtil.isValidPhoneNumber校验问题,延迟处理
    Future.delayed(const Duration(), () {
      state.mobile.textController.text = loginInfo.mobileNumber ?? '';
    });
    state.mobilePassword.textController.text = loginInfo.mobilePassword ?? '';
    if (loginInfo.selectCountry != null) {
      state.country = loginInfo.selectCountry!;
    }
    _handleTabSelection();
    //手动检查
    checkEnable();
  }

  void checkEnable() {
    if (tabController.index == 0) {
      state.isEnableLogin.value =
          state.accountPassword.isPass && state.account.isPass;
    } else if (tabController.index == 1) {
      state.isEnableLogin.value = state.mobilePassword.isPass &&
          (state.mobile.isNotEmpty && !state.mobile.showErrorHint);
    } else {
      state.isEnableLogin.value =
          state.email.isPass && state.emailPassword.isPass;
    }
  }

  void _rememberLogin() {
    final loginInfo = autoLogin.value;
    if (!loginInfo.isRemember) return;
    final autoLoginInfo = RememberLogin(
      isRemember: true,
      initialIndex: tabController.index,
    );
    if (tabController.index == 1) {
      autoLoginInfo.mobilePassword = state.mobilePassword.text.value;
      autoLoginInfo.mobileNumber = state.mobile.text.value;
      autoLoginInfo.selectCountry = state.country;
    } else if (tabController.index == 0) {
      autoLoginInfo.accountName = state.account.text.value;
      autoLoginInfo.accountPassword = state.accountPassword.text.value;
    } else {
      autoLoginInfo.emailName = state.email.text.value;
      autoLoginInfo.emailPassword = state.emailPassword.text.value;
    }
    autoLogin(autoLoginInfo);
  }

  void _handleTabSelection() {
    // resetTF();
    index.value = tabController.index;
  }

  void resetTF() {
    //和记住密码逻辑冲突 先注释掉
    // state.account.textController.clear();
    // state.accountPassword.textController.clear();
    // state.mobile.textController.clear();
    // state.mobilePassword.textController.clear();
  }

  @override
  void onClose() {
    super.onClose();
    tabController.removeListener(_handleTabSelection);
    WidgetsBinding.instance.removeObserver(this);
  }

  void changeAutoLogin() {
    isAutoLogin = !isAutoLogin;
  }

  Stream<GoGamingResponse<GamingLoginModel?>> _loginByEmail(
      Map<String, dynamic> geetestParams, String deviceName) {
    Map<String, dynamic> accountParams = {
      "password": Encrypt.encodeString(state.emailPassword.text.value),
      "autoLogin": isAutoLogin,
      "clientName": deviceName,
      "email": state.email.text.value
    };
    accountParams.addAll(geetestParams);
    return PGSpi(Auth.loginByEmail.toTarget(inputData: accountParams))
        .rxRequest<GamingLoginModel?>((value) {
      final data = value['data'];
      if (data is Map<String, dynamic>) {
        return GamingLoginModel.fromJson(data);
      } else {
        return null;
      }
    });
  }

  Stream<GoGamingResponse<GamingLoginModel?>> _loginByAccount(
      Map<String, dynamic> geetestParams, String deviceName) {
    Map<String, dynamic> accountParams = {
      "password": Encrypt.encodeString(state.accountPassword.text.value),
      "autoLogin": isAutoLogin,
      "clientName": deviceName,
      "userName": state.account.text.value
    };
    accountParams.addAll(geetestParams);
    return PGSpi(Auth.loginByName.toTarget(inputData: accountParams))
        .rxRequest<GamingLoginModel?>((value) {
      final data = value['data'];
      if (data is Map<String, dynamic>) {
        return GamingLoginModel.fromJson(data);
      } else {
        return null;
      }
    });
  }

  Stream<GoGamingResponse<GamingLoginModel?>> _loginByMobile(
      Map<String, dynamic> geetestParams, String deviceName) {
    Map<String, dynamic> mobileParams = {
      "password": Encrypt.encodeString(state.mobilePassword.text.value),
      "autoLogin": isAutoLogin,
      "clientName": deviceName,
      "mobile": state.mobile.text.value,
      "areaCode": state.country.areaCode,
    };
    mobileParams.addAll(geetestParams);
    return PGSpi(Auth.loginByMobile.toTarget(inputData: mobileParams))
        .rxRequest<GamingLoginModel?>((value) {
      final data = value['data'];
      if (data is Map<String, dynamic>) {
        return GamingLoginModel.fromJson(data);
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
          toLogin2fa(loginResult!, isSocial: true);
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

  Future<void> login() async {
    isLoginLoading.value = true;
    if (FingerprintService.sharedInstance.readVisitorId().isEmpty) {
      await FingerprintService.sharedInstance.load();
    }
    final deviceName = await DeviceUtil.getDeviceName();
    GeeTest.getCaptcha(VerifyAction.login).flatMap((geetestParams) {
      if (geetestParams == null) return Stream.value(false);
      if (tabController.index == 0) {
        return _loginByAccount(geetestParams, deviceName);
      } else if (tabController.index == 1) {
        return _loginByMobile(geetestParams, deviceName);
      } else {
        return _loginByEmail(geetestParams, deviceName);
      }
    }).listen((event) {
      isLoginLoading.value = false;
      if (event is GoGamingResponse<GamingLoginModel?>) {
        /// 刷新api的用户token
        GoGamingService.sharedInstance
            .updateToken(event.data?.token, isUser: true);

        if (event.data?.need2Fa == true) {
          toLogin2fa(event.data!);
        } else {
          loginSuccess();
        }
      }
    }).onError((Object error) {
      isLoginLoading.value = false;
      if (error is GoGamingResponse) {
        loginFail(error);
      } else {
        Toast.showFailed(localized('try_again_after_switching_the_network'));
      }
    });
  }

  void loginSuccess() {
    AnalyticsManager.logEvent(
        name: 'login', parameters: {"login_type": "login"});
    isLoginLoading.value = true;
    _rememberLogin();
    AccountService().updateGamingUserInfo().listen((value) {
      isLoginLoading.value = false;
      if (value == true) {
        // 关闭登录、注册相关页面
        Get.until((route) => !Routes.loginRoutes.contains(route.settings.name));
        Get.back<dynamic>();
        Future.delayed(const Duration(milliseconds: 900), () {
          GamingEvent.login.notify();
        });
      }
    }, onError: (Object error) {
      isLoginLoading.value = false;
      if (error is GoGamingResponse) {
        Toast.showFailed(error.message);
      } else {
        Toast.showTryLater();
      }
    });
  }

  void loginFail(GoGamingResponse<dynamic> response) {
    if (response.success) return;
    if (GoGamingError.accountLocked == response.error ||
        GoGamingError.accountForbidden == response.error) {
      final title = GoGamingError.accountLocked == response.error
          ? localized('acc_lock00')
          : localized('acc_disab00');
      final rightBtnName = GoGamingError.accountLocked == response.error
          ? localized('chage_paswd00')
          : localized('con_cus_ser00');
      final dialog = DialogUtil(
        context: context,
        title: title,
        content: localized('acc_d_con'),
        rightBtnName: rightBtnName,
        onRightBtnPressed: () {
          Get.back<dynamic>();
          GoGamingError.accountLocked == response.error
              ? onForgotPassWord()
              : contactService();
        },
      );
      dialog.showNoticeDialogWithTwoButtons();
    } else {
      Toast.show(
        context: Get.overlayContext!,
        state: GgToastState.fail,
        title: localized('hint'),
        message: response.toString(),
      );
    }
  }

  void onCountryChanged(GamingCountryModel value) {
    state.country = value;
  }

  void toLogin2fa(GamingLoginModel secureInfo,
      {String? otpType, bool isSocial = false}) {
    Get.toNamed<dynamic>(Routes.secure.route, arguments: {
      'secureInfo': secureInfo,
      'otpType': (otpType != null && otpType.isNotEmpty)
          ? VerifyActionExtension.convert(otpType)
          : VerifyAction.login,
      'on2FaSuccess': (String token) => loginSuccess(),
      // 只有手机登录 才传递手机号
      if (index.value == 1 && !isSocial) 'fMobile': state.mobile.text.value,
      if (index.value == 1 && !isSocial) 'country': state.country,
      // 邮箱登录，需要传递邮箱
      if (index.value == 2 && !isSocial) 'fEmail': state.email.text.value,
    });
  }

  void contactService() {
    CustomerServiceRouter().toNamed();
  }

  void onForgotPassWord() {
    Get.toNamed<dynamic>(Routes.findPassword.route);
  }
}
