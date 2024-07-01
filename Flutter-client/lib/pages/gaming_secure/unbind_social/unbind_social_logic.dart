import 'package:gogaming_app/common/api/account/account_api.dart';
import 'package:gogaming_app/common/api/account/models/gaming_user_model.dart';
import 'package:gogaming_app/common/api/account/models/member_social_list.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/common/widgets/mobile_verification_code/mobile_verification_code_widget.dart';
import 'package:gogaming_app/pages/base/base_controller.dart';

import '../../../helper/encrypt.dart';

class UnbindSocialLogic extends BaseController {
  UnbindSocialLogic(this.socialInfo);

  final SocialInfoList socialInfo;

  /// 密码
  RxString password = ''.obs;

  /// 完整手机号
  RxString fullMobile = ''.obs;

  /// 谷歌验证码
  RxString googleVerify = ''.obs;

  RxBool isVoice = false.obs;

  RxBool isLoading = false.obs;

  RxString unicode = ''.obs;

  late GamingTextFieldController passwordController = GamingTextFieldController(
    onChanged: _onPasswordChanged,
  );

  late GamingTextFieldController mobileOptController =
      GamingTextFieldController(validator: [
    GamingTextFieldValidator(
      reg: RegExp(r'^\d{6}$'),
    ),
  ])
        ..textController.addListener(() {});
  late GamingUserModel user = AccountService.sharedInstance.gamingUser!;
  MobilePhoneVerificationStatus verificationStatus =
      MobilePhoneVerificationStatus.unSend;

  void _onPasswordChanged(String v) {
    password.value = v;
  }

  /// 发送验证码状态变更
  void onVerificationStatusChanged(MobilePhoneVerificationStatus value) {
    verificationStatus = value;
  }

  void onPressUnbind() {
    isLoading.value = true;
    Map<String, dynamic> reqParams = {
      "areaCode": GGUtil.parseStr(user.areaCode),
      "mobile": GGUtil.parseStr(fullMobile.value),
      "password": Encrypt.encodeString(password.value),
      "otpCode": GGUtil.parseStr(mobileOptController.text.value),
      "otpType": VerifyAction.unbindSocial.value,
      "smsVoice": isVoice.value,
      "socialUserId": socialInfo.socialUserId,
      "userType": socialInfo.socialUserType,
    };

    PGSpi(Account.socialUserUnbind.toTarget(inputData: reqParams))
        .rxRequest<dynamic>((value) {
      return (value.isNotEmpty) && value['success'] == true;
    }).listen((event) {
      isLoading.value = false;
      Toast.showSuccessful(localized('unbind_success'));
      Get.back<void>();
    }).onError((Object error) {
      isLoading.value = false;
      Toast.show(
        context: Get.overlayContext!,
        state: GgToastState.fail,
        title: localized('unbind_failed'),
        message: error.toString(),
      );
    });
  }

  /// 能否点击下一步
  bool enableNext() {
    bool res = passwordController.text.isNotEmpty &&
        mobileOptController.text.isNotEmpty &&
        verificationStatus != MobilePhoneVerificationStatus.unSend;

    return res;
  }
}
