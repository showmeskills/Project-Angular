import 'package:base_framework/base_controller.dart';
import '../../../common/api/currency/models/gaming_currency_model.dart';
import '../../../common/api/currency/models/gaming_currency_quota_model.dart';
import '../../../common/api/currency/models/payment/gaming_currency_payment_model.dart';
import '../../../common/api/currency/models/payment/gaming_currency_payment_result_model.dart';
import '../../../common/lang/locale_lang.dart';

class FiatWithdrawState {
  /// 当前选中的币种
  GamingCurrencyModel? _currencyModel;
  late final currentCurrency = _currencyModel.obs;

  /// 当前可选提现方式
  GamingCurrencyPaymentResultModel? _paymentModel;
  late final payment = _paymentModel.obs;

  /// 当前选中的支付方式分类
  final selectPaymentType = localized("other_pay").obs;

  /// 当前选中提现方式
  GamingCurrencyPaymentModel? _paymentInfo;
  late final selectPaymentInfo = _paymentInfo.obs;

  GamingCurrencyQuotaModel? _currencyQuotaModel;
  late final currencyQuotaModel = _currencyQuotaModel.obs;

  final showPIQ = false.obs;
}
