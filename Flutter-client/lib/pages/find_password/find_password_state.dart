import 'package:base_framework/base_controller.dart';
import 'package:flutter/gestures.dart';
import 'package:gogaming_app/common/components/extensions/gg_reg_exp.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/widgets/email_verification_code/email_verification_code_widget.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/mobile_verification_code/mobile_verification_code_widget.dart';
import '../../common/api/country/models/gaming_country_model.dart';

class FindPasswordState {
  late TapGestureRecognizer contactServiceRecognizer;
  late GamingCountryModel country;
  late GamingTextFieldController mobile;

  late GamingTextFieldController code;
  RxBool smsVoice = false.obs;

  RxString unicode = ''.obs;

  late GamingTextFieldController email;
  late GamingTextFieldController emailCode;

  MobilePhoneVerificationStatus mobileVerificationStatus =
      MobilePhoneVerificationStatus.unSend;

  EmailVerificationStatus emailVerificationStatus =
      EmailVerificationStatus.unSend;
  FindPasswordState() {
    contactServiceRecognizer = TapGestureRecognizer();
    country = GamingCountryModel.defaultCountry();
    mobile = GamingTextFieldController();
    email = GamingTextFieldController(
      validator: [
        GamingTextFieldValidator(
          reg: GGRegExp.emailRule,
          errorHint: localized('email_err'),
        ),
      ],
    )..textController.addListener(() {});
    code = GamingTextFieldController(validator: [
      GamingTextFieldValidator(
        reg: RegExp(r'^\d{6}$'),
      ),
    ])
      ..textController.addListener(() {});
    emailCode = GamingTextFieldController(validator: [
      GamingTextFieldValidator(
        reg: RegExp(r'^\d{6}$'),
      ),
    ])
      ..textController.addListener(() {});
  }
}
