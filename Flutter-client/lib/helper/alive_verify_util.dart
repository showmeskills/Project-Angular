import 'package:gogaming_app/helper/perimission_util.dart';
import 'package:gogaming_app/router/app_pages.dart';

import '../common/api/base/base_api.dart';
import '../common/lang/locale_lang.dart';
import '../common/widgets/gg_dialog/dialog_util.dart';

class AliveVerifyUtil {
  static void check() async {
    final dialog = DialogUtil(
      context: Get.overlayContext!,
      title: localized('alive_verify'),
      content: localized('verify_mobile_msg_p'),
      rightBtnName: localized('confirm_button'),
      leftBtnName: '',
      onRightBtnPressed: () {
        GamingPermissionUtil.camera().then((value) {
          Get.offAndToNamed<void>(Routes.aliveVerify.route);
        });
      },
    );
    dialog.showNoticeDialogWithTwoButtons();
  }
}
