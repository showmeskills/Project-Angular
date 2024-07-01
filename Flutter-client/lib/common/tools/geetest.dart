// ignore_for_file: inference_failure_on_instance_creation

import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';

// import 'package:gt3_flutter_plugin/gt3_flutter_plugin.dart';
import 'package:gogaming_app/common/api/auth/auth_api.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/config/environment.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:gt4_flutter_plugin/gt4_flutter_plugin.dart';
import 'package:gt4_flutter_plugin/gt4_session_configuration.dart';

import '../api/base/base_api.dart';

class GeeTest {
  /// 获取滑块验证码
  static Stream<Map<String, dynamic>?> getCaptcha(VerifyAction action) {
    if (Config.sharedInstance.environment.skipGeeTest) {
      return _skipCaptcha(action);
    }

    return PGSpi(Auth.getCaptchaId.toTarget()).rxRequest<String?>((value) {
      final data = value['data'];
      if (data is String) {
        return data;
      } else {
        // 当前的默认值 后台可能会变更
        return '8e70fbcfd4b962042708958742ebea76';
        // return null;
      }
    }).onErrorResume((error, stackTrace) {
      return Stream.value(GoGamingResponse(
        success: true,
        data: '8e70fbcfd4b962042708958742ebea76',
        code: '',
      ));
    }).flatMap((value) {
      if (value.data is String) {
        return getGeeTest(value.data!, action).asStream();
      } else {
        return Stream.error(value);
      }
    });
  }

  /// 获取滑块验证码
  // static Stream<Map<String, dynamic>?> getCaptcha3(VerifyAction action) {
  //   return PGSpi(Auth.getCaptcha
  //           .toTarget(input: {'client': 'native', 'action': action.value}))
  //       .rxRequest<Map<String, dynamic>?>((value) {
  //     final data = value['data'];
  //     if (data is Map<String, dynamic>) {
  //       return data;
  //     } else {
  //       return null;
  //     }
  //   }).flatMap((value) {
  //     if (value.data is Map<String, dynamic>) {
  //       return getGeeTest(value.data!).asStream();
  //     } else {
  //       return Stream.error(value);
  //     }
  //   });
  // }

  static Stream<Map<String, dynamic>?> _skipCaptcha(VerifyAction action) {
    final result = Map<String, String>.from({
      "lotNumber": '',
      "captchaOutput": '',
      "passToken": '',
      "genTime": '',
    });
    return Stream.value(result);
  }

  static Completer<Map<String, dynamic>?>? c;

  static Future<Map<String, dynamic>?> getGeeTest(
    String id,
    VerifyAction action,
  ) async {
    if (c == null || c?.isCompleted == true) {
      c = Completer<Map<String, dynamic>?>();
      final Gt4FlutterPlugin captcha = Gt4FlutterPlugin(
          id,
          GT4SessionConfiguration(
            timeout: 15000,
            language: geetestLanguage,
            additionalParameter: {'hideSuccess': true},
          ));
      captcha.verify();
      captcha.addEventHandler(onShow: (Map<String, dynamic> message) async {
        debugPrint("Captcha did show");
      }, onResult: (Map<String, dynamic> message) async {
        debugPrint("Captcha result: $message");

        if (message["status"] == "1") {
          final geetestResp = message["result"] as Map;
          final result = Map<String, String>.from({
            "lotNumber": geetestResp['lot_number'],
            "captchaOutput": geetestResp['captcha_output'],
            "passToken": geetestResp['pass_token'],
            "genTime": geetestResp['gen_time'],
          });
          complete(result);
        } else {
          // 终端用户完成验证错误，自动重试
          debugPrint("Captcha 'onResult' state: ${message["status"]}");
          // Future(() {
          //   c?.complete(null);
          // });
        }
      }, onError: (Map<String, dynamic> message) async {
        debugPrint("Captcha onError: $message");

        final code = message["code"];
        //非用户手动取消
        if (code != '-20100') {
          Sentry.captureException(GeeTestError(message));
          if (action == VerifyAction.login || action == VerifyAction.register) {
            // 登录注册时 报错可以传空字符
            final result = Map<String, String>.from({
              "lotNumber": '',
              "captchaOutput": '',
              "passToken": '',
              "genTime": '',
            });
            complete(result);
            return;
          }
          Toast.showTryLater();
        }
        complete(null);
      });
    }

    return c!.future;
  }

  static void complete(Map<String, dynamic>? result) {
    // 由于安卓系统webview内存回收较慢 导致频繁点击时 回掉无法触发
    // 所以安卓系统需要延迟1s
    final duration = Platform.isAndroid
        ? const Duration(milliseconds: 1000)
        : const Duration(milliseconds: 0);
    Future.delayed(duration, () {
      c?.complete(result);
    });
  }

  /// zho、eng、zho-tw、zho-hk、udm、jpn、ind、kor、rus、ara、spa、pon、por、fra、deu
  static String get geetestLanguage {
    final languageCode = AppLocalizations.of(Get.context!).locale.languageCode;
    switch (languageCode) {
      case 'zh':
        return 'zho';
      case 'en':
        return 'eng';
      case 'ja':
        return 'jpn';

      // case 'th':
      //   return 'TH';
      // case 'vi':
      //   return 'VN';
      default:
        return 'eng';
    }
  }

// static Future<Map<String, dynamic>?> getGeeTest3(
//     Map<String, dynamic> data) async {
//   // 当geetest服务报错时 略过geetest服务 直接回数据
//   if (data['success'] != 1) {
//     return Map<String, String>.from({
//       "challenge": data['challenge'],
//       "validate": data['challenge'],
//       "seccode": data['challenge'],
//     });
//   }
//
//   if (c == null || c?.isCompleted == true) {
//     c = Completer<Map<String, dynamic>?>();
//     Gt3FlutterPlugin captcha = Gt3FlutterPlugin();
//
//     // 从服务端接口获取验证参数 Get validation parameters from the server API
//     Gt3RegisterData registerData = Gt3RegisterData(
//       gt: data['gt'].toString(),
//       // 验证ID，从极验后台创建 Verify ID, created from the geetest dashboard
//       challenge: data['challenge'].toString(),
//       // 从极验服务动态获取 Gain challenges from geetest
//       success: true,
//     ); // 对极验服务的心跳检测 Check if it is success
//
//     captcha.startCaptcha(registerData);
//     captcha.addEventHandler(onShow: (Map<String, dynamic> message) async {
//       // 验证视图已展示
//       // print("Captcha did show");
//     }, onClose: (Map<String, dynamic> message) async {
//       // 验证视图已关闭
//       // print("Captcha did close");
//       Future(() {
//         c?.complete(null);
//       });
//     }, onError: (Map<String, dynamic> event) {
//       // 验证视图报错
//       debugPrint("Captcha did onError: $event");
//       Future(() {
//         c?.complete(null);
//       });
//     }, onResult: (Map<String, dynamic> message) async {
//       final geetestResp = message['result'];
//       final result = Map<String, String>.from({
//         "challenge": geetestResp["geetest_challenge"],
//         "validate": geetestResp["geetest_validate"],
//         "seccode": geetestResp["geetest_seccode"],
//       });
//       Future(() {
//         c?.complete(result);
//       });
//     });
//   }
//   return c!.future;
// }
}
