import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingOverlay {
  final LayerLink layerLink = LayerLink();
  OverlayEntry? entry;
  final isShowing = false.obs;

  void show({
    required WidgetBuilder builder,
    bool opaque = false,
    bool maintainState = false,
  }) {
    entry = OverlayEntry(
      builder: builder,
      opaque: opaque,
      maintainState: maintainState,
    );
    Overlay.of(Get.overlayContext!).insert(entry!);
    isShowing.value = true;
  }

  void hide() {
    entry?.remove();
    entry = null;
    isShowing.value = false;
  }
}

mixin GamingOverlayMixin {
  final GamingOverlay _overlay = GamingOverlay();
  GamingOverlay get overlay => _overlay;

  LayerLink get layerLink => _overlay.layerLink;
  bool get isShowing => _overlay.isShowing.value;

  void showPopup({
    required WidgetBuilder builder,
    bool opaque = false,
    bool maintainState = false,
  }) {
    _overlay.show(
      builder: builder,
      opaque: opaque,
      maintainState: maintainState,
    );
  }

  void hidePopup() {
    _overlay.hide();
  }
}
