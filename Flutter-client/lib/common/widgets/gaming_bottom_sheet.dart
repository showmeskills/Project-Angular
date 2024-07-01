import 'package:flutter/material.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingBottomSheet extends StatelessWidget {
  const GamingBottomSheet({
    super.key,
    required this.child,
    this.title,
    this.titleExpandBuilder,
    this.footerExpandBuilder,
    this.centerTitle = false,
    this.useCloseButton = true,
    this.fixedHeight = true,
    this.titleSize = GGFontSize.bigTitle20,
  });

  final String? title;
  final Widget Function(BuildContext, Widget, bool)? titleExpandBuilder;
  final Widget Function(BuildContext)? footerExpandBuilder;
  final Widget child;
  final bool useCloseButton;
  final bool centerTitle;
  final bool fixedHeight;
  final GGFontSize titleSize;

  static Future<T?> show<T>({
    required Widget Function(BuildContext) builder,
    String? title,
    Widget Function(BuildContext, Widget, bool)? titleExpandBuilder,
    Widget Function(BuildContext)? footerExpandBuilder,
    String? content,
    Color? backgroundColor,
    Color? barrierColor,
    bool useRootNavigator = false,
    bool isDismissible = true,
    bool useCloseButton = true,
    bool centerTitle = false,
    bool fixedHeight = true,
    GGFontSize titleSize = GGFontSize.bigTitle20,
  }) {
    primaryFocus?.unfocus();
    return Get.bottomSheet<T>(
      GamingBottomSheet(
        title: title,
        titleSize: titleSize,
        titleExpandBuilder: titleExpandBuilder,
        footerExpandBuilder: footerExpandBuilder,
        useCloseButton: useCloseButton,
        centerTitle: centerTitle,
        fixedHeight: fixedHeight,
        child: Builder(builder: builder),
      ),
      backgroundColor: backgroundColor,
      elevation: 0,
      barrierColor: barrierColor,
      ignoreSafeArea: false,
      useRootNavigator: useRootNavigator,
      isDismissible: isDismissible,
      isScrollControlled: true,
    );
  }

  /// 为了解决bottomSheet里包含键盘导致的布局
  static Future<T?> showModalBottomSheet2<T>({
    required Widget Function(BuildContext) builder,
    String? title,
    Widget Function(BuildContext, Widget, bool)? titleExpandBuilder,
    Widget Function(BuildContext)? footerExpandBuilder,
    String? content,
    Color? backgroundColor,
    Color? barrierColor,
    bool useRootNavigator = false,
    bool isDismissible = true,
    bool useCloseButton = true,
    bool centerTitle = false,
    bool fixedHeight = true,
    GGFontSize titleSize = GGFontSize.bigTitle20,
  }) {
    primaryFocus?.unfocus();
    return showModalBottomSheet<T>(
      backgroundColor: backgroundColor ?? Colors.transparent,
      barrierColor: barrierColor,
      elevation: 0,
      useRootNavigator: useRootNavigator,
      isDismissible: isDismissible,
      isScrollControlled: true,
      builder: (BuildContext context) {
        return SingleChildScrollView(
          child: Container(
            padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom),
            child: GamingBottomSheet(
              title: title,
              titleSize: titleSize,
              titleExpandBuilder: titleExpandBuilder,
              footerExpandBuilder: footerExpandBuilder,
              useCloseButton: useCloseButton,
              centerTitle: centerTitle,
              fixedHeight: fixedHeight,
              child: Builder(builder: builder),
            ),
          ),
        );
      },
      context: Navigator.of(Get.overlayContext!).context,
    );
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final maxHeight =
            fixedHeight ? constraints.maxHeight / 2 - 58.dp : null;
        return Material(
          color: GGColors.alertBackground.color,
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(16.dp),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: EdgeInsets.symmetric(horizontal: 10.dp).copyWith(
                  top: 18.dp,
                  bottom: 10.dp,
                ),
                child: Row(
                  children: [
                    if (centerTitle) Gaps.hGap30,
                    Expanded(
                      child: _buildTitle(context),
                    ),
                    if (useCloseButton)
                      const _GamingBottomSheetCloseButton()
                    else
                      Gaps.hGap30,
                  ],
                ),
              ),
              SizedBox(
                height: maxHeight,
                child: child,
              ),
              _buildFooter(context),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTitle(BuildContext context) {
    if (title != null) {
      final child = Container(
        constraints:
            BoxConstraints(maxWidth: MediaQuery.of(context).size.width - 70.dp),
        child: Text(
          title!,
          style: GGTextStyle(
            fontSize: titleSize, //GGFontSize.smallTitle,
            color: GGColors.textMain.color,
            fontWeight: GGFontWeigh.regular,
          ),
          maxLines: 2,
        ),
      );
      return Container(
        width: double.infinity,
        padding: EdgeInsets.symmetric(
          horizontal: 6.dp,
          vertical: 6.dp,
        ),
        child: titleExpandBuilder == null
            ? Row(
                mainAxisAlignment: centerTitle
                    ? MainAxisAlignment.center
                    : MainAxisAlignment.start,
                children: [
                  child,
                ],
              )
            : titleExpandBuilder!(context, child, centerTitle),
      );
    }
    return Gaps.empty;
  }

  Widget _buildFooter(BuildContext context) {
    if (footerExpandBuilder != null) {
      return Column(
        children: [
          footerExpandBuilder!(context),
          Gaps.vGap32,
        ],
      );
    }
    return Gaps.empty;
  }
}

class _GamingBottomSheetCloseButton extends StatelessWidget {
  const _GamingBottomSheetCloseButton();

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () {
        Get.back<void>();
      },
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: 6.dp,
          vertical: 6.dp,
        ),
        child: SvgPicture.asset(
          R.iconClose,
          width: 18.dp,
          height: 18.dp,
          color: GGColors.textSecond.color,
        ),
      ),
    );
  }
}
