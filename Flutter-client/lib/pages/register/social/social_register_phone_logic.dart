import 'package:base_framework/base_controller.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/base/go_gaming_response.dart';
import 'package:gogaming_app/common/api/base/go_gaming_service.dart';
import 'package:gogaming_app/common/tools/geetest.dart';
import 'package:gogaming_app/common/tracker/event.dart';
import 'package:gogaming_app/common/tracker/gaming_data_collection.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/helper/device_util.dart';
import 'package:gogaming_app/pages/register/register_logic.dart';

class SocialRegisterPhoneLogic extends RegisterLogic {
  SocialRegisterPhoneLogic(this.socialUserType, this.socialUserId);
  final String socialUserType;
  final String socialUserId;

  @override
  void onInit() {
    super.onInit();
    // 设置手机号模式
    tabController.index = 1;
  }

  Future<void> socialRegister() async {
    /// 关闭强度检测2种方式
    /// 1. 使用controller hasFocus属性 和 hidePopup() 方法
    /// 2. 移除聚焦，则自动关闭
    primaryFocus?.unfocus();
    isLoadingUser.value = true;
    final deviceName = await DeviceUtil.getDeviceName();
    GeeTest.getCaptcha(VerifyAction.register).flatMap((geetestParams) {
      if (geetestParams == null) return Stream.value(false);
      final socialParams = Map<String, String>.from({
        "socialUserType": socialUserType,
        "socialUserId": socialUserId,
      });
      geetestParams.addAll(socialParams);
      return getOTPCode().asStream().flatMap((value) {
        if (value == null) {
          return Stream.value(false);
        } else {
          Map<String, dynamic> dataMap = {
            "actionvalue1": 0,
          };
          GamingDataCollection.sharedInstance
              .submitDataPoint(TrackEvent.clickRegister, dataMap: dataMap);
          return registerByMobile(geetestParams, deviceName, value);
        }
      });
    }).listen((event) {
      isLoadingUser.value = false;
      if (event is GoGamingResponse<dynamic> && event.data is String) {
        /// 刷新api的用户token
        GoGamingService.sharedInstance
            .updateToken(event.data as String, isUser: true);
        loginSuccess();
      }
    }).onError((Object error) {
      isLoadingUser.value = false;
      if (error is GoGamingResponse) {
        loginFail(error);
      } else {
        Toast.showTryLater();
      }
    });
  }
}
