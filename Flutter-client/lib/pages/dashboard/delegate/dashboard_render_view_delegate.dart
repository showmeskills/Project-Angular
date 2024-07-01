import 'package:flutter/material.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/common/widgets/go_gaming_empty.dart';
import 'package:gogaming_app/widget_header.dart';

mixin DashboardRenderViewDelegate on BaseSingleRenderViewDelegate {
  @override
  Widget? getLoadingWidget(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 16.dp),
      child: const GoGamingLoading(
        alignment: Alignment.center,
      ),
    );
  }

  @override
  Widget? getFailedWidget(BuildContext context,
      [void Function()? onErrorPressed]) {
    return null;
  }

  @override
  Widget? getEmptyWidget(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(top: 20.dp),
      child: GoGamingEmpty(text: emptyText),
    );
  }
}
