// ignore_for_file: must_be_immutable

library gaming_selector;

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

import '../gaming_bottom_sheet.dart';
import '../gaming_text_filed/gaming_text_filed.dart';

part 'src/view.dart';
part 'src/logic.dart';

class GamingSelector {
  static Future<T?> custom<T>({
    required String title,
    GamingSelectorHeaderContentView? headerBuilder,
    GamingSelectorFooterContentView? footerBuilder,
    required GamingSelectorItemBuilder<T> itemBuilder,
    required GamingSelectorControllerImp<T> controller,
    bool useCloseButton = true,
    bool centerTitle = false,
    bool fixedHeight = true,
    bool safeAreaBottom = true,
  }) {
    assert(
        (controller.onLoadDataStream != null && fixedHeight) ||
            controller.onLoadDataStream == null,
        '当使用onLoadDataStream时，isScrollControlled必须为true');
    return GamingBottomSheet.show<T?>(
      title: title,
      useCloseButton: useCloseButton,
      centerTitle: centerTitle,
      fixedHeight: fixedHeight,
      builder: (context) {
        return GamingSelectorView(
          safeAreaBottom: safeAreaBottom,
          headerBuilder: headerBuilder,
          footerBuilder: footerBuilder,
          itemBuilder: itemBuilder,
          controller: controller,
          isScrollControlled: fixedHeight,
        );
      },
    );
  }

  static Future<T?> simple<T>({
    required String title,
    GamingSelectorHeaderContentView? headerBuilder,
    GamingSelectorFooterContentView? footerBuilder,
    required GamingSelectorItemBuilder<T> itemBuilder,
    List<T> original = const [],
    GamingSelectorOnLoad<T>? onLoadDataStream,
    GamingSelectorOnSearch<T>? onSearchDataStream,
    bool useCloseButton = true,
    bool centerTitle = false,
    bool fixedHeight = true,
    bool safeAreaBottom = true,
  }) {
    return GamingSelector.custom<T>(
      title: title,
      useCloseButton: useCloseButton,
      centerTitle: centerTitle,
      fixedHeight: fixedHeight,
      itemBuilder: itemBuilder,
      headerBuilder: headerBuilder,
      footerBuilder: footerBuilder,
      safeAreaBottom: safeAreaBottom,
      controller: GamingSelectorController(
        original: original,
        onLoadDataStream: onLoadDataStream,
        onSearchDataStream: onSearchDataStream,
      ),
    );
  }
}

class GamingSelectorWidget extends StatelessWidget {
  const GamingSelectorWidget({
    super.key,
    this.onPressed,
    this.backgroundColor,
    this.iconColor,
    this.iconSize,
    this.border,
    this.padding,
    this.enable = true,
    required this.builder,
  });

  final void Function()? onPressed;
  final Color? backgroundColor;
  final Color? iconColor;
  final double? iconSize;
  final Border? border;
  final EdgeInsets? padding;
  final bool enable;

  final Widget Function(BuildContext context) builder;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: enable ? onPressed : null,
      child: Opacity(
        opacity: enable ? 1 : 0.8,
        child: Container(
          width: double.infinity,
          padding: padding ??
              EdgeInsets.symmetric(
                horizontal: 14.dp,
                vertical: 14.dp,
              ),
          decoration: BoxDecoration(
            color: backgroundColor ?? (enable ? null : GGColors.disabled.color),
            borderRadius: BorderRadius.circular(4.dp),
            border: border ??
                Border.all(
                  color: enable
                      ? GGColors.border.color
                      : GGColors.transparent.color,
                  width: 1.dp,
                ),
          ),
          child: Row(
            children: [
              Expanded(
                child: builder(context),
              ),
              if (enable && onPressed != null)
                SvgPicture.asset(
                  R.iconDropDown,
                  height: iconSize ?? 14.dp,
                  color: iconColor ?? GGColors.textHint.color,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
