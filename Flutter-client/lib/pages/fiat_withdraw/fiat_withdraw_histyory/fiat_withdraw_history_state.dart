import 'package:base_framework/base_controller.dart';
import '../../../common/api/base/go_gaming_pagination.dart';
import '../../../common/api/history/models/gaming_currency_history_model.dart';

class FiatWithdrawHistoryState {
  final data = GoGamingPagination<GamingCurrencyHistoryModel>().obs;
}
