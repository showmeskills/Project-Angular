import 'package:intl/intl.dart';

export 'package:intl/intl.dart';

extension DateFormatExtension on DateFormat {
  String formatTimestamp(int timestamp) {
    return format(DateTime.fromMillisecondsSinceEpoch(timestamp));
  }
}
