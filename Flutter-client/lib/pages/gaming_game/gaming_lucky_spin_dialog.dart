import 'package:flutter/material.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/widget_header.dart';

import 'gaming_lucky_spin/gaming_lucky_spin_view.dart';
import 'gaming_lucky_spin_m1/gaming_lucky_spin_view_m1.dart';

class GamingLuckySpinDialog {
  GamingLuckySpinDialog();

  void showGamingLuckySpin() {
    // ignore: inference_failure_on_function_invocation
    Get.generalDialog(
        barrierLabel: MaterialLocalizations.of(Get.overlayContext!)
            .modalBarrierDismissLabel,
        barrierDismissible: true,
        pageBuilder: (BuildContext context, Animation<double> animation,
            Animation<double> secondaryAnimation) {
          return Center(
            child: Material(
              elevation: 0,
              borderRadius: BorderRadius.circular(20.dp),
              child: Config.isM1
                  ? GamingLuckySpinViewM1(context: context)
                  : GamingLuckySpinView(context: context),
            ),
          );
        });
  }
}
