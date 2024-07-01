import 'package:gogaming_app/common/api/history/models/gaming_currency_history_model.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/pages/wallets/gaming_wallet_history/views/gaming_wallet_history_withdraw/bottom_sheet/gaming_withdraw_currency_pop_detail_view.dart';

class GamingHistoryWithdrawCurrencyBottomSheet {
  static Future<void> show({
    required GamingCurrencyHistoryModel data,
  }) {
    return GamingBottomSheet.show<DateTime>(
      title: localized('wd_details'),
      fixedHeight: false,
      builder: (context) {
        return GamingWithdrawCurrencyPopDetailView(
          data: data,
        );
      },
    );
  }
}
