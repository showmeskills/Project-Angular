import 'dart:math';

import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';

class BonusShapeBorder extends SelectedShapeBorder {
  final double holeSize;
  final BorderSide side;

  const BonusShapeBorder({
    super.radius = 0,
    super.size = Size.zero,
    super.aligemnt = Alignment.topLeft,
    this.holeSize = 12,
    this.side = BorderSide.none,
    Color color = Colors.transparent,
    Color iconColor = Colors.transparent,
  }) : super(color: color, iconColor: iconColor);

  @override
  EdgeInsetsGeometry get dimensions => EdgeInsets.all(side.width);

  BorderRadius get borderRadus => BorderRadius.circular(radius);

  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) {
    return Path()..addRRect(borderRadus.resolve(textDirection).toRRect(rect));
  }

  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) {
    final path = Path();
    path.addRRect(borderRadus.resolve(textDirection).toRRect(rect));

    path.addArc(
      _getLeftHoleRect(rect),
      _leftHoleAngle,
      pi,
    );

    path.addArc(
      _getRightHoleRect(rect),
      _rightHoleAngle,
      pi,
    );

    path.fillType = PathFillType.evenOdd;
    return path;
  }

  double get _leftHoleAngle => -pi / 2;

  double get _rightHoleAngle => pi / 2;

  Rect _getLeftHoleRect(Rect rect) {
    return Rect.fromCenter(
      center: Offset(rect.left, rect.top + rect.height / 2),
      width: holeSize,
      height: holeSize,
    );
  }

  Rect _getRightHoleRect(Rect rect) {
    return Rect.fromCenter(
      center: Offset(rect.right, rect.top + rect.height / 2),
      width: holeSize,
      height: holeSize,
    );
  }

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {
    super.paint(canvas, rect, textDirection: textDirection);
    if (side.width == 0) {
      return;
    }
    final Paint paint = Paint()
      ..color = side.color
      ..strokeCap = StrokeCap.round
      ..strokeWidth = side.width
      ..style = PaintingStyle.stroke
      ..strokeJoin = StrokeJoin.round;

    var path = Path();
    // 处理边框宽度
    rect = Rect.fromLTWH(rect.left + side.width, rect.top + side.width,
        rect.width - side.width * 2, rect.height - side.width * 2);
    // 绘制左上圆角
    _buildLeftTopRoundedBorder(path, rect);

    // 绘制左侧边框
    _buildLeftBorder(path, rect);

    /// 绘制左下圆角
    _buildLeftBottomRoundedBorder(path, rect);

    // 绘制下侧边框
    _buildBottomBorder(path, rect);

    // 绘制右下圆角
    _buildRightBottomRoundedBorder(path, rect);

    // 绘制右侧边框
    _buildRightBorder(path, rect);

    // 绘制右上圆角
    _buildRightTopRoundedBorder(path, rect);

    // 绘制上侧边框
    _buildTopBorder(path, rect);

    canvas.drawPath(path, paint);
  }

  /// 绘制左上圆角
  void _buildLeftTopRoundedBorder(Path path, Rect rect) {
    final leftTop = Rect.fromCircle(
      center: Offset(rect.left + radius, rect.top + radius),
      radius: radius,
    );
    path.addArc(leftTop, pi, pi / 2);
  }

  /// 绘制左下圆角
  void _buildLeftBottomRoundedBorder(Path path, Rect rect) {
    final leftBottom = Rect.fromCircle(
      center: Offset(rect.left + radius, rect.bottom - radius),
      radius: radius,
    );
    path.addArc(leftBottom, pi / 2, pi / 2);
  }

  /// 绘制右上圆角
  void _buildRightTopRoundedBorder(Path path, Rect rect) {
    final rightTop = Rect.fromCircle(
      center: Offset(rect.right - radius, rect.top + radius),
      radius: radius,
    );
    path.addArc(rightTop, pi * 3 / 2, pi / 2);
  }

  /// 绘制右下圆角
  void _buildRightBottomRoundedBorder(Path path, Rect rect) {
    final rightBottom = Rect.fromCircle(
      center: Offset(rect.right - radius, rect.bottom - radius),
      radius: radius,
    );
    path.addArc(rightBottom, 0, pi / 2);
  }

  /// 绘制左侧带缺口的直线
  void _buildLeftBorder(Path path, Rect rect) {
    path
      ..moveTo(rect.left, rect.top + radius)
      ..lineTo(rect.left, rect.top + rect.height / 2 - holeSize / 2)
      ..addArc(
        _getLeftHoleRect(rect),
        _leftHoleAngle,
        pi,
      )
      ..lineTo(rect.left, rect.bottom - radius);
  }

  /// 绘制右侧带缺口的直线
  void _buildRightBorder(Path path, Rect rect) {
    path
      ..moveTo(rect.right, rect.bottom - radius)
      ..lineTo(rect.right, rect.top + rect.height / 2 + holeSize / 2)
      ..addArc(
        _getRightHoleRect(rect),
        _rightHoleAngle,
        pi,
      )
      ..lineTo(rect.right, rect.top + radius);
  }

  /// 绘制上侧直线
  void _buildTopBorder(Path path, Rect rect) {
    path
      ..moveTo(rect.right - radius, rect.top)
      ..lineTo(rect.left + radius, rect.top);
  }

  /// 绘制下侧直线
  void _buildBottomBorder(Path path, Rect rect) {
    path
      ..moveTo(rect.left + radius, rect.bottom)
      ..lineTo(rect.right - radius, rect.bottom);
  }

  @override
  ShapeBorder scale(double t) {
    return BonusShapeBorder(
      holeSize: holeSize * t,
      radius: radius * t,
      side: side.scale(t),
    );
  }

  @override
  bool operator ==(Object other) {
    if (other.runtimeType != runtimeType) {
      return false;
    }
    return other is BonusShapeBorder &&
        other.side == side &&
        other.radius == radius &&
        other.holeSize == holeSize &&
        other.aligemnt == aligemnt &&
        other.size == size &&
        other.color == color &&
        other.iconColor == iconColor;
  }

  @override
  int get hashCode =>
      Object.hash(side, radius, holeSize, aligemnt, size, color, iconColor);
}

abstract class SelectedShapeBorder extends ShapeBorder {
  final Size size;
  final Alignment aligemnt;
  final Color color;
  final Color iconColor;
  final double radius;

  const SelectedShapeBorder({
    required this.color,
    required this.iconColor,
    this.radius = 0,
    this.size = Size.zero,
    this.aligemnt = Alignment.topLeft,
  }) : assert(aligemnt == Alignment.topLeft || aligemnt == Alignment.topRight);

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {
    paintIcon(canvas, rect, textDirection: textDirection);
  }

  void paintIcon(Canvas canvas, Rect rect, {TextDirection? textDirection}) {
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

    late double start;
    late double dy = rect.top + radius;

    if (aligemnt == Alignment.topLeft) {
      start = rect.left;
    } else if (aligemnt == Alignment.topRight) {
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
}
