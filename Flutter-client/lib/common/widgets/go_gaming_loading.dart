import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';

class GoGamingLoading extends StatelessWidget {
  const GoGamingLoading({
    Key? key,
    this.color,
    this.alignment = Alignment.center,
    this.size,
  }) : super(key: key);

  final GGColors? color;
  final Alignment alignment;
  final double? size;

  double get dotSize => size ?? 20.dp;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: alignment,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: dotSize * 3,
        ),
        height: dotSize,
        child: ThreeBounceLoading(
          dotColor: (color ?? GGColors.brand).color,
          dotSize: dotSize,
        ),
      ),
    );
  }
}
