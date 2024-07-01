import 'package:base_framework/src.widget/three_bounce_loading.dart';
import 'package:flutter/material.dart';
import 'package:base_framework/src.widget/scale_tap.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';
import 'package:gogaming_app/common/theme/text_styles/gg_text_styles.dart';

class GGMultiLineButton extends StatelessWidget {
  const GGMultiLineButton({
    super.key,
    this.height = 48,
    this.backgroundColor,
    this.radius,
    required this.onPressed,
    this.isLoading = false,
    this.enable = true,
    required this.text,
    this.textColor,
    this.textStyle,
    this.padding,
  });

  final double height;
  final Color? backgroundColor;
  final Color? textColor;
  final double? radius;
  final VoidCallback onPressed;
  final bool isLoading;
  final bool enable;
  final String text;
  final GGTextStyle? textStyle;
  final EdgeInsets? padding;

  /// 主要按钮
  factory GGMultiLineButton.main({
    required VoidCallback onPressed,
    required String text,
    bool isLoading = false,
    bool enable = true,
    bool isSmall = false,
    GGTextStyle? textStyle,
    Widget? image,
    double? space,
    double? height,
    Color? backgroundColor,
    EdgeInsets? padding,
    double? radius,
  }) {
    return GGMultiLineButton(
      onPressed: onPressed,
      text: text,
      height: height ?? (isSmall ? 42.dp : 48.dp),
      radius: radius,
      isLoading: isLoading,
      enable: enable,
      textStyle: textStyle,
      backgroundColor: backgroundColor ?? GGColors.highlightButton.color,
      padding: padding,
    );
  }

  /// 次要按钮
  factory GGMultiLineButton.minor({
    required VoidCallback onPressed,
    required String text,
    bool isLoading = false,
    bool enable = true,
    bool isSmall = false,
    double? height,
    GGTextStyle? textStyle,
    EdgeInsets? padding,
    Color? backgroundColor,
  }) {
    return GGMultiLineButton(
      onPressed: onPressed,
      text: text,
      textColor: GGColors.textMain.color,
      height: height ?? (isSmall ? 42.dp : 48.dp),
      backgroundColor: backgroundColor ?? GGColors.border.color,
      isLoading: isLoading,
      enable: enable,
      textStyle: textStyle,
      padding: padding,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: enable ? 1.0 : 0.5,
      child: ScaleTap(
        opacityMinValue: 0.8,
        scaleMinValue: 0.98,
        onPressed: enable && !isLoading ? onPressed : null,
        child: Container(
          height: height,
          alignment: Alignment.center,
          constraints: BoxConstraints(minHeight: 30.dp),
          padding:
              padding ?? EdgeInsetsDirectional.only(start: 10.dp, end: 10.dp),
          decoration: BoxDecoration(
            color: backgroundColor ?? GGColors.highlightButton.color,
            borderRadius: BorderRadius.circular(radius ?? 4.dp),
          ),
          child: _buildChild(),
        ),
      ),
    );
  }

  Widget _buildChild() {
    final style = GGTextStyle(
      color: textColor ?? GGColors.buttonTextWhite.color,
      fontSize: GGFontSize.smallTitle,
      fontWeight: GGFontWeigh.regular,
    ).merge(textStyle);

    return isLoading
        ? ThreeBounceLoading(
            dotColor: GGColors.buttonTextWhite.color,
            dotSize: 15.dp,
          )
        : Text(
            text,
            style: style,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          );
  }
}
