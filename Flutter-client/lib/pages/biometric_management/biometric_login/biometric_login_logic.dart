import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import '../../../common/api/auth/auth_api.dart';
import '../../../common/api/base/go_gaming_service.dart';
import '../../../common/lang/locale_lang.dart';
import '../../../common/service/account_service.dart';
import '../../../common/service/biometric_service.dart';
import '../../../common/widgets/gg_dialog/dialog_util.dart';
import '../../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../../../controller_header.dart';
import '../../../helper/device_util.dart';
import 'package:local_auth/error_codes.dart';
import 'dart:io';

class BiometricLoginLogic extends BaseController {
  RxBool enableChangeToPassword = true.obs;
  late BuildContext context;
  void login() {
    BiometricService.sharedInstance
        .authenticate(
      reason: localized('biometric_add_reason'),
    )
        .then((value) {
      if (value) {
        _loginByBiometrics();
      } else {
        if (Platform.isIOS) {
          Get.offNamed<dynamic>(Routes.login.route);
        }
      }
    }).onError<PlatformException>((err, s) {
      if (err.message == 'Authentication canceled.') {
        Toast.showFailed(localized('biometric_canceled'));
        return;
      }
      if (err.code == notEnrolled) {
        // 未注册生物识别
        BiometricService.sharedInstance.showNotEnrolledDialog();
      } else if (err.code == permanentlyLockedOut) {
        //失败次数太多 解锁需要 PIN/图案/密码等强身份验证。
        BiometricService.sharedInstance.showPermanentlyDialog();
      } else if (err.code == lockedOut) {
        //失败次数太多
        BiometricService.sharedInstance.showLockedOutDialog();
      } else {
        // 其他错误
        Toast.showFailed(localized('try_later'));
      }
    });
  }

  void _loginByBiometrics() async {
    final deviceName = await DeviceUtil.getDeviceName();
    String? token = await BiometricService.sharedInstance.getToken();
    Map<String, dynamic> accountParams = {
      "clientName": deviceName,
      "token": token
    };
    enableChangeToPassword.value = false;
    PGSpi(Auth.loginByBiometric.toTarget(inputData: accountParams))
        .rxRequest<String?>((value) {
      final data = value['data'];
      if (data is String) {
        return GGUtil.parseStr(data);
      } else {
        return null;
      }
    }).listen((event) {
      enableChangeToPassword.value = true;

      /// 刷新api的用户token
      GoGamingService.sharedInstance
          .updateToken(event.data ?? '', isUser: true);

      loginSuccess();
    }).onError((Object error) {
      enableChangeToPassword.value = true;
      if (error is GoGamingResponse) {
        loginFail(error);
      } else {
        Toast.showFailed(localized('try_again_after_switching_the_network'));
      }
    });
  }

  void loginSuccess() {
    // _rememberLogin();
    AccountService().updateGamingUserInfo().listen((value) {
      if (value == true) {
        // 关闭登录、注册相关页面
        Get.until((route) => !Routes.loginRoutes.contains(route.settings.name));
        Get.back<dynamic>();
        Future.delayed(const Duration(milliseconds: 900), () {
          GamingEvent.login.notify();
        });
      }
    });
  }

  void loginFail(GoGamingResponse<dynamic> response) {
    if (response.success) return;
    if (GoGamingError.accountLocked == response.error ||
        GoGamingError.accountForbidden == response.error) {
      final title = GoGamingError.accountLocked == response.error
          ? localized('acc_lock00')
          : localized('acc_disab00');
      final rightBtnName = GoGamingError.accountLocked == response.error
          ? localized('chage_paswd00')
          : localized('con_cus_ser00');
      final dialog = DialogUtil(
        context: context,
        title: title,
        content: localized('acc_d_con'),
        rightBtnName: rightBtnName,
        onRightBtnPressed: () {
          Get.back<dynamic>();
        },
      );
      dialog.showNoticeDialogWithTwoButtons();
    } else if (GoGamingError.biometricBeDeleted == response.error) {
      BiometricService.sharedInstance.removeKey();
      Toast.show(
        context: Get.overlayContext!,
        state: GgToastState.fail,
        title: localized('hint'),
        message: response.toString(),
      );
    } else {
      Toast.show(
        context: Get.overlayContext!,
        state: GgToastState.fail,
        title: localized('hint'),
        message: response.toString(),
      );
    }
  }
}
