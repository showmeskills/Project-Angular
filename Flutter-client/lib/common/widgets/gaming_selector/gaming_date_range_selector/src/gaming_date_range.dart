import 'package:gogaming_app/common/lang/locale_lang.dart';

class GamingDateRange {
  /// H5采用86400000000，APP采用86399999999
  ///
  /// 因涉及UI、交互、日期最大可选择范围，此处使用86399999999毫秒以保证结束时间在x天的最后
  static const endMicroseconds = 86399999999;
  final DateTime start;
  final DateTime end;
  final GamingDateRangeType type;

  GamingDateRange({
    required this.start,
    required this.end,
    this.type = GamingDateRangeType.custom,
  });

  factory GamingDateRange.today([bool isUtc = false]) {
    return GamingDateRange.fromType(GamingDateRangeType.today, isUtc: isUtc);
  }

  factory GamingDateRange.week([bool isUtc = false]) {
    return GamingDateRange.fromType(GamingDateRangeType.week, isUtc: isUtc);
  }

  factory GamingDateRange.month([bool isUtc = false]) {
    return GamingDateRange.fromType(GamingDateRangeType.month, isUtc: isUtc);
  }

  factory GamingDateRange.last90([bool isUtc = false]) {
    return GamingDateRange.fromType(GamingDateRangeType.last90, isUtc: isUtc);
  }

  factory GamingDateRange.days(int days, {bool isUtc = false}) {
    final now = DateTime.now();
    final baseDateTime = isUtc ? now.toUtc() : now.toLocal();
    DateTime end =
        DateTime(baseDateTime.year, baseDateTime.month, baseDateTime.day)
            .add(const Duration(microseconds: endMicroseconds));
    if (isUtc) {
      end = end.add(now.timeZoneOffset);
    }
    final start = end.subtract(Duration(days: days - 1) +
        const Duration(microseconds: endMicroseconds));
    return GamingDateRange(
      start: start,
      end: end,
      type: GamingDateRangeType.custom,
    );
  }

  factory GamingDateRange.fromType(
    GamingDateRangeType type, {
    bool isUtc = false,
  }) {
    assert(type != GamingDateRangeType.custom, 'type不能为custom');
    final now = DateTime.now();
    final baseDateTime = isUtc ? now.toUtc() : now.toLocal();
    DateTime end =
        DateTime(baseDateTime.year, baseDateTime.month, baseDateTime.day)
            .add(const Duration(microseconds: endMicroseconds));
    if (isUtc) {
      end = end.add(now.timeZoneOffset);
    }
    int days = 1;
    if (type == GamingDateRangeType.week) {
      days = 7;
    } else if (type == GamingDateRangeType.month) {
      days = 30;
    } else if (type == GamingDateRangeType.last90) {
      days = 90;
    }
    final start = end.subtract(Duration(days: days - 1) +
        const Duration(microseconds: endMicroseconds));

    return GamingDateRange(
      start: start,
      end: end,
      type: type,
    );
  }

  Map<String, int> toTimestamp({
    String startKey = 'beginDate',
    String endKey = 'endDate',
  }) {
    return {
      startKey: start.millisecondsSinceEpoch,
      endKey: end.millisecondsSinceEpoch,
    };
  }

  @override
  bool operator ==(Object other) {
    return other is GamingDateRange &&
        start == other.start &&
        end == other.end &&
        type == other.type;
  }

  @override
  int get hashCode {
    return start.hashCode ^ end.hashCode ^ type.hashCode;
  }
}

enum GamingDateRangeType {
  today('today'),
  week('seven_days'),
  month('thirty_days'),
  last90('past_c_d'),
  custom('custom_time');

  const GamingDateRangeType(this.translate);
  final String translate;

  String description(bool isUtc) {
    return '${localized(translate)}${isUtc ? ' (GMT+0)' : ''}';
  }
}
