import 'package:base_framework/base_controller.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/helper/time_helper.dart';
import 'package:gogaming_app/pages/wallets/gaming_wallet_history/gaming_wallet_history_logic.dart';

import '../../../../base/base_controller.dart';

class GamingWalletHistorySiftLogic extends BaseController {
  GamingCurrencyModel? model;

  GamingWalletHistoryLogic get baseController =>
      Get.find<GamingWalletHistoryLogic>();

  DateTime defaultTime() {
    final date = DateTime.now();
    return DateTime(date.year, date.month, date.day);
  }

  void setFromSelectedDate(DateTime date) {
    baseController.setCustomizeTimeStartTime(date);
  }

  void setToSelectedDate(DateTime date) {
    baseController.setCustomizeTimeEndTime(date);
  }

  String getDateStr(DateTime date) {
    return DateFormat('yyyy-MM-dd').format(date);
  }

  void selectCurrency() {
    baseController.selectCurrency();
  }

  void setCurScopeType(DateTime start, DateTime end) {
    baseController.setCustomizeTimeScopeType(start, end);
  }
}
