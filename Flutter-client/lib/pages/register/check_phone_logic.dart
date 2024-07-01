import 'dart:async';

import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/controller_header.dart';

import '../../common/api/auth/auth_api.dart';
import '../../common/lang/locale_lang.dart';
import '../../common/tools/geetest.dart';
import '../../common/widgets/gg_dialog/go_gaming_toast.dart';

class CheckPhoneLogic extends BaseController {
  late GamingTextFieldController checkPhone;
  var phoneCodeState = PhoneCodeState.unSend.obs;
  RxInt secondLeft = 90.obs;
  RxBool buttonEnable = false.obs;
  Timer? timer;

  late String mobile;
  late String areaCode;

  @override
  void onInit() {
    super.onInit();
    checkPhone = GamingTextFieldController(validator: [
      GamingTextFieldValidator(
        reg: RegExp(r'^\d{6}$'),
      ),
    ]);

    checkPhone.textController.addListener(() {
      buttonEnable.value = checkPhone.isPass;
    });
  }

  void _startTimer() {
    timer?.cancel();
    timer = Timer.periodic(const Duration(seconds: 1), (object) {
      if (secondLeft.value > 0) {
        secondLeft.value -= 1;
      } else {
        timer?.cancel();
        secondLeft.value = 90;
        phoneCodeState.value = PhoneCodeState.reSend;
      }
    });
  }

  void _reqOtpCodeFinal(Map<String, dynamic> geetestData, String action,
      {bool isVoice = false}) async {
    Map<String, dynamic> reqParams = {
      "areaCode": areaCode,
      "mobile": mobile,
      "smsVoice": isVoice,
      "otpType": action,
    };
    reqParams.addAll(geetestData);

    PGSpi(Auth.requestOtpCode.toTarget(inputData: reqParams))
        .rxRequest<dynamic>((value) {
      return value;
    }).listen((event) {
      if (event.success == true) {
        phoneCodeState.value = PhoneCodeState.send;
        _startTimer();
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.success,
            title: localized('completed'),
            message: isVoice
                ? localized("voice_send_success")
                : localized("send_sms_success"));
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

  Future<void> _reqOtpCode(String action, {bool isVoice = false}) async {
    GeeTest.getCaptcha(VerifyActionExtension.convert(action)).doOnData((value) {
      if (value != null) {
        _reqOtpCodeFinal(value, action, isVoice: isVoice);
      }
    }).listen((event) {}, onError: (Object err) {
      //获取失败
      Toast.show(
        context: Get.overlayContext!,
        state: GgToastState.fail,
        title: localized('failed'),
        message: err.toString(),
      );
    });
  }

  void sendPhoneCheck({bool isVoice = false}) {
    _reqOtpCode("Register", isVoice: isVoice);
  }

  String encryptedMobileNo(String mobile) {
    return mobile.replaceRange(mobile.length - 6, mobile.length, "******");
  }

  @override
  void onClose() {
    super.onClose();
    timer?.cancel();
    timer = null;
  }
}

enum PhoneCodeState {
  unSend,
  send,
  reSend,
}
