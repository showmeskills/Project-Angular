import 'dart:async';

import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/controller_header.dart';

import '../../common/api/auth/auth_api.dart';
import '../../common/lang/locale_lang.dart';
import '../../common/tools/geetest.dart';
import '../../common/widgets/gg_dialog/go_gaming_toast.dart';

class CheckEmailLogic extends BaseController {
  late GamingTextFieldController checkEmail;
  var codeState = CodeState.unSend.obs;
  RxInt secondLeft = 90.obs;
  RxBool buttonEnable = false.obs;
  Timer? timer;

  late String email;

  @override
  void onInit() {
    super.onInit();
    checkEmail = GamingTextFieldController(validator: [
      GamingTextFieldValidator(
        reg: RegExp(r'^\d{6}$'),
      ),
    ]);

    checkEmail.textController.addListener(() {
      buttonEnable.value = checkEmail.isPass;
    });
  }

  void _startTimer() {
    timer = Timer.periodic(const Duration(seconds: 1), (object) {
      if (secondLeft.value > 0) {
        secondLeft.value -= 1;
      } else {
        timer?.cancel();
        secondLeft.value = 90;
        codeState.value = CodeState.reSend;
      }
    });
  }

  void _reqOtpCodeFinal(Map<String, dynamic> geetestData) async {
    Map<String, dynamic> reqParams = {
      "email": email,
      "otpType": "0",
    };
    reqParams.addAll(geetestData);

    PGSpi(Auth.sendEmailVerify.toTarget(inputData: reqParams))
        .rxRequest<dynamic>((value) {
      return value;
    }).listen((event) {
      if (event.success == true) {
        codeState.value = CodeState.send;
        _startTimer();
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.success,
            title: localized('completed'),
            message: localized("send_email_success"));
      }
    }).onError((Object error) {
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

  // Future<void> _reqOtpCode() async {
  //   callDataService<void>(Auth.getCaptchaId.toTarget(), (value) async {
  //     final res = value['data'] as String;
  //     final geetestDataRes = await GeeTest.getGeeTest(res);
  //     if (geetestDataRes != null) {
  //       _reqOtpCodeFinal(geetestDataRes);
  //     }
  //   });
  // }

  void sendEmailCheck() {
    // _reqOtpCode();
    GeeTest.getCaptcha(VerifyAction.register).listen((event) {
      if (event != null) {
        _reqOtpCodeFinal(event);
      }
    }, onError: (Object error) {
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

  @override
  void onClose() {
    super.onClose();
    timer?.cancel();
    timer = null;
  }
}

enum CodeState {
  unSend,
  send,
  reSend,
}
