import 'package:gogaming_app/common/service/shorebird_service.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:flutter/material.dart';

import '../../common/lang/locale_lang.dart';
import '../../common/service/upgrade_app_service.dart';
import '../../common/utils/util.dart';
import '../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../../common/widgets/update/update_dialog.dart';

class AboutUsLogic extends BaseController {
  final isChecking = false.obs;

  final showDebugInfo = false.obs;

  int _tapTime = 0;
  int _tapCount = 0;

  void checkUpdate() {
    isChecking.value = true;
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      UpgradeAppService.sharedInstance.configParameter().listen((event) {
        // 优化按钮多次点击问题
        Future.delayed(const Duration(seconds: 3), () {
          isChecking.value = false;
        });

        UpdateType needUpdate =
            UpgradeAppService.sharedInstance.checkIfNeedUpdate();
        if (needUpdate == UpdateType.updateTypeForced ||
            needUpdate == UpdateType.updateTypeOptional) {
          UpdateApp().updateDialog();
        } else {
          ShorebirdService.sharedInstance.update().then((value) {
            if (value == null) {
              Toast.showSuccessful(localized("latest_v"));
            } else {
              if (value == true) {
                Toast.showSuccessful(localized('update_successful_tips'));
              }
            }
          });
        }
        GGUtil.removePreviouslyInstalledAPK();
      });
    });
  }

  /// 3秒内连续点击5次，显示debug信息
  void debugInfo() {
    if (_tapCount == 0) {
      _tapTime = DateTime.now().millisecondsSinceEpoch;
    }
    _tapCount++;
    if (DateTime.now().millisecondsSinceEpoch - _tapTime > 3000) {
      _tapTime = DateTime.now().millisecondsSinceEpoch;
      _tapCount = 0;
    }
    if (_tapCount == 5) {
      showDebugInfo.value = true;
    }
  }
}
