part of 'currency_deposit_submit_logic.dart';

class CurrencyDepositSubmitState {
  final GamingCurrencyModel currency;
  final GamingTextFieldController amountController;

  CurrencyDepositSubmitState({
    required GamingCurrencyPaymentModel payment,
    required this.currency,
  })  : _paymentModel = payment,
        amountController = GamingTextFieldController(
          validator: [
            GamingTextFieldAmountValidator(
              min: payment.minAmount,
              max: payment.maxAmount,
              errorHint: localized('valid_amount'),
            )
          ],
        );
  final GamingCurrencyPaymentModel _paymentModel;
  late final _payment = _paymentModel.obs;
  GamingCurrencyPaymentModel get payment => _payment.value;

  /// 任意金额0 输入金额1
  final amountType = 0.obs;

  double get estimatedAmount =>
      (double.tryParse(amountController.text.value) ?? 0);
  String get estimatedAmountText {
    if (estimatedAmount == 0) {
      return currency.currency!;
    }
    return '${estimatedAmount.stripTrailingZeros()} ${currency.currency}';
  }

  String get estimatedAmountText2 {
    return '${estimatedAmount.stripTrailingZeros()} ${currency.currency}';
  }

  double get amount => estimatedAmount - estimatedAmount * payment.fee / 100;

  String get amountText {
    if (amount == 0) {
      return currency.currency!;
    }
    return '${amount.stripTrailingZeros()} ${currency.currency}';
  }

  final _isEnable = false.obs;
  bool get isEnable => _isEnable.value;

  final RxBool _isLoading = false.obs;
  bool get isLoading => _isLoading.value;

  String? get kycName => AccountService().gamingUser?.kycName;

  final _data = <GamingFaqModel>[].obs;
  List<GamingFaqModel> get data => _data;

  GamingBankModel? _bankModel;
  late final _bank = _bankModel.obs;
  GamingBankModel? get bank => _bank.value;

  final Map<String, List<GamingBankModel>> _bankMap = {};

  /// 存续得法汇率
  GamingCurrencyVirtualModel? _currencyVirtualMode;
  late final _currencyAllVirtualModel = _currencyVirtualMode.obs;
  GamingCurrencyVirtualModel? get currencyAllVirtualModel =>
      _currencyAllVirtualModel.value;

  Rates? _curRatesModel;
  late final _curRates = _curRatesModel.obs;
  Rates? get curRates => _curRates.value;
}
