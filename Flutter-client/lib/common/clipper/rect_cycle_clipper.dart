import 'package:flutter/material.dart';
import 'dart:math' as math;

/// 画个圆弧中点是Offset(size.width, size.height / 2)，半径是math.max(size.width, size.height)
class RectCycleClipper extends CustomClipper<Path> {
  RectCycleClipper({required this.startAngle, this.angle = 30.0});

  /// 圆弧的开始角度
  final double startAngle;

  /// 圆弧的弧度
  final double angle;

  @override
  Path getClip(Size size) {
    var path = Path();

    double degToRad(double deg) => deg * (math.pi / 180.0);
    final center = Offset(0, size.height / 2);
    path.addArc(
      // 4.
      Rect.fromCircle(
        center: center,
        radius: math.max(size.width, size.height),
      ), // 5.
      degToRad(startAngle), // 6.
      degToRad(angle), // 7.
      // false,
    );
    path.lineTo(center.dx, center.dy);
    path.close();

    return path;
  }

  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) => false;
}
