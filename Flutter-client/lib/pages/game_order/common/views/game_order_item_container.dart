import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';

class GameOrderItemContainer extends StatelessWidget {
  const GameOrderItemContainer({
    super.key,
    this.onTap,
    required this.child,
  });

  final void Function()? onTap;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: Container(
        margin: EdgeInsets.only(top: 8.dp),
        decoration: BoxDecoration(
          border: Border.all(color: GGColors.border.color, width: 1.dp),
          borderRadius: BorderRadius.circular(4.dp),
        ),
        child: child,
      ),
    );
  }
}
