// ignore_for_file: unused_import

import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';
import 'package:gogaming_app/common/theme/text_styles/gg_text_styles.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/register/views/verification_tip_widget.dart';

/// @Description 显示弹窗dialog工具类
class VerificationTip {
  final BuildContext context;

  VerificationTip({
    required this.context,
  });

  /// 左右两个按钮
  void showNoticeDialogWithTwoButtons() {
    _showGeneralDialog(builder: (BuildContext context) {
      return PopScope(
        canPop: false,
        child: AnimatedPadding(
          padding: EdgeInsets.symmetric(horizontal: 16.dp, vertical: 16.dp),
          duration: const Duration(milliseconds: 100),
          curve: Curves.decelerate,
          child: MediaQuery.removeViewInsets(
            removeLeft: true,
            removeTop: true,
            removeRight: true,
            removeBottom: true,
            context: context,
            child: Center(
              child: Material(
                borderRadius: BorderRadius.circular(14.dp),
                child: _noticeViewWithTwoButtons(context),
              ),
            ),
          ),
        ),
      );
    });
  }

  /// 重写showGeneralDialog,系统自带的背景背景透明不能修改
  void _showGeneralDialog({
    required Widget Function(BuildContext) builder,
    Widget? child,
  }) {
    showGeneralDialog(
      context: context,
      pageBuilder: (BuildContext buildContext, Animation<double> animation,
          Animation<double> secondaryAnimation) {
        final Widget pageChild = child ?? Builder(builder: builder);
        return SafeArea(
          child: Builder(builder: (BuildContext context) {
            return pageChild;
          }),
        );
      },
      barrierDismissible: true,
      barrierLabel: MaterialLocalizations.of(context).modalBarrierDismissLabel,
      barrierColor: Colors.black54,
      transitionDuration: const Duration(milliseconds: 150),
      transitionBuilder: (BuildContext context, Animation<double> animation,
          Animation<double> secondaryAnimation, Widget child) {
        return FadeTransition(
          opacity: CurvedAnimation(
            parent: animation,
            curve: Curves.easeOut,
          ),
          child: child,
        );
      },
    );
  }

  Widget _noticeViewWithTwoButtons(BuildContext context) {
    return const VerificationTipWidget();
  }
}
