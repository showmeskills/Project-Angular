import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';

enum GGFontFamily {
  /// 中文字体
  pingFang(fontFamily: 'PingFang SC'),

  /// 非中文字体
  robot(fontFamily: 'Roboto'),

  /// 数字字体
  dingPro(fontFamily: 'DINPro');

  const GGFontFamily({required this.fontFamily});
  final String fontFamily;

  factory GGFontFamily.c({bool isNumber = false}) {
    if (isNumber) return dingPro;

    return Get.locale?.languageCode.contains('zh') == true ? pingFang : robot;
  }
}

enum GGFontSize {
  /// 超大标题 36
  superBigTitle36(fontSize: 36),

  /// 超大标题 30
  superBigTitle30(fontSize: 30),

  /// 超大标题 28
  superBigTitle28(fontSize: 28),

  /// 超大标题 26
  superBigTitle26(fontSize: 26),

  /// 超大标题
  superBigTitle(fontSize: 24),

  /// 大标题 22
  bigTitle22(fontSize: 22),

  /// 大标题 20
  bigTitle20(fontSize: 20),

  /// 大标题 18
  bigTitle(fontSize: 18),

  /// 小标题 16
  smallTitle(fontSize: 16),

  /// 内容 14
  content(fontSize: 14),

  /// 标签 13
  label(fontSize: 13),

  /// 提示 12
  hint(fontSize: 12),

  /// 提示 10
  smallHint(fontSize: 10);

  const GGFontSize({required double fontSize}) : _fontSize = fontSize;
  final double _fontSize;
  double get fontSize => _fontSize.dp;
}

enum GGFontWeigh {
  bold(fontWeight: FontWeight.w700),
  medium(fontWeight: FontWeight.w500),
  regular(fontWeight: FontWeight.w400);

  const GGFontWeigh({required this.fontWeight});
  final FontWeight fontWeight;
}

class GGTextStyle extends TextStyle {
  GGTextStyle({
    required GGFontSize fontSize,
    GGFontWeigh? fontWeight,
    GGFontFamily? fontFamily,
    super.inherit = true,
    super.color,
    super.backgroundColor,
    super.fontStyle,
    super.letterSpacing,
    super.wordSpacing,
    super.textBaseline,
    super.height,
    super.leadingDistribution,
    super.locale,
    super.foreground,
    super.background,
    super.shadows,
    super.fontFeatures,
    super.fontVariations,
    super.decoration,
    super.decorationColor,
    super.decorationStyle,
    super.decorationThickness,
    super.debugLabel,
    List<String>? fontFamilyFallback,
    String? package,
    super.overflow,
  }) : super(
          fontFamily: (fontFamily ?? GGFontFamily.c()).fontFamily,
          fontSize: fontSize.fontSize,
          fontWeight: (fontWeight ?? GGFontWeigh.regular).fontWeight,
          fontFamilyFallback: fontFamilyFallback,
          package: package,
        );
}
