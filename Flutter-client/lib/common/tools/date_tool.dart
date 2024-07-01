import 'package:gogaming_app/widget_header.dart';
import 'package:intl/intl.dart';

class DateTool {
  static String covertDateTimeToString(DateTime dateTime,
      {String format = "yyyy-MM-dd HH:mm:ss"}) {
    return DateFormat(format).format(dateTime);
  }

  static String timeAgo(DateTime dateTime, {bool numericDates = true}) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    if (difference.inDays >= 1) {
      return covertDateTimeToString(dateTime);
    } else if (difference.inHours >= 1) {
      return '${difference.inHours}${localized('hour_ag00')}';
    } else {
      return '1${localized('hour_ag00')}';
    }
  }
}
