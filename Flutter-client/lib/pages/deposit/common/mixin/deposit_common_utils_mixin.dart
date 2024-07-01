import 'package:flutter/services.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/helper/deposit_router_util.dart';
import 'package:gogaming_app/pages/main/main_logic.dart';
import 'package:gogaming_app/widget_header.dart';

mixin DepositCommonUtilsMixin {
  void copyToClipboard(String text) {
    Clipboard.setData(ClipboardData(
      text: text,
    ));
    Toast.showMessage(
      state: GgToastState.success,
      message: localized('copy_succe'),
    );
  }

  void close() {
    DepositRouterUtil.close();
  }

  void navigateToWalletHome() {
    Get.until((route) => Get.currentRoute == Routes.main.route);
    Get.find<MainLogic>().changeSelectIndex(4);
  }

  void navigateToHome() {
    Get.until((route) => Get.currentRoute == Routes.main.route);
    Get.find<MainLogic>().changeSelectIndex(-1);
  }
}
