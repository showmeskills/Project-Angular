import 'package:extra_hittest_area/extra_hittest_area.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingCheckBox extends StatelessWidget {
  const GamingCheckBox({
    super.key,
    required this.value,
    this.onChanged,
    this.size,
    this.padding,
    this.unSelectedColor,
    this.activeColor,
    this.iconColor,
    this.disabledColor,
  });

  final bool value;
  final void Function(bool)? onChanged;
  final double? size;
  final EdgeInsets? padding;
  final Color? unSelectedColor;
  final Color? activeColor;
  final Color? iconColor;
  final Color? disabledColor;

  Color get borderColor => onChanged == null
      ? disabledColor ?? GGColors.border.color
      : value
          ? activeColor ?? GGColors.highlightButton.color
          : unSelectedColor ?? GGColors.border.color;

  Color get backgroundColor => onChanged == null
      ? disabledColor ?? GGColors.border.color
      : value
          ? activeColor ?? GGColors.highlightButton.color
          : Colors.transparent;

  double get widgetSize => size ?? 15.dp;
  double get iconSize => widgetSize * 0.6;

  @override
  Widget build(BuildContext context) {
    return GestureDetectorHitTestWithoutSizeLimit(
      behavior: HitTestBehavior.opaque,
      extraHitTestArea: EdgeInsets.all(10.dp),
      onTap: () {
        onChanged?.call(!value);
      },
      child: Padding(
        padding: padding ?? EdgeInsets.zero,
        child: Container(
          decoration: BoxDecoration(
            border: Border.all(
              color: borderColor,
              width: 1.dp,
            ),
            color: backgroundColor,
            borderRadius: BorderRadius.circular(2.dp),
          ),
          width: widgetSize,
          height: widgetSize,
          alignment: Alignment.center,
          child: value
              ? SvgPicture.asset(
                  R.iconChecked,
                  width: iconSize,
                  color: iconColor ?? GGColors.buttonTextWhite.color,
                )
              : const SizedBox.expand(),
        ),
      ),
    );
  }
}
