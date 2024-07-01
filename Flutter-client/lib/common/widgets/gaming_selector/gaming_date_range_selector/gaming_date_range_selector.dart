import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/common/widgets/gaming_date_picker.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/helper/time_helper.dart';
import 'package:gogaming_app/widget_header.dart';

import 'src/gaming_date_range.dart';

part 'src/custom/_gaming_custom_date_range_logic.dart';
part 'src/custom/_gaming_custom_date_range_view.dart';
part 'src/_gaming_date_range_type_item_view.dart';

class GamingDateRangeSelector {
  /// [isUtc] 为ture时 本地时间转换为utc再加上时区时差
  ///
  /// 例如 本地时间 02-17 02:10
  /// utc时间 02-16 02-16 18:10
  /// 以utc的年月日初始化成02-16 00:00之后再加上本地和utc的时差+8
  /// 最后变为02-16 08:00
  static Future<GamingDateRangeType?> show({
    required GamingDateRange selected,
    List<GamingDateRangeType> types = const [
      GamingDateRangeType.today,
      GamingDateRangeType.week,
      GamingDateRangeType.month,
      GamingDateRangeType.custom,
    ],
    bool isUtc = false,
  }) {
    return GamingBottomSheet.show<GamingDateRangeType>(
      title: localized('select_scope'),
      fixedHeight: false,
      builder: (context) {
        return SizedBox(
          width: double.infinity,
          child: SafeArea(
            top: false,
            bottom: true,
            child: Column(
              children: types.map((e) {
                return _GamingDateRangeSelectorItem(
                  data: e,
                  selected: selected.type,
                  isUtc: isUtc,
                );
              }).toList(),
            ),
          ),
        );
      },
    );
  }

  static Future<GamingDateRange?> showCustom({
    required GamingDateRange selected,
    int maxInterval = 90,
    bool isUtc = false,
  }) {
    return GamingBottomSheet.show<GamingDateRange>(
      title: localized('custom_scope') + (isUtc ? ' (GMT+0)' : ''),
      fixedHeight: true,
      builder: (context) {
        return _GamingCustomDateRangeView(
          selected: selected,
          maxInterval: maxInterval,
          isUtc: isUtc,
        );
      },
    );
  }
}
