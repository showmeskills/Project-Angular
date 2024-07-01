import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';

/// 间隔
class Gaps {
  /// 水平间隔
  static Widget hGap2 = SizedBox(width: 2.dp);
  static Widget hGap4 = SizedBox(width: 4.dp);
  static Widget hGap5 = SizedBox(width: 5.dp);
  static Widget hGap6 = SizedBox(width: 6.dp);
  static Widget hGap8 = SizedBox(width: 8.dp);
  static Widget hGap10 = SizedBox(width: 10.dp);
  static Widget hGap12 = SizedBox(width: 12.dp);
  static Widget hGap14 = SizedBox(width: 14.dp);
  static Widget hGap16 = SizedBox(width: 16.dp);
  static Widget hGap18 = SizedBox(width: 18.dp);
  static Widget hGap20 = SizedBox(width: 20.dp);
  static Widget hGap24 = SizedBox(width: 24.dp);
  static Widget hGap30 = SizedBox(width: 30.dp);
  static Widget hGap36 = SizedBox(width: 36.dp);
  static Widget hGap42 = SizedBox(width: 42.dp);
  static Widget hGap48 = SizedBox(width: 48.dp);

  /// 垂直间隔
  static Widget vGap2 = SizedBox(height: 2.dp);
  static Widget vGap4 = SizedBox(height: 4.dp);
  static Widget vGap5 = SizedBox(height: 5.dp);
  static Widget vGap6 = SizedBox(height: 6.dp);
  static Widget vGap8 = SizedBox(height: 8.dp);
  static Widget vGap10 = SizedBox(height: 10.dp);
  static Widget vGap12 = SizedBox(height: 12.dp);
  static Widget vGap14 = SizedBox(height: 14.dp);
  static Widget vGap16 = SizedBox(height: 16.dp);
  static Widget vGap18 = SizedBox(height: 18.dp);
  static Widget vGap20 = SizedBox(height: 20.dp);
  static Widget vGap22 = SizedBox(height: 22.dp);
  static Widget vGap24 = SizedBox(height: 24.dp);
  static Widget vGap25 = SizedBox(height: 25.dp);
  static Widget vGap26 = SizedBox(height: 26.dp);
  static Widget vGap28 = SizedBox(height: 28.dp);
  static Widget vGap30 = SizedBox(height: 30.dp);
  static Widget vGap32 = SizedBox(height: 32.dp);
  static Widget vGap36 = SizedBox(height: 36.dp);
  static Widget vGap38 = SizedBox(height: 38.dp);
  static Widget vGap40 = SizedBox(height: 40.dp);
  static Widget vGap42 = SizedBox(height: 42.dp);
  static Widget vGap44 = SizedBox(height: 44.dp);
  static Widget vGap50 = SizedBox(height: 50.dp);
  static Widget vGap56 = SizedBox(height: 56.dp);
  static Widget vGap60 = SizedBox(height: 60.dp);

  /// 水平分割线
  static Widget get line => Container(
        height: 1,
        width: double.infinity,
        color: GGColors.border.color,
      );

  /// 垂直分割线
  static Widget vLine = const VerticalDivider();

  /// 零间距
  static Widget empty = const SizedBox.shrink();

  /// 底部安全区
  static Widget safeArea([
    EdgeInsets? minimum,
  ]) {
    return SafeArea(
      bottom: true,
      minimum: minimum ?? EdgeInsets.only(bottom: 24.dp),
      child: Gaps.empty,
    );
  }
}
