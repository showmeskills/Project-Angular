import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/controller_header.dart';

import 'account_service.dart';

class SecureService {
  factory SecureService() => _getInstance();

  static SecureService get sharedInstance => _getInstance();

  static SecureService? _instance;

  static SecureService _getInstance() {
    _instance ??= SecureService._internal();
    return _instance!;
  }

  SecureService._internal();

  /// 检测是否符合安全条件（Google认证/绑定手机号）只检测而不给出弹窗
  bool checkSecureOnly({
    void Function()? onConfirmBtnClicked,
  }) {
    return AccountService.sharedInstance.gamingUser?.secure ?? false;
  }

  /// 检测是否符合安全条件（Google认证/绑定手机号）
  bool checkSecure({
    void Function()? onConfirmBtnClicked,
  }) {
    if (AccountService.sharedInstance.gamingUser?.secure ?? false) {
      return true;
    }
    // 不符合条件-展示提示框
    final dialog = DialogUtil(
      context: Get.overlayContext!,
      title: localized('to_ke_u_safe00'),
      content: localized('to_ke_u_safe_tips00'),
      rightBtnName: localized('sure'),
      leftBtnName: localized('cancels'),
      onRightBtnPressed: () {
        Get.back<dynamic>();
        if (onConfirmBtnClicked != null) {
          onConfirmBtnClicked();
        } else {
          _navigateToSecurePage();
        }
      },
    );
    dialog.showNoticeDialogWithTwoButtons();
    return false;
  }

  // 打开安全认证
  void _navigateToSecurePage() {
    Get.toNamed<dynamic>(Routes.accountSecurity.route);
  }
}
