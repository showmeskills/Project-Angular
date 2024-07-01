import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/account/models/gaming_user_model.dart';
import 'package:gogaming_app/controller_header.dart';

import '../../common/api/account/account_api.dart';
import '../../common/lang/locale_lang.dart';
import '../../common/service/account_service.dart';
import '../../common/widgets/gaming_text_filed/gaming_text_filed.dart';
import '../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../../helper/encrypt.dart';

class ModifyUserNameLogic extends BaseController {
  RxInt curIndex = 1.obs;

  RxBool isLoading = false.obs;

  String unicode = '';

  RxBool enable = false.obs;

  late GamingTextFieldController password =
      GamingTextFieldController(obscureText: true);
  late GamingTextFieldWithVerifyLevelController userNameUser =
      GamingTextFieldWithVerifyLevelController(
    validator: GamingTextFieldValidator.userNameRules(),
    detector: GamingTextFieldValidator.userNameRules(),
  );
  late GamingUserModel user;

  @override
  void onInit() {
    super.onInit();
    user = AccountService.sharedInstance.gamingUser!;
    password.textController.addListener(() {
      checkParams();
    });

    userNameUser.textController.addListener(() {
      checkParams();
    });
  }

  bool isBindGoogleValid() {
    return user.isBindGoogleValid ?? false;
  }

  bool isBindMobileValid() {
    return user.isBindMobile ?? false;
  }

  void previousStepPressed() {
    curIndex.value--;
    enable.value = true;
  }

  /// 第一步：验证密码
  void verifyPassword() {
    isLoading.value = true;
    Map<String, dynamic> reqParams = {
      "password": Encrypt.encodeString(password.text.value),
    };
    PGSpi(Account.verifyModifyUsername.toTarget(inputData: reqParams))
        .rxRequest<String>((value) {
      return value['data'].toString();
    }).listen((event) {
      isLoading.value = false;
      if (event.success) {
        /// 密码验证成功进行第二步
        curIndex.value = 2;
        enable.value = false;
        unicode = event.data;
      } else {
        Toast.show(
          context: Get.overlayContext!,
          state: GgToastState.fail,
          title: localized('failed'),
          message: event.message.toString(),
        );
      }
    }).onError((Object error) {
      isLoading.value = false;
      if (error is GoGamingResponse) {
        if (error.error == GoGamingError.passwordError) {
          Toast.showFailed(localized('pwd_error'));
        } else {
          Toast.showFailed(error.toString());
        }
      } else {
        Toast.showTryLater();
      }
    });
  }

  /// 第二步：修改用户名
  void modifyUserName() {
    primaryFocus?.unfocus();
    isLoading.value = true;
    Map<String, dynamic> reqParams = {
      "uniCode": unicode,
      "userName": userNameUser.text.value,
    };
    PGSpi(Account.modifyUserName.toTarget(inputData: reqParams))
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
        AccountService()
            .updateGamingUserInfo()
            .listen((value) {}, onError: (err) {});
      } else {
        Toast.show(
          context: Get.overlayContext!,
          state: GgToastState.fail,
          title: localized('failed'),
          message: event.message.toString(),
        );
      }
    }).onError((Object error) {
      isLoading.value = false;
      Toast.show(
        context: Get.overlayContext!,
        state: GgToastState.fail,
        title: localized('failed'),
        message: error.toString(),
      );
    });
  }

  void checkParams() {
    if (curIndex.value == 1) {
      enable.value = password.text.isNotEmpty;
    } else if (curIndex.value == 2) {
      enable.value = userNameUser.isPass;
    }
  }
}
