import 'package:base_framework/base_framework.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/go_gaming_empty.dart';
import 'package:gogaming_app/common/widgets/go_gaming_failed.dart';
import 'package:gogaming_app/common/widgets/go_gaming_loading.dart';

mixin SingleRenderViewDelegate on SingleRenderControllerMixin
    implements BaseSingleRenderViewDelegate {
  @override
  SingleRenderViewController get renderController => controller;

  @override
  String? get emptyText => null;

  @override
  Widget? getEmptyWidget(BuildContext context) {
    return GoGamingEmpty(text: emptyText);
  }

  @override
  Widget? getFailedWidget(BuildContext context,
      [void Function()? onErrorPressed]) {
    return GoGamingFailed(
      onPressed: onErrorPressed,
    );
  }

  @override
  Widget? getLoadingWidget(BuildContext context) {
    return const GoGamingLoading();
  }
}

mixin BaseSingleRenderViewDelegate implements RenderDelegate {
  SingleRenderViewController get renderController;

  String? get emptyText => null;

  @override
  Widget? getEmptyWidget(BuildContext context) {
    return GoGamingEmpty(text: emptyText);
  }

  @override
  Widget? getFailedWidget(BuildContext context,
      [void Function()? onErrorPressed]) {
    return null;
  }

  @override
  Widget? getLoadingWidget(BuildContext context) {
    return const GoGamingLoading();
  }
}
