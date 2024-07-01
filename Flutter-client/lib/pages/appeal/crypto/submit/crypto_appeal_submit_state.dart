part of 'crypto_appeal_submit_logic.dart';

class CryptoAppealSubmitState {
  final _currency = () {
    GamingCurrencyModel? currencyModel;
    return currencyModel.obs;
  }();
  GamingCurrencyModel? get currency => _currency.value;

  late final _network = () {
    GamingCurrencyNetworkModel? networkModel;
    return networkModel.obs;
  }();
  GamingCurrencyNetworkModel? get network => _network.value;

  // ignore: prefer_final_fields
  Map<String, List<GamingCurrencyNetworkModel>> _networks = {};

  final _enable = false.obs;
  bool get enable => _enable.value;

  final _exist = false.obs;
  bool get exist => _exist.value;

  final _loading = false.obs;
  bool get loading => _loading.value;
}
