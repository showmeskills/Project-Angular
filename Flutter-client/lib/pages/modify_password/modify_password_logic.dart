import 'package:gogaming_app/controller_header.dart';

import '../../common/api/account/account_api.dart';
import '../../common/lang/locale_lang.dart';
import '../../common/service/account_service.dart';
import '../../common/widgets/gaming_text_filed/gaming_text_filed.dart';
import '../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../../helper/encrypt.dart';
import '../main/main_logic.dart';
import 'modify_password_final_view.dart';

class ModifyPasswordLogic extends BaseController {
  late GamingTextFieldController oldPassword;
  late GamingTextFieldWithVerifyLevelController password;
  late GamingTextFieldController passwordAgain;

  RxBool submitEnable = false.obs;
  RxBool isLoginLoading = false.obs;

  @override
  void onInit() {
    oldPassword = GamingTextFieldController(
      obscureText: true,
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
    );

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
      },
    );
    super.onInit();
  }

  void _onTextChanged() {
    if (passwordAgain.text.value.isNotEmpty) {
      if (password.text.value != passwordAgain.text.value) {
        passwordAgain.addFieldError(hint: localized("pass_nomatch"));
      } else {
        passwordAgain.addFieldError(showErrorHint: false);
      }
    }

    if (password.isPass && password.text.value == passwordAgain.text.value) {
      submitEnable.value = true;
    } else {
      submitEnable.value = false;
    }
  }

  void sure() {
    isLoginLoading.value = true;
    Map<String, dynamic> reqParams = {
      "oldPassword": Encrypt.encodeString(oldPassword.text.value),
      "newPassword": Encrypt.encodeString(password.text.value),
    };
    PGSpi(Account.modifyPassword.toTarget(inputData: reqParams))
        .rxRequest<dynamic>((value) {
      return value;
    }).listen((event) {
      isLoginLoading.value = false;
      if (event.success) {
        AccountService.sharedInstance.logout();
        Get.until((route) => Get.currentRoute == Routes.main.route);
        Get.find<MainLogic>().changeSelectIndex(-1);
        Get.to<dynamic>(const ModifyPasswordFinalPage());
      }
    }).onError((Object error) {
      isLoginLoading.value = false;
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
}
