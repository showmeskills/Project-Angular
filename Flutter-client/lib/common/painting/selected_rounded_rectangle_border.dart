import 'dart:math';

import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';

class SelectedRoundedRectangleBorder extends RoundedRectangleBorder {
  const SelectedRoundedRectangleBorder({
    BorderSide side = BorderSide.none,
    this.borderRadius = BorderRadius.zero,
    required this.color,
    required this.iconColor,
    this.size = Size.zero,
    this.aligemnt = Alignment.topLeft,
  })  : assert(aligemnt == Alignment.topLeft || aligemnt == Alignment.topRight),
        super(side: side, borderRadius: borderRadius);

  final Color color;
  final Color iconColor;
  @override
  // ignore: overridden_fields
  final BorderRadius borderRadius;
  final Size size;
  final Alignment aligemnt;

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {
    super.paint(canvas, rect);
    if (size == Size.zero) {
      return;
    }
    final paint = Paint()
      ..color = color
      ..strokeCap = StrokeCap.square
      ..strokeWidth = 1.0
      ..style = PaintingStyle.fill
      ..strokeJoin = StrokeJoin.round;

    final path = Path();

    late double radius;

    late double start;
    late double dy = rect.top + radius;

    if (aligemnt == Alignment.topLeft) {
      radius = borderRadius.topLeft.x;
      start = rect.left;
    } else if (aligemnt == Alignment.topRight) {
      radius = borderRadius.topRight.x;
      start = rect.right;
    }

    path.moveTo(start, rect.top + size.height);
    path.lineTo(start, dy);

    if (radius > 0) {
      Offset p1 = Offset(start, rect.top);
      late Offset p2;
      if (aligemnt == Alignment.topLeft) {
        p2 = Offset(start + radius, dy);
      } else if (aligemnt == Alignment.topRight) {
        p2 = Offset(start - radius, dy);
      }
      path.conicTo(
        p1.dx,
        p1.dy,
        p2.dx,
        p1.dy,
        0.5,
      );
    }
    late double end;
    if (aligemnt == Alignment.topLeft) {
      end = rect.left + size.width;
    } else if (aligemnt == Alignment.topRight) {
      end = rect.right - size.width;
    }
    path.lineTo(end, rect.top);

    canvas.drawPath(path, paint);

    final icon = Path();
    final iconPaint = Paint()
      ..color = iconColor
      ..strokeCap = StrokeCap.round
      ..strokeWidth = min(2.dp * size.width / 32.dp, 1.5.dp)
      ..style = PaintingStyle.stroke
      ..strokeJoin = StrokeJoin.round;

    late double x;
    Size iconSize = Size(size.width / 3, size.width / 6);
    if (aligemnt == Alignment.topLeft) {
      x = rect.left + iconSize.width / 4 * 2;
    } else if (aligemnt == Alignment.topRight) {
      x = rect.right - iconSize.width - iconSize.width / 4;
    }

    final y = rect.top + iconSize.height / 2 + size.height / 4;
    icon.moveTo(x, y);
    icon.lineTo(x + iconSize.width / 4, y + iconSize.height / 2);
    icon.lineTo(x + iconSize.width / 4 * 3, y - iconSize.height / 2);

    canvas.drawPath(icon, iconPaint);
  }

  @override
  bool operator ==(Object other) {
    if (other.runtimeType != runtimeType) {
      return false;
    }
    return other is SelectedRoundedRectangleBorder &&
        other.side == side &&
        other.borderRadius == borderRadius &&
        other.size == size &&
        other.color == color &&
        other.aligemnt == aligemnt &&
        other.iconColor == iconColor;
  }

  @override
  int get hashCode =>
      Object.hash(side, borderRadius, size, color, aligemnt, iconColor);
}
