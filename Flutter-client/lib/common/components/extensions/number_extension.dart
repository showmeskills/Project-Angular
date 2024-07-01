import 'dart:math';

import 'package:intl/intl.dart';

import '../util.dart';

extension DoubleExt on double {
  /// 和UI确定，目前和之后 设计以iPhone 11 Pro (375*812) 为标准设计基准,并以尺寸为基准
  double get dp {
    //设计要求dp大于等于1
    return max(1, this * Util.diagonalRatio);
  }

  /// 个别动画或UI可能会以宽度为基准（场景较少）
  double get wdp {
    return this * Util.ratio;
  }

  /// 个别动画或UI可能会以高度为基准（场景较少）
  double get hdp {
    return this * Util.hRatio;
  }

  /// UI可能会以对角线为基准（通用场景）
  double get ddp {
    return this * Util.diagonalRatio;
  }

  /// 个别动画或UI可能会以像素为基准（场景较少）
  double get dr {
    return this * Util.devicePixelRatio;
  }
}

extension IntExt on int {
  double get dp {
    return this * Util.diagonalRatio;
  }

  double get wdp {
    return this * Util.ratio;
  }

  double get hdp {
    return this * Util.hRatio;
  }

  double get ddp {
    return this * Util.diagonalRatio;
  }

  double get dr {
    return this * Util.devicePixelRatio;
  }
}

extension StringExt on String {
  String stripTrailingZeros() {
    String value = this;
    while (
        value.contains('.') && (value.endsWith('0') || value.endsWith('.'))) {
      value = value.substring(0, value.length - 1);
    }
    return value;
  }
}

extension NumExt on num {
  String stripTrailingZeros() {
    String value = toString();
    while (
        value.contains('.') && (value.endsWith('0') || value.endsWith('.'))) {
      value = value.substring(0, value.length - 1);
    }
    return value;
  }

  num stripTrailingZerosNum() {
    String value = toString();
    while (
        value.contains('.') && (value.endsWith('0') || value.endsWith('.'))) {
      value = value.substring(0, value.length - 1);
    }
    final result = num.tryParse(value) ?? 0;
    return result;
  }

  ///千位数加上逗号分割
  String getFormatPoint() {
    final format = NumberFormat('#,###,###,###');
    return format.format(this);
  }

  /// 保留小数点后几位，且不四舍五入
  String toStringAsFixedWithoutRound(int fractionDigits) {
    String value = toStringAsFixed(fractionDigits + 1);
    if (fractionDigits == 0) {
      return value.substring(0, value.lastIndexOf('.'));
    }
    return value.substring(0, value.lastIndexOf('.') + fractionDigits + 1);
  }

  /// 保留3位有效数字
  ///
  /// 大于999的数字仅保留整数部分
  ///
  /// 0.0222 -> 0.02
  ///
  /// 2.0 -> 2.00
  ///
  /// 12.33 -> 12.3
  ///
  /// 123.33 -> 123
  ///
  /// 999.9 -> 999
  ///
  /// 1520.666 -> 1520
  String toEffectiveStringAsFixed([int length = 3]) {
    double value = toDouble();

    final string = value.toString();
    final array = string.split('.');
    // 整数部分
    final integer = array[0];
    // 小数部分
    final decimal = array[1];

    // 如果整数部分位数小于3位
    if (integer.length < length) {
      // 小数应该保留的位数
      final surplus = length - integer.length;
      String surplusString = '';
      // 如果小数位数大于等于应该保留的位数
      if (decimal.length >= surplus) {
        surplusString = decimal.substring(0, surplus);
      } else {
        // 用0补不足的位数
        surplusString = decimal.padRight(3 - surplus + decimal.length, '0');
      }
      return '${array[0]}.$surplusString';
    } else {
      return value.truncate().toString();
    }
  }
}
