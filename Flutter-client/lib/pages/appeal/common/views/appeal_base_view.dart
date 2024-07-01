import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/pages/base/base_controller.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/widget_header.dart';

abstract class AppealBaseView<C extends BaseController> extends BaseView<C> {
  const AppealBaseView({super.key});

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      title: title,
      titleStyle: GGTextStyle(
        fontSize: GGFontSize.bigTitle20,
        color: GGColors.textMain.color,
      ),
      centerTitle: false,
    );
  }

  String get title => localized('rech_arriv_inqu00');

  @override
  bool ignoreBottomSafeSpacing() {
    return true;
  }

  Widget bodyContainer({
    required Widget child,
  }) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      decoration: BoxDecoration(
        color: GGColors.popBackground.color,
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(25.dp),
        ),
      ),
      padding: EdgeInsets.symmetric(
        horizontal: 16.dp,
      ),
      child: child,
    );
  }
}
