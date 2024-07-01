import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/widget_header.dart';

abstract class WalletBaseView<Controller extends BaseController>
    extends BaseView<Controller> {
  const WalletBaseView({super.key});

  @override
  String get tag => super.hashCode.toString();

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.userBottomAppbar(
      title: localized('wallet_over'),
    );
  }

  @override
  Color backgroundColor() {
    return GGColors.background.color;
  }

  @override
  bool ignoreBottomSafeSpacing() {
    return true;
  }

  Widget buildOverview();
}
