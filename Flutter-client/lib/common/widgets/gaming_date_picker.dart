import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingDatePicker {
  static Future<DateTime?> openDatePicker({
    DateTime? initialDate,
    DateTime? minDate,
    DateTime? maxDate,
  }) {
    final now = DateTime.now();
    return showDatePicker(
      locale: AppLocalizations.of(Get.context!).locale,
      context: Get.overlayContext!,
      initialDate: initialDate ?? now,
      firstDate: minDate ?? DateTime(now.year - 100, 1, 1),
      lastDate: maxDate ?? now,
      builder: (context, child) {
        final theme = Theme.of(context);
        return Theme(
          data: theme.copyWith(
            brightness: Brightness.dark,
            dialogBackgroundColor: GGColors.background.color,
            colorScheme: theme.colorScheme.copyWith(
              primary: GGColors.highlightButton.color,
              onPrimary: GGColors.buttonTextWhite.color,
              surface: GGColors.background.color,
              onSurface: GGColors.textMain.color,
            ),
          ),
          child: child ?? Container(),
        );
      },
    );
  }
}
