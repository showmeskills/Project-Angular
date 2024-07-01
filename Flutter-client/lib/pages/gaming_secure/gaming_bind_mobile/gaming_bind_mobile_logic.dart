import 'package:gogaming_app/common/api/account/account_api.dart';
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
import 'package:gogaming_app/pages/base/base_controller.dart';

import 'gaming_bind_mobile_state.dart';

class GamingBindMobileLogic extends BaseController
    with StateMixin<GamingBindMobileState> {
  @override
  final GamingBindMobileState state = GamingBindMobileState();

  RxInt curIndex = 1.obs;

  /// 是否需要谷歌验证
  late RxBool needGoogleVerify = false.obs;

  /// 密码
  RxString password = ''.obs;

  /// 谷歌验证码
  RxString googleVerify = ''.obs;

  late GamingTextFieldController passwordController;

  late GamingTextFieldController googleVerifyController;

  late GamingTextFieldController mobile;

  RxBool smsVoice = false.obs;

  RxString unicode = ''.obs;

  MobilePhoneVerificationStatus verificationStatus =
      MobilePhoneVerificationStatus.unSend;

  /// 手机验证码
  late GamingTextFieldController mobileOpt;

  /// 默认国家
  GamingCountryModel country = CountryService.sharedInstance.currentCountry;

  RxBool enableNext = false.obs;

  void _onPasswordChanged(String v) {
    password.value = v;
  }

  void _onGoogleVerifyChanged(String v) {
    googleVerify.value = v;
  }

  /// 选择国家
  void onCountryChanged(GamingCountryModel value) {
    country = value;
  }

  @override
  void onInit() {
    super.onInit();
    needGoogleVerify.value =
        AccountService.sharedInstance.gamingUser?.isBindGoogleValid ?? false;
    passwordController = GamingTextFieldController(
      onChanged: _onPasswordChanged,
    );
    googleVerifyController = GamingTextFieldController(
      onChanged: _onGoogleVerifyChanged,
    );
    mobile = GamingTextFieldController(
      obscureText: false,
      validator: [
        GamingTextFieldValidator(reg: RegExp(r'^[\s\S]{0,16}$')),
      ],
    )..textController.addListener(() {
        _enableNext();
      });

    mobileOpt = GamingTextFieldController(validator: [
      GamingTextFieldValidator(
        reg: RegExp(r'^\d{6}$'),
      ),
    ])
      ..textController.addListener(() {
        _enableNext();
      });
  }

  /// 第二步：绑定手机号
  void bindMobile() {
    Map<String, dynamic> reqParams = {
      "areaCode": country.areaCode,
      "mobile": mobile.text.value,
      "otpCode": mobileOpt.text.value,
      "smsVoice": smsVoice.value,
      "otpType": VerifyAction.bindMobile.value,
    };
    PGSpi(Account.bindMobile.toTarget(inputData: reqParams))
        .rxRequest<void>((value) {})
        .listen((event) {
      if (event.success) {
        /// 密码验证成功进行第二步
        curIndex.value = 2;
        AccountService().updateGamingUserInfo().listen((value) {
          GamingEvent.bindMobileSuccess.notify();
        });
      } else {
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('failed'),
            message: event.message.toString());
      }
    }).onError((Object error) {
      Toast.show(
          context: Get.overlayContext!,
          state: GgToastState.fail,
          title: localized('failed'),
          message: error.toString());
    });
  }

  /// 发送验证码状态变更
  void onVerificationStatusChanged(MobilePhoneVerificationStatus value) {
    verificationStatus = value;
    _enableNext();
  }

  /// 能否点击下一步
  void _enableNext() {
    enableNext.value = mobile.text.isNotEmpty &&
        mobileOpt.text.isNotEmpty &&
        verificationStatus != MobilePhoneVerificationStatus.unSend;
  }
}
