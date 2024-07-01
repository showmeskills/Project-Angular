// ignore_for_file: unused_element

part of '../../gaming_date_range_selector.dart';

class _GamingCustomDateRangeLogic extends GetxController {
  final int maxInterval;
  final bool isUtc;

  _GamingCustomDateRangeLogic({
    GamingDateRange? selected,
    this.maxInterval = 90,
    this.isUtc = false,
  }) {
    _start.value = selected?.start;
    _end.value = selected?.end;
  }

  late final _start = () {
    DateTime? dateTime;
    return dateTime.obs;
  }();
  DateTime? get start => _start.value;

  late final _end = () {
    DateTime? dateTime;
    return dateTime.obs;
  }();
  DateTime? get end => _end.value;

  bool get allowSubmit {
    if (_start.value != null && _end.value != null) {
      if (_start.value!.isBefore(_end.value!)) {
        return _end.value!.difference(_start.value!).inDays <= maxInterval;
      }
    }
    return false;
  }

  void setStart(DateTime? value) {
    if (value != null) {
      if (isUtc) {
        value = DateTime.utc(value.year, value.month, value.day)
            .add(value.timeZoneOffset);
      }
      _start.value = value;
      if (end != null) {
        if (value.isAfter(end!)) {
          _end.value = null;
        } else {
          final days = end!.difference(value).inDays;
          if (days > maxInterval) {
            _end.value = value.add(Duration(days: maxInterval) +
                Duration(
                  microseconds: isUtc ? 0 : GamingDateRange.endMicroseconds,
                ));
          }
        }
      }
    }
  }

  void setEnd(DateTime? value) {
    if (value != null) {
      if (isUtc) {
        value = DateTime.utc(value.year, value.month, value.day)
            .add(value.timeZoneOffset);
      } else {
        value = value.add(const Duration(
          microseconds: GamingDateRange.endMicroseconds,
        ));
      }
      _end.value = value;
      if (start != null) {
        if (value.isBefore(start!)) {
          _start.value = null;
        } else {
          final days = value.difference(start!).inDays;
          if (days > maxInterval) {
            _start.value = value.subtract(Duration(days: maxInterval));
          }
        }
      }
    }
  }
}
