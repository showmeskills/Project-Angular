import 'dart:io';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../service/upgrade_app_service.dart';

class UpdateApp {
  void updateDialog() async {
    UpdateType needUpdate =
        UpgradeAppService.sharedInstance.checkIfNeedUpdate();

    if (needUpdate == UpdateType.updateTypeForced) {
      WidgetsBinding.instance.addPostFrameCallback((_) async {
        if (Platform.isAndroid) {
          dialog(false);
        } else {
          // 延迟2秒弹窗是为了解决启动系统资源占用过多。点击卡顿的问题
          Future.delayed(const Duration(seconds: 2), () {
            dialog(false);
          });
        }
      });
    } else if (needUpdate == UpdateType.updateTypeOptional) {
      WidgetsBinding.instance.addPostFrameCallback((_) async {
        if (Platform.isAndroid) {
          dialog(true);
        } else {
          Future.delayed(const Duration(seconds: 2), () {
            dialog(true);
          });
        }
      });
    } else {
      Toast.showFailed(localized("current_the_latest_version"));
    }
  }

  Future<void> dialog(bool isUpgradeOptional) {
    return UpgradeAppService.sharedInstance.showUpgradeDialog(
      isUpgradeOptional: isUpgradeOptional,
    );

    // return showDialog<void>(
    //   context: context,
    //   barrierDismissible: isUpgradeOptional,
    //   builder: (BuildContext dialogContext) {
    //     return WillPopScope(
    //       onWillPop: () async => isUpgradeOptional ? true : false,
    //       child: UpdateWidget(isUpgradeOptional: isUpgradeOptional),
    //     );
    //   },
    // );
  }
}
