import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';

extension TextExtension on Text {
  Size get size {
    return TextCalculateUtils.size(
      textSpan: TextSpan(text: data ?? '', style: style),
    );
  }
}

class TextCalculateUtils {
  static Size size({
    required TextSpan textSpan,
    double maxWidth = double.infinity,
    int maxLines = 1,
  }) {
    final TextPainter textPainter = TextPainter(
      textDirection: TextDirection.ltr,
      locale: Get.locale,
      text: TextSpan(
        text: textSpan.text,
        children: textSpan.children,
        locale: Get.locale,
        style: textSpan.style,
      ),
      maxLines: maxLines,
    )..layout(maxWidth: maxWidth);
    return textPainter.size;
  }

  static double height({
    required TextSpan textSpan,
    double maxWidth = double.infinity,
    int maxLines = 1,
  }) {
    return size(
      textSpan: textSpan,
      maxWidth: maxWidth,
      maxLines: maxLines,
    ).height;
  }

  static double width({
    required TextSpan textSpan,
    double maxWidth = double.infinity,
    int maxLines = 1,
  }) {
    return size(
      textSpan: textSpan,
      maxWidth: maxWidth,
      maxLines: maxLines,
    ).width;
  }
}
