import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_close_button.dart';
import 'package:gogaming_app/pages/base/base_controller.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/widget_header.dart';

import '../mixin/deposit_common_utils_mixin.dart';

abstract class DepositBaseView<Controller extends BaseController>
    extends BaseView<Controller> with DepositCommonUtilsMixin {
  const DepositBaseView({super.key});

  @override
  Color? backgroundColor() {
    return GGColors.background.color;
  }

  String get title;

  List<Widget>? get actions => null;

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      backgroundColor: backgroundColor(),
      leadingIcon: buildCloseButton(),
      title: title,
      titleStyle: GGTextStyle(
        fontSize: GGFontSize.bigTitle20,
        color: GGColors.textMain.color,
        fontWeight: GGFontWeigh.bold,
      ),
      centerTitle: false,
      actions: actions,
    );
  }

  Widget buildCloseButton() {
    return GamingCloseButton(
      onPressed: close,
    );
  }
}
