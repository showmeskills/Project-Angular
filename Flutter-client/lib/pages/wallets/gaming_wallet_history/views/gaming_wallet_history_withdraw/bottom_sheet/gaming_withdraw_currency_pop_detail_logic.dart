import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/wallet_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';

class GamingWithdrawCurrencyPopDetailLogic extends BaseController {
  WalletService get walletService => WalletService();

  /// 取消订单
  void clearWithdraw(String orderNum) {
    walletService.cancelCurrency(orderNum).listen((event) {
      if (event) {
        Toast.showSuccessful(localized('cancel_c_s'));
      } else {
        Toast.showFailed(localized('cancel_c_f'));
      }
    }, onError: (e) {
      Toast.showFailed(localized('cancel_c_s'));
    });
  }
}
