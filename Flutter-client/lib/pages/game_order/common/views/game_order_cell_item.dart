import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';

class GameOrderCellItem extends StatelessWidget {
  const GameOrderCellItem({
    super.key,
    required this.title,
    required this.value,
    this.icon,
    this.color,
    this.onTap,
  });

  final String title;
  final String value;
  final Widget? icon;
  final Color? color;
  final void Function()? onTap;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          '$title：',
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        Expanded(
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: onTap,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(
                  value,
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: color ?? GGColors.textMain.color,
                  ),
                ),
                if (icon != null)
                  Container(
                    margin: EdgeInsets.only(left: 4.dp),
                    child: icon,
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
