import 'package:flutter/material.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingRadioBox extends StatelessWidget {
  const GamingRadioBox({
    super.key,
    required this.value,
    this.onChanged,
    this.size,
    this.padding,
    this.unSelected,
    this.activeColor,
    this.disabledColor,
  });

  final bool value;
  final void Function(bool)? onChanged;
  final double? size;
  final EdgeInsets? padding;
  final Color? unSelected;
  final Color? activeColor;
  final Color? disabledColor;

  Color get color => onChanged == null
      ? disabledColor ?? GGColors.border.color
      : value
          ? activeColor ?? GGColors.highlightButton.color
          : unSelected ?? GGColors.border.color;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () {
        onChanged?.call(!value);
      },
      child: Padding(
        padding: padding ?? EdgeInsets.zero,
        child: SvgPicture.asset(
          value ? R.iconRadioChecked : R.iconRadioUnChecked,
          width: size ?? 15.dp,
          height: size ?? 15.dp,
          color: color,
        ),
      ),
    );
  }
}
