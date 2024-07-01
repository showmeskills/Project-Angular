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
import 'package:gogaming_app/pages/base/base_controller.dart';
import 'package:gogaming_app/pages/main/main_logic.dart';
import 'package:gogaming_app/router/app_pages.dart';

class GamingUnbindEmailLogic extends BaseController {
  RxInt curIndex = 1.obs;

  /// 密码
  RxString password = ''.obs;

  /// 完整手机号
  RxString fullMobile = ''.obs;

  RxBool isVoice = false.obs;

  RxBool isLoading = false.obs;

  RxString unicode = ''.obs;

  MobilePhoneVerificationStatus verificationStatus =
      MobilePhoneVerificationStatus.unSend;

  late GamingTextFieldController emailOptController;
  late GamingTextFieldController mobileOptController;

  late GamingUserModel user;

  RxBool enableNext = false.obs;

  @override
  void onInit() {
    super.onInit();

    emailOptController = GamingTextFieldController(validator: [
      GamingTextFieldValidator(
        reg: RegExp(r'^\d{6}$'),
      ),
    ])
      ..textController.addListener(() {
        checkParams();
      });

    user = AccountService.sharedInstance.gamingUser!;

    mobileOptController = GamingTextFieldController(validator: [
      GamingTextFieldValidator(
        reg: RegExp(r'^\d{6}$'),
      ),
    ])
      ..textController.addListener(() {
        checkParams();
      });
  }

  bool isBindMobileValid() {
    return user.isBindMobile ?? false;
  }

  /// 解绑邮箱
  void unbindEmail() {
    isLoading.value = true;
    Map<String, dynamic> reqParams = {
      "areaCode": GGUtil.parseStr(user.areaCode),
      "mobile": GGUtil.parseStr(fullMobile.value),
      "otpCode": GGUtil.parseStr(mobileOptController.text.value),
      "otpType": VerifyAction.unBindEmail.value,
      "smsVoice": isVoice.value,
      "emailCode": emailOptController.text.value,
    };

    debugPrint('reqParams = $reqParams');
    PGSpi(Account.unbindEmail.toTarget(inputData: reqParams))
        .rxRequest<dynamic>((value) {
      if ((value.isNotEmpty) && value['success'] == true) {
        // print('unbindEmail value = $value');
        curIndex.value = 2;
        AccountService().updateGamingUserInfo().listen((value) {
          GamingEvent.unBindEmailSuccess.notify();
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
      if (event.code == '2117') {
        AccountService.sharedInstance.logout();
        Get.until((route) => Get.currentRoute == Routes.main.route);
        Get.find<MainLogic>().changeSelectIndex(-1);
        return;
      }
    }).onError((Object error) {
      isLoading.value = false;
      // 账号验证5次失败，强制登出
      if (error is GoGamingResponse && error.code == '2117') {
        AccountService.sharedInstance.logout();
        Get.until((route) => Get.currentRoute == Routes.main.route);
        Get.find<MainLogic>().changeSelectIndex(-1);
        return;
      }
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
  }

  void checkParams() {
    bool emailPass = emailOptController.isPass && mobileOptController.isPass;
    enableNext.value = emailPass;
  }
}
