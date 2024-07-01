// import 'package:base_framework/base_controller.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';

import '../../common/api/auth/auth_api.dart';
import '../../common/widgets/gaming_text_filed/gaming_text_filed.dart';
import '../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../../helper/encrypt.dart';
import '../../router/app_pages.dart';
import '../base/base_controller.dart';
import 'reset_password_state.dart';

class ResetPasswordLogic extends BaseController {
  final ResetPasswordState state = ResetPasswordState();
  late GamingTextFieldWithVerifyLevelController password;
  late GamingTextFieldController passwordAgain;

  RxBool submitEnable = false.obs;
  RxBool isLoginLoading = false.obs;

  @override
  void onInit() {
    password = GamingTextFieldWithVerifyLevelController(
      obscureText: true,
      onChanged: (text) {
        _onTextChanged();
      },
      validator: [
        GamingTextFieldValidator.length(
          min: 8,
          max: 20,
          errorHint: getLocalString('pwd_length_error'),
        ),
        GamingTextFieldValidator.number(
          getLocalString('pwd_digit_error'),
        ),
        GamingTextFieldValidator.upperChar(
          getLocalString('pwd_uppercase_letter_error'),
        ),
      ],
      detector: [
        GamingTextFieldValidator.number(),
        GamingTextFieldValidator.upperChar(),
        GamingTextFieldValidator.lowerChar(),
        GamingTextFieldValidator.specialChar(),
      ],
    );

    passwordAgain = GamingTextFieldController(
        obscureText: true,
        onChanged: (text) {
          _onTextChanged();
        });
    super.onInit();
  }

  void _onTextChanged() {
    if (password.text.value != passwordAgain.text.value) {
      submitEnable.value = false;
      if (passwordAgain.text.value.isNotEmpty) {
        passwordAgain.addFieldError(hint: localized("pass_nomatch"));
      }
      return;
    }

    if (passwordAgain.isPass && password.isPass) {
      passwordAgain.addFieldError(showErrorHint: false);
      submitEnable.value = true;
    } else {
      submitEnable.value = false;
    }
  }

  Future<void> _resetPwd(
      String uniCode, void Function(bool result) onComplete) async {
    Map<String, dynamic> reqParams = {
      "uniCode": uniCode,
      "password": Encrypt.encodeString(password.text.value)
    };
    PGSpi(Auth.resetPwd.toTarget(inputData: reqParams))
        .rxRequest<dynamic>((value) {
      return value;
    }).listen((event) {
      if (event.success) {
        onComplete.call(true);
      }
    }).onError((Object error) {
      onComplete.call(false);
      if (error is GoGamingResponse) {
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('failed'),
            message: error.toString());
      } else {
        Toast.showTryLater();
      }
    });
  }

  void submit(String uniCode) {
    isLoginLoading.value = true;
    _resetPwd(uniCode, (result) {
      isLoginLoading.value = false;
      if (result) {
        Get.until((route) => Get.currentRoute == Routes.login.route);
      } else {}
    });
  }
}
