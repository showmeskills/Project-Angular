part of 'currency_deposit_pre_submit_logic_m1.dart';

class CurrencyDepositPreSubmitState {
  final dataObs = GoGamingPagination<GamingCurrencyHistoryModel>().obs;
  GoGamingPagination<GamingCurrencyHistoryModel> get data => dataObs.value;

  final currencyObs = () {
    GamingCurrencyModel? currencyModel;
    return currencyModel.obs;
  }();
  GamingCurrencyModel? get currency => currencyObs.value;

  final paymentMapObs = () {
    Map<String, List<GamingCurrencyPaymentModel>>? data;
    return data.obs;
  }();
  Map<String, List<GamingCurrencyPaymentModel>>? get paymentMap =>
      paymentMapObs.value;

  /// 存虚得法 的虚拟币
  final cryptoCurrencyObs = () {
    GamingCurrencyModel? currencyModel;
    return currencyModel.obs;
  }();
  GamingCurrencyModel? get cryptoCurrency => cryptoCurrencyObs.value;

  late final networkObs = () {
    GamingCurrencyNetworkModel? networkModel;
    return networkModel.obs;
  }();
  GamingCurrencyNetworkModel? get network => networkObs.value;

  // ignore: prefer_final_fields
  Map<String, List<GamingCurrencyNetworkModel>> networks = {};

  /// 存续得法可选币种
  final RxList<GamingCurrencyModel> currentModelListObs =
      <GamingCurrencyModel>[].obs;
  List<GamingCurrencyModel> get currentModelList => currentModelListObs;

  GamingCurrencyPaymentResultModel? paymentModel;
  late final _payment = paymentModel.obs;
  GamingCurrencyPaymentResultModel? get payment => _payment.value;

  final RxnString currentPaymentTabObs = RxnString();
  String? get currentPaymentTab => currentPaymentTabObs.value;

  List<GamingCurrencyPaymentModel> get currentPaymentList {
    return paymentMap?[currentPaymentTab] ?? [];
  }

  GamingCurrencyPaymentModel? currentPaymentModel;
  late final currentPaymentObs = currentPaymentModel.obs;
  GamingCurrencyPaymentModel? get currentPayment => currentPaymentObs.value;

  GamingCurrencyPaymentModel? artificialChannel;

  final RxBool isLoadingObs = false.obs;
  bool get isLoading => isLoadingObs.value;
  bool get enable =>
      currentPaymentTab != null &&
      currentPaymentList.isNotEmpty &&
      currentPayment != null &&
      (currentPayment?.actionType != 6 ||
          (isDepositVirtualGetCurrency &&
              cryptoCurrency != null &&
              network != null));
  //是否是存续得法
  bool get isDepositVirtualGetCurrency => currentPayment?.actionType == 6;

  final showPIQObs = false.obs;
  bool get showPIQ => showPIQObs.value;
}
