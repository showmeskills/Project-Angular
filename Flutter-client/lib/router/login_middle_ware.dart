// ignore_for_file: strict_raw_type

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/controller_header.dart';

import '../common/service/biometric_service.dart';

/// 用来规定必须先登录的页面
class LoginMiddleware extends GetMiddleware {
  bool get isLogin => AccountService().isLogin;

  @override
  RouteSettings? redirect(String? route) {
    return isLogin || route == Routes.login.route
        ? super.redirect(route)
        : BiometricService.sharedInstance.canBiometricLogin()
            ? RouteSettings(name: Routes.biometricLogin.route)
            : RouteSettings(name: Routes.login.route);
  }
}
