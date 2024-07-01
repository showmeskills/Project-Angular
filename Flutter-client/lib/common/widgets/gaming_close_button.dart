import 'package:flutter/material.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingCloseButton extends StatelessWidget {
  const GamingCloseButton({
    super.key,
    this.size,
    this.color,
    this.padding,
    this.onPressed,
  });

  final double? size;
  final Color? color;
  final EdgeInsets? padding;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return UnconstrainedBox(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () {
          if (onPressed != null) {
            onPressed!();
          } else {
            Navigator.maybePop(context);
          }
        },
        child: Padding(
          padding: padding ?? EdgeInsets.all(12.dp),
          child: SvgPicture.asset(
            R.iconClose,
            width: size ?? 18.dp,
            height: size ?? 18.dp,
            color: color ?? GGColors.textMain.color,
          ),
        ),
      ),
    );
  }
}

class GamingBackButton extends StatelessWidget {
  const GamingBackButton({
    super.key,
    this.size,
    this.color,
    this.padding,
    this.onPressed,
  });

  final double? size;
  final Color? color;
  final EdgeInsets? padding;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () {
            if (onPressed != null) {
              onPressed!();
            } else {
              Navigator.maybePop(context);
            }
          },
          child: Padding(
            padding: padding ?? EdgeInsets.all(12.dp),
            child: SvgPicture.asset(
              R.iconAppbarLeftLeading,
              width: size ?? 18.dp,
              height: size ?? 18.dp,
              color: color ?? GGColors.textMain.color,
            ),
          ),
        ),
      ],
    );
  }
}
