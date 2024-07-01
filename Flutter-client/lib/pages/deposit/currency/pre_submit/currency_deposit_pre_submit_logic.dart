import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/currency/models/payment/gaming_currency_payment_model.dart';
import 'package:gogaming_app/common/service/payment_iq_service/payment_iq_config.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/widget_header.dart';

import 'currency_deposit_pre_submit_logic_m1.dart';

abstract class CurrencyDepositPreSubmitLogic extends BaseController
    with SingleRenderControllerMixin {
  CurrencyDepositPreSubmitState get state;
  PaymentIQController get paymentIQController;

  String get tag;

  void setCurrency(GamingCurrencyModel value);

  void updatePaymentTab(String tab, [GamingCurrencyPaymentModel? channel]);

  void submit();

  GamingCurrencyPaymentModel? getArtificialChannel();

  void onDeposit(Map<String, dynamic> data);

  void submitPIQ();

  void selectCurrency();
  void selectCryptoCurrency();
  void selectNetwork();
  void updatePayment(GamingCurrencyPaymentModel payment);
}
