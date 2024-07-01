import 'package:flutter/cupertino.dart';
import 'package:gogaming_app/common/api/account/account_api.dart';
import 'package:gogaming_app/common/api/account/models/gaming_user_model.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/country/models/gaming_country_model.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/country_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/common/widgets/mobile_verification_code/mobile_verification_code_widget.dart';
import 'package:gogaming_app/helper/encrypt.dart';
import 'package:gogaming_app/pages/base/base_controller.dart';

class GamingModifyMobileLogic extends BaseController {
  RxInt curIndex = 1.obs;

  /// 是否需要谷歌验证
  late RxBool needGoogleVerify = true.obs;

  /// 密码
  RxString password = ''.obs;

  /// 完整手机号
  RxString fullMobile = ''.obs;

  /// 谷歌验证码
  RxString googleVerify = ''.obs;

  RxBool isVoice = false.obs;

  RxBool isLoading = false.obs;

  RxString unicode = ''.obs;

  RxBool enable = false.obs;

  MobilePhoneVerificationStatus verificationStatus =
      MobilePhoneVerificationStatus.unSend;

  late GamingTextFieldController passwordController;
  late GamingTextFieldController mobileOptController;
  late GamingTextFieldController mobileController;
  late GamingTextFieldController googleVerifyController;
  late GamingUserModel user;

  /// 默认国家
  GamingCountryModel country = CountryService.sharedInstance.currentCountry;

  @override
  void onInit() {
    super.onInit();
    passwordController = GamingTextFieldController(
      onChanged: _onPasswordChanged,
    );
    user = AccountService.sharedInstance.gamingUser!;

    googleVerifyController = GamingTextFieldController(
      onChanged: _onGoogleVerifyChanged,
    )..textController.addListener(() {
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

    mobileController = GamingTextFieldController(
      obscureText: false,
      validator: [
        GamingTextFieldValidator(reg: RegExp(r'^[\s\S]{0,16}$')),
      ],
    )..textController.addListener(() {
        checkParams();
      });
  }

  bool isBindGoogleValid() {
    return user.isBindGoogleValid ?? false;
  }

  bool isBindMobileValid() {
    return user.isBindMobile ?? false;
  }

  /// 第一步：
  void modifyBindMobile() {
    isLoading.value = true;
    Map<String, dynamic> reqParams = {
      "areaCode": user.areaCode,
      "mobile": fullMobile.value,
      "googleCode": googleVerifyController.text.value,
      "password": Encrypt.encodeString(password.value),
      "otpCode": mobileOptController.text.value,
      "otpType": VerifyAction.bindMobile.value,
      "smsVoice": isVoice.value
    };
    debugPrint('reqParams = $reqParams');
    PGSpi(Account.modifyBindMobile.toTarget(inputData: reqParams))
        .rxRequest<String>((value) {
      return value['data'].toString();
    }).listen((event) {
      isLoading.value = false;
      if (event.success) {
        /// 密码验证成功进行第二步
        curIndex.value = 2;
        mobileOptController.textController.clear();
        verificationStatus = MobilePhoneVerificationStatus.unSend;
        unicode.value = event.data;
      } else {
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('failed'),
            message: event.message.toString());
      }
    }).onError((Object error) {
      isLoading.value = false;
      Toast.show(
          context: Get.overlayContext!,
          state: GgToastState.fail,
          title: localized('failed'),
          message: error.toString());
    });
  }

  /// 第二步：绑定手机号
  void bindMobile() {
    isLoading.value = true;
    Map<String, dynamic> reqParams = {
      "areaCode": country.areaCode,
      "mobile": mobileController.text.value,
      "uniCode": unicode.value,
      "otpCode": mobileOptController.text.value,
      "smsVoice": isVoice.value,
      "otpType": VerifyAction.bindMobile.value,
    };
    PGSpi(Account.bindMobile.toTarget(inputData: reqParams))
        .rxRequest<bool>((value) {
      if ((value.isNotEmpty) && value['success'] == true) {
        return true;
      }
      return false;
    }).listen((event) {
      isLoading.value = false;
      if (event.success) {
        /// 密码验证成功进行第二步
        curIndex.value = 3;

        AccountService().updateGamingUserInfo().listen((value) {
          GamingEvent.modifyMobileSuccess.notify();
        });
      } else {
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('failed'),
            message: event.message.toString());
      }
    }).onError((Object error) {
      isLoading.value = false;
      Toast.show(
          context: Get.overlayContext!,
          state: GgToastState.fail,
          title: localized('failed'),
          message: error.toString());
    });
  }

  /// 选择国家
  void onCountryChanged(GamingCountryModel value) {
    country = value;
  }

  void _onPasswordChanged(String v) {
    password.value = v;
    checkParams();
  }

  void _onGoogleVerifyChanged(String v) {
    googleVerify.value = v;
  }

  void checkParams() {
    if (curIndex.value == 1) {
      bool res = verificationStatus != MobilePhoneVerificationStatus.unSend &&
          passwordController.text.isNotEmpty &&
          mobileOptController.text.isNotEmpty;
      if (isBindGoogleValid()) {
        enable.value = res && googleVerifyController.text.isNotEmpty;
      } else {
        enable.value = res;
      }
    } else if (curIndex.value == 2) {
      enable.value = mobileController.text.isNotEmpty &&
          mobileOptController.text.isNotEmpty;
    }
  }

  /// 发送验证码状态变更
  void onVerificationStatusChanged(MobilePhoneVerificationStatus value) {
    verificationStatus = value;
    checkParams();
  }
}
