import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';

import 'wallet_common_ui_mixin.dart';

mixin WalletRenderDelegate on RenderDelegate, WalletCommonUIMixin {
  @override
  Widget? getLoadingWidget(BuildContext context) {
    return buildOverviewContainer(
      padding: EdgeInsets.zero,
      child: super.getLoadingWidget(context)!,
    );
  }

  @override
  Widget? getFailedWidget(BuildContext context,
      [void Function()? onErrorPressed]) {
    // return buildOverviewContainer(
    //   padding: EdgeInsets.zero,
    //   child: super.getFailedWidget(context)!,
    // );
    return null;
  }
}
