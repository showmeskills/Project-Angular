part of 'risk_assessment_logic.dart';

class RiskAssessmentState {
  final currencyService = CurrencyService.sharedInstance;
  late final currencyList = currencyService.getFiatList();

  late final _currency = () {
    final defaultCurrency = GamingCurrencyModel.cny();
    GamingCurrencyModel selectedCurrency = defaultCurrency;

    if (!currencyService.selectedCurrency.isDigital) {
      selectedCurrency = currencyService.selectedCurrency;
    }

    if (!currencyList
        .map((e) => e.currency)
        .contains(selectedCurrency.currency)) {
      selectedCurrency = currencyList.firstOrNull ?? defaultCurrency;
    }
    return selectedCurrency.obs;
  }();

  GamingCurrencyModel get currency => _currency.value;

  late final _employStatus = () {
    EmployStatus? value;
    return value.obs;
  }();

  EmployStatus? get employStatus => _employStatus.value;
  final _employStatusError = false.obs;
  bool get employStatusError => _employStatusError.value;

  late final _assetSource = () {
    AssetSource? value;
    return value.obs;
  }();

  AssetSource? get assetSource => _assetSource.value;
  final _assetSourceError = false.obs;
  bool get assetSourceError => _assetSourceError.value;

  final _enable = false.obs;
  bool get enable => _enable.value;

  final _loading = false.obs;
  bool get loading => _loading.value;
}
