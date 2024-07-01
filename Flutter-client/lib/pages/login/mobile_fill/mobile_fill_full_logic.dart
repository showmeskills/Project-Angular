import 'package:base_framework/base_controller.dart';
import 'package:otp_text_field/otp_field.dart';

class MobileFillFullLogic extends GetxController {
  final enableNext = false.obs;
  final pin = ''.obs;
  OtpFieldController fillController = OtpFieldController();
  @override
  void onInit() {
    super.onInit();
    ever<String>(pin, (value) => enableNextBtn(value));
  }

  @override
  void onReady() {
    fillController.setFocus(0);
  }

  void enableNextBtn(String text) {
    enableNext.value = text.length == 6;
  }

  // @override
  // void onClose() {
  //   super.onClose();
  // }
}
