import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/helper/time_helper.dart';

import 'game_order_detail_layout.dart';

mixin GameOrderDetailInterface {
  String? get gameCategory;
  String? get gameProvider;
  String? get currency;
  num? get payoutAmount;

  String get payoutAmountText {
    return NumberPrecision(payoutAmount ?? 0)
        .balanceText(CurrencyService().isDigital(currency ?? ''));
  }

  String get payoutAmountTextWithSymbol {
    if (payoutAmount == null) {
      return '-';
    } else {
      if (payoutAmount! > 0) {
        return '+$payoutAmountText';
      } else {
        return payoutAmountText;
      }
    }
  }

  /// 其他值的列表
  List<GameOrderDetailValueLayout> get otherValueLayout;

  /// 多注单
  List<GameOrderDetailValueLayout> bunchLayouts(bool isSingle);

  /// 格式化时间
  String formatTime(int? timestamp) {
    if (timestamp == null) return '-';

    String date = DateFormat("yyyy-MM-dd HH:mm:ss").formatTimestamp(timestamp);
    return date;
  }

  late String Function(String code) getStatusText;
}
