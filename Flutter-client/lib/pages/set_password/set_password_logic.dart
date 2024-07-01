import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/controller_header.dart';

import '../../common/api/account/account_api.dart';
import '../../common/lang/locale_lang.dart';
import '../../common/service/account_service.dart';
import '../../common/widgets/gaming_text_filed/gaming_text_filed.dart';
import '../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../../helper/encrypt.dart';

class SetPasswordLogic extends BaseController {
  late GamingTextFieldWithVerifyLevelController password;

  RxBool submitEnable = false.obs;
  RxBool isLoginLoading = false.obs;

  final bool navigateToModifyPwd;

  SetPasswordLogic([this.navigateToModifyPwd = true]);

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

    super.onInit();
  }

  void _onTextChanged() {
    if (password.isPass) {
      submitEnable.value = true;
    } else {
      submitEnable.value = false;
    }
  }

  void sure() {
    isLoginLoading.value = true;
    Map<String, dynamic> reqParams = {
      "newPassword": Encrypt.encodeString(password.text.value),
    };
    PGSpi(Account.setPassword.toTarget(inputData: reqParams))
        .rxRequest<dynamic>((value) {
      return value;
    }).listen((event) {
      isLoginLoading.value = false;
      AccountService().updateGamingUserInfo().listen((value) {
        GamingEvent.setPasswordSuccess.notify();
      });
      if (event.success) {
        Get.back<void>();
        if (navigateToModifyPwd) {
          Get.toNamed<dynamic>(Routes.modifyPassword.route);
        }
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
