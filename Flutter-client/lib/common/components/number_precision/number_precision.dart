import 'package:big_dart/big_dart.dart';

class NumberPrecision {
  NumberPrecision(dynamic number)
      : _number = (number == null ? Big(0) : Big(number));

  final Big _number;
  Big get number => _number;

  double toNumber() => _number.toNumber();

  @override
  String toString() {
    return _number.toString();
  }

  /// 精确乘法
  NumberPrecision times(NumberPrecision other) {
    return NumberPrecision(_number * other._number);
  }

  /// 精确加法
  NumberPrecision plus(NumberPrecision other) {
    return NumberPrecision(_number + other._number);
    // return _number.add(other._number).toStringAsFixed(dp: dp);
  }

  /// 精确减法
  NumberPrecision minus(NumberPrecision other) {
    return NumberPrecision(_number - other._number);
  }

  /// 精确除法
  NumberPrecision divide(NumberPrecision other) {
    if (_number.toNumber() == 0) return NumberPrecision(0);
    return NumberPrecision(_number / other._number);
  }

  String displayNum(int dp, {int length = 9}) {
    return _displayNum(_number.toNumber(), length, dp);
  }

  String _displayNum(num number, int length, int dp) {
    final display = createGBDDisplay(
      dp, length: length,
      // decimal: 0,
      units: ['k', 'M'],
      roundingType: RoundingType.truncate,
    );
    return display(number);
  }

  String balanceText(bool isDigital) {
    final result = _displayNum(_number.toNumber(), 9, isDigital ? 8 : 2);
    return result;
  }
}

extension NumDispaly on num {
  NumberPrecision toNP() => NumberPrecision(this);
}

extension StringDisplay on String {
  NumberPrecision toNP() => NumberPrecision(this);
}
