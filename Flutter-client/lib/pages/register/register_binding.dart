import 'package:base_framework/base_controller.dart';
import 'package:gogaming_app/pages/register/register_logic.dart';

import 'check_phone_logic.dart';

class RegisterBing extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<RegisterLogic>(
      () => RegisterLogic(),
    );
    Get.lazyPut<CheckPhoneLogic>(
      () => CheckPhoneLogic(),
    );
  }
}
