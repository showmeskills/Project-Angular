import 'package:flutter/cupertino.dart';
import 'package:gogaming_app/common/api/account/account_api.dart';
import 'package:gogaming_app/common/api/account/models/gaming_user_model.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/common/widgets/mobile_verification_code/mobile_verification_code_widget.dart';
import 'package:gogaming_app/helper/encrypt.dart';
import 'package:gogaming_app/pages/base/base_controller.dart';

class GamingUnbindGoogleLogic extends BaseController {
  RxInt curIndex = 1.obs;

  /// 是否需要谷歌验证
  late RxBool needMobileVerify = true.obs;

  /// 密码
  RxString password = ''.obs;

  /// 完整手机号
  RxString fullMobile = ''.obs;

  RxBool isVoice = false.obs;

  RxBool isLoading = false.obs;

  RxString unicode = ''.obs;

  MobilePhoneVerificationStatus verificationStatus =
      MobilePhoneVerificationStatus.unSend;

  late GamingTextFieldController passwordController;
  late GamingTextFieldController mobileOptController;

  late GamingUserModel user;

  RxBool enableNext = false.obs;

  @override
  void onInit() {
    super.onInit();
    passwordController = GamingTextFieldController(
      onChanged: _onPasswordChanged,
    );
    user = AccountService.sharedInstance.gamingUser!;

    mobileOptController = GamingTextFieldController(validator: [
      GamingTextFieldValidator(
        reg: RegExp(r'^\d{6}$'),
      ),
    ])
      ..textController.addListener(() {
        _checkEnable();
      });
  }

  bool isBindMobileValid() {
    return user.isBindMobile ?? false;
  }

  /// 解绑
  void unbindGoogle() {
    isLoading.value = true;
    Map<String, dynamic> reqParams = {
      "areaCode": GGUtil.parseStr(user.areaCode),
      "mobile": GGUtil.parseStr(fullMobile.value),
      "password": Encrypt.encodeString(password.value),
      "otpCode": GGUtil.parseStr(mobileOptController.text.value),
      "otpType": VerifyAction.bindGoogleVerify.value,
      "smsVoice": isVoice.value
    };

    debugPrint('reqParams = $reqParams');
    PGSpi(Account.unbindGoogle.toTarget(inputData: reqParams))
        .rxRequest<dynamic>((value) {
      if ((value.isNotEmpty) && value['success'] == true) {
        /// 密码验证成功进行第二步
        curIndex.value = 2;
        AccountService().updateGamingUserInfo().listen((value) {
          GamingEvent.unBindGoogleSuccess.notify();
        });
      } else {
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('failed'),
            message: value['message']?.toString() ?? '');
      }
    }).listen((event) {
      isLoading.value = false;
    }).onError((Object error) {
      isLoading.value = false;
      Toast.show(
          context: Get.overlayContext!,
          state: GgToastState.fail,
          title: localized('failed'),
          message: error.toString());
    });
  }

  void _onPasswordChanged(String v) {
    password.value = v;
    _checkEnable();
  }

  /// 发送验证码状态变更
  void onVerificationStatusChanged(MobilePhoneVerificationStatus value) {
    verificationStatus = value;
  }

  void _checkEnable() {
    if (curIndex.value == 1) {
      bool res = false;
      if (isBindMobileValid()) {
        res = verificationStatus != MobilePhoneVerificationStatus.unSend &&
            passwordController.text.isNotEmpty &&
            mobileOptController.text.isNotEmpty;
      } else {
        res = passwordController.text.isNotEmpty;
      }
      enableNext.value = res;
    } else {
      enableNext.value = false;
    }
  }
}
