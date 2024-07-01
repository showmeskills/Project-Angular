import 'package:flutter/material.dart';

enum TriangleDirection {
  left,
  right,
  top,
  bottom,
}

class TrianglePainter extends CustomPainter {
  final Color color;
  final TriangleDirection direction;

  TrianglePainter({
    required this.color,
    required this.direction,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final baseX = size.width / 2.0;
    final baseY = size.height / 2.0;
    Path path = Path();
    switch (direction) {
      case TriangleDirection.left:
        {
          path.moveTo(0, baseY);
          path.lineTo(size.width, 0);
          path.lineTo(size.width, size.height);
          break;
        }
      case TriangleDirection.right:
        {
          path.moveTo(size.width, baseY);
          path.lineTo(0, 0);
          path.lineTo(0, size.height);
          break;
        }
      case TriangleDirection.top:
        {
          path.moveTo(baseX, 0);
          path.lineTo(0, size.height);
          path.lineTo(size.width, size.height);
          break;
        }
      case TriangleDirection.bottom:
        {
          path.moveTo(baseX, size.height);
          path.lineTo(0, 0);
          path.lineTo(size.width, 0);
          break;
        }
    }
    Paint paint = Paint()..color = color;
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    // TODO: implement shouldRepaint
    return false;
  }
}
