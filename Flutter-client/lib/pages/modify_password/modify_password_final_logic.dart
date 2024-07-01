import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';

import '../../common/lang/locale_lang.dart';

class ModifyPasswordFinalLogic extends BaseController {
  @override
  void onReady() {
    Toast.show(
        context: Get.overlayContext!,
        state: GgToastState.success,
        title: localized('completed'),
        message: localized("pwd_change_success"));
    super.onReady();
  }

  void sure() {
    Get.offNamed<dynamic>(Routes.login.route);
  }
}
