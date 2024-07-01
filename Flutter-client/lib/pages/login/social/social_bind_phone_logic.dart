import 'package:gogaming_app/common/api/auth/auth_api.dart';
import 'package:gogaming_app/common/api/auth/models/gaming_login_model.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/base/go_gaming_service.dart';
import 'package:gogaming_app/common/tools/geetest.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/helper/device_util.dart';
import 'package:gogaming_app/helper/encrypt.dart';
import 'package:gogaming_app/pages/login/login_logic.dart';

class SocialBindPhoneLogic extends LoginLogic {
  SocialBindPhoneLogic(this.socialUserType, this.socialUserId) {
    autoLogin.value.isRemember = false;
    // 设置手机号模式
    tabController.index = 1;
  }

  final String socialUserType;
  final String socialUserId;

  void socialLoginByPhone() async {
    isLoginLoading.value = true;
    final deviceName = await DeviceUtil.getDeviceName();
    GeeTest.getCaptcha(VerifyAction.login).flatMap((geetestParams) {
      if (geetestParams == null) return Stream.value(false);
      return _loginBySocialMobile(geetestParams, deviceName);
    }).listen((event) {
      isLoginLoading.value = false;
      if (event is GoGamingResponse<GamingLoginModel?>) {
        /// 刷新api的用户token
        GoGamingService.sharedInstance
            .updateToken(event.data?.token, isUser: true);

        if (event.data?.need2Fa == true) {
          toLogin2fa(event.data!);
        } else {
          loginSuccess();
        }
      }
    }).onError((Object error) {
      isLoginLoading.value = false;
      if (error is GoGamingResponse) {
        loginFail(error);
      } else {
        Toast.showTryLater();
      }
    });
  }

  Stream<GoGamingResponse<GamingLoginModel?>> _loginBySocialMobile(
      Map<String, dynamic> geetestParams, String deviceName) {
    Map<String, dynamic> mobileParams = {
      "password": Encrypt.encodeString(state.mobilePassword.text.value),
      "autoLogin": isAutoLogin,
      "clientName": deviceName,
      "mobile": state.mobile.text.value,
      "areaCode": state.country.areaCode,
      "socialUserType": socialUserType,
      "socialUserId": socialUserId,
    };
    mobileParams.addAll(geetestParams);
    return PGSpi(
            Auth.socialUserBindLoginByMobile.toTarget(inputData: mobileParams))
        .rxRequest<GamingLoginModel?>((value) {
      final data = value['data'];
      if (data is Map<String, dynamic>) {
        return GamingLoginModel.fromJson(data);
      } else {
        return null;
      }
    });
  }
}
