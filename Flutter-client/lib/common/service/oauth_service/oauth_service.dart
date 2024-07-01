// ignore_for_file: inference_failure_on_function_return_type, library_prefixes

library oauth_service;

import 'dart:io';
import 'package:device_apps/device_apps.dart' as DeviceApps;
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/api/auth/models/gaming_login_model.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_line_sdk/flutter_line_sdk.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/auth/auth_api.dart';
import 'package:gogaming_app/common/api/auth/models/social_user_login_model.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/helper/device_util.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../fingerprint_service/fingerprint_service.dart';

part 'oauth_config.dart';
part 'oauth_view.dart';
part 'oauth_exception.dart';
part 'src/line_oauth_service.dart';
part 'src/google_oauth_service.dart';
part 'src/telegram_oauth_service.dart';

enum SocialType {
  google(0, 'Google'),
  telegram(1, 'Telegram'),
  mateMask(2, 'MetaMask'),
  line(3, 'Line');

  const SocialType(
    this.type,
    this.name,
  );

  final int type;
  final String name;

  factory SocialType.c(String x) {
    return SocialType.values
        .firstWhere((element) => element.name == x, orElse: () => google);
  }

  String get iconUrl {
    switch (this) {
      case SocialType.line:
        return R.oauthLine;
      case SocialType.google:
        return R.oauthGoogle;
      case SocialType.telegram:
        return R.oauthTelegram;
      case SocialType.mateMask:
        return R.oauthMetaMask;
    }
  }
}

enum OAuth {
  google(0, 'Google'),
  // telegram(1, 'Telegram'),
  line(1, 'Line');

  const OAuth(
    this.type,
    this.name,
  );

  final int type;
  final String name;

  factory OAuth.c(String x) {
    return OAuth.values
        .firstWhere((element) => element.name == x, orElse: () => google);
  }
}

extension OAuthExtension on OAuth {
  void onSocialLogin(
    BuildContext context,
    Function(GamingLoginModel? loginResult) loginNext,
    Function(String token) loginTokne,
  ) {
    thirdAuthLogin().listen((event) {
      final isVerify = event.data?.isVerified == true;
      // 第三方账号验证失败
      if (!isVerify) {
        final dialog = DialogUtil(
          context: context,
          iconPath: R.commonDialogErrorBig,
          iconWidth: 80.dp,
          iconHeight: 80.dp,
          title: localized('third_auth_tips'),
          content: localized('third_auth_text'),
          rightBtnName: localized('sure'),
          leftBtnName: '',
          onRightBtnPressed: () {
            Get.back<dynamic>();
          },
        );
        dialog.showNoticeDialogWithTwoButtons();
        return;
      }
      final isRegister = event.data?.isRegister == true;
      // 没有绑定账号
      if (!isRegister) {
        final dialog = DialogUtil(
          context: context,
          iconPath: R.commonDialogErrorBig,
          iconWidth: 80.dp,
          iconHeight: 80.dp,
          title: localized('hint'),
          content: localized('auth_hind'),
          extraBottomWidget: GGButton.main(
            onPressed: () {
              Get.back<dynamic>();
              _registerBySocial(
                name,
                event.data?.socialUserId ?? '',
                loginTokne,
                context,
              );
            },
            text: localized('tutorial_skip'),
            backgroundColor: Colors.transparent,
            textStyle: GGTextStyle(
              fontSize: GGFontSize.bigTitle,
              decoration: TextDecoration.underline,
              color: GGColors.link.color,
            ),
          ),
          rightBtnName: localized('go_reg'),
          leftBtnName: localized('con_bind'),
          onRightBtnPressed: () {
            // 社交媒体注册手机账号
            Get.back<dynamic>();
            Get.toNamed<void>(Routes.socialRegisterPhone.route, arguments: {
              "socialUserId": event.data?.socialUserId ?? '',
              "socialUserType": name,
            });
          },
          onLeftBtnPressed: () {
            // 社交媒体绑定手机账号
            Get.back<dynamic>();
            Get.toNamed<void>(Routes.socialBindPhone.route, arguments: {
              "socialUserId": event.data?.socialUserId ?? '',
              "socialUserType": name,
            });
          },
        );
        dialog.showNoticeDialogWithTwoButtons();
        return;
      }

      final loginResult = event.data?.loginResult;
      loginNext(loginResult);
    }, onError: (Object e) {
      debugPrint('$e');
      if (e is OAuthError) {
        Toast.showFunDev();
      } else if (e is GoGamingResponse) {
        final dialog = DialogUtil(
          context: context,
          iconPath: R.commonDialogErrorBig,
          iconWidth: 80.dp,
          iconHeight: 80.dp,
          title: localized('hint'),
          content: e.message ?? '',
          leftBtnName: '',
        );
        dialog.showNoticeDialogWithTwoButtons();
      } else if (e is String) {
        if (e.isNotEmpty) {
          Toast.showFailed(e);
        }
      } else {
        Toast.showTryLater();
      }
    });
  }

  Future<void> _registerBySocial(
    String socialUserType,
    String socialUserId,
    Function(String token) loginTokne,
    BuildContext context,
  ) async {
    SmartDialog.showLoading<void>();
    final deviceName = await DeviceUtil.getDeviceName();
    final params = {
      "socialUserType": socialUserType,
      "socialUserId": socialUserId,
      "clientName": deviceName,
    };
    PGSpi(Auth.registerBySocial.toTarget(inputData: params))
        .rxRequest<String?>((value) {
      final data = value['data'];
      if (data is String) {
        return data;
      } else {
        return null;
      }
    }).listen((event) {
      SmartDialog.dismiss<void>();
      if (event.data is String) {
        loginTokne(event.data!);
      }
    }, onError: (Object e) {
      SmartDialog.dismiss<void>();
      if (e is GoGamingResponse) {
        final dialog = DialogUtil(
          context: context,
          iconPath: R.commonDialogErrorBig,
          iconWidth: 80.dp,
          iconHeight: 80.dp,
          title: localized('hint'),
          content: e.message ?? '',
          leftBtnName: '',
        );
        dialog.showNoticeDialogWithTwoButtons();
      } else {
        Toast.showTryLater();
      }
    });
  }

  Future<String> login() {
    switch (this) {
      case OAuth.line:
        return LineOAuthService.login();
      case OAuth.google:
        return GoogleOAuthService.login();
      // case OAuth.telegram:
      //   return TelegramOAuthService.login();
    }
  }

  Stream<GoGamingResponse<SocialUserLoginModel?>> thirdAuthLogin() {
    if (FingerprintService.sharedInstance.readVisitorId().isEmpty) {
      return FingerprintService.sharedInstance
          .load()
          .asStream()
          .flatMap((value) {
        return login().asStream().flatMap((value) {
          Map<String, dynamic> param = {};
          switch (this) {
            case OAuth.line:
              param['accessToken'] = value;
              break;
            case OAuth.google:
              param['accessToken'] = value;
              break;
          }
          return _loginBySocial(param);
        });
      });
    }
    return login().asStream().flatMap((value) {
      Map<String, dynamic> param = {};
      switch (this) {
        case OAuth.line:
          param['accessToken'] = value;
          break;
        case OAuth.google:
          param['accessToken'] = value;
          break;
        // case OAuth.telegram:
        //   param['accessToken'] = value;
        //   break;
      }
      return _loginBySocial(param);
    });
  }

  Stream<GoGamingResponse<SocialUserLoginModel?>> _loginBySocial(
      Map<String, dynamic> param) {
    return DeviceUtil.getDeviceName().asStream().flatMap((clientName) {
      Map<String, dynamic> mobileParams = {
        'clientName': clientName,
        'autoLogin': true,
        'userType': name,
      };
      Auth socialAuth = Auth.socialUserLoginLine;
      switch (this) {
        case OAuth.line:
          socialAuth = Auth.socialUserLoginLine;
          break;
        case OAuth.google:
          socialAuth = Auth.socialUserLoginGoogle;
          break;
        // case OAuth.telegram:
        //   socialAuth = Auth.socialUserLoginTelegram;
        //   break;
      }
      mobileParams.addAll(param);
      return PGSpi(socialAuth.toTarget(inputData: mobileParams))
          .rxRequest<SocialUserLoginModel?>((value) {
        final data = value['data'];
        if (data is Map<String, dynamic>) {
          return SocialUserLoginModel.fromJson(data);
        } else {
          return null;
        }
      });
    });
  }

  void onSocialBind(
    BuildContext context,
    Function(GoGamingResponse<dynamic>? loginResult) bindNext,
  ) {
    thirdAuthBind().listen((event) {
      bindNext(event);
    }, onError: (Object e) {
      debugPrint('$e');
      if (e is OAuthError) {
        Toast.showFunDev();
      } else if (e is GoGamingResponse) {
        final dialog = DialogUtil(
          context: context,
          iconPath: R.commonDialogErrorBig,
          iconWidth: 80.dp,
          iconHeight: 80.dp,
          title: localized('hint'),
          content: e.message ?? '',
          leftBtnName: '',
        );
        dialog.showNoticeDialogWithTwoButtons();
      } else if (e is String) {
        if (e.isNotEmpty) {
          Toast.showFailed(e);
        }
      } else {
        Toast.showTryLater();
      }
    });
  }

  Stream<GoGamingResponse<SocialUserLoginModel?>> thirdAuthBind() {
    return login().asStream().flatMap((value) {
      Map<String, dynamic> param = {};
      switch (this) {
        case OAuth.line:
          param['accessToken'] = value;
          break;
        case OAuth.google:
          param['accessToken'] = value;
          break;
      }
      return _bindBySocial(param);
    });
  }

  Stream<GoGamingResponse<SocialUserLoginModel?>> _bindBySocial(
      Map<String, dynamic> param) {
    return DeviceUtil.getDeviceName().asStream().flatMap((clientName) {
      Map<String, dynamic> mobileParams = {
        'clientName': clientName,
        'autoLogin': true,
        'userType': name,
      };
      Auth socialAuth = Auth.socialUserBind;
      mobileParams.addAll(param);
      return PGSpi(socialAuth.toTarget(inputData: mobileParams))
          .rxRequest<SocialUserLoginModel?>((value) {
        final data = value['data'];
        if (data is Map<String, dynamic>) {
          return SocialUserLoginModel.fromJson(data);
        } else {
          return null;
        }
      });
    });
  }

  String get iconUrl {
    switch (this) {
      case OAuth.line:
        return R.oauthLine;
      // case OAuth.telegram:
      //   return R.oauthTelegram;
      case OAuth.google:
        return R.oauthGoogle;
    }
  }
}

class OAuthService {
  factory OAuthService() => _getInstance();

  static OAuthService get sharedInstance => _getInstance();

  static OAuthService? _instance;

  static OAuthService _getInstance() {
    _instance ??= OAuthService._internal();
    return _instance!;
  }

  OAuthService._internal();

  List<OAuth> _method = [];
  List<OAuth> get method => _method;

  void updateMethod(List<String> value) {
    _method = List<OAuth>.from(OAuth.values)
      ..retainWhere((element) => value.contains(element.name));
  }
}
