part of 'gaming_bind_email_logic.dart';

class GamingBindEmailState {
  GamingBindEmailState() {
    ///Initialize variables
  }

  RxInt curIndex = 1.obs;

  /// 是否已经绑定手机号
  late RxBool isBindMobile = false.obs;

  /// 密码
  late GamingTextFieldController passwordController;

  /// 邮箱验证码
  late GamingTextFieldController emailVerifyController;

  /// 手机验证码
  late GamingTextFieldController mobileOpt;

  /// 邮箱
  late GamingTextFieldController emailController;

  RxBool submitButtonEnable = false.obs;

  RxBool isVoice = false.obs;

  MobilePhoneVerificationStatus verificationStatus =
      MobilePhoneVerificationStatus.unSend;

  RxBool smsVoice = false.obs;

  RxString unicode = ''.obs;

  RxString? fullMobileNo = ''.obs;

  late GamingGoogleInfo? googleInfo;

  /// 默认国家
  GamingCountryModel country = CountryService.sharedInstance.currentCountry;

  GamingUserModel? userModel;
}
