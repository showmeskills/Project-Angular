part of 'crypto_deposit_logic.dart';

class CryptoDepositState {
  final _data = GoGamingPagination<GamingCryptoHistoryModel>().obs;
  GoGamingPagination<GamingCryptoHistoryModel> get data => _data.value;

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

  List<GamingCurrencyModel> get quickCurrency {
    final list = GamingCurrencySelector.getCryptoList();

    return list.sublist(0, min(list.length, 5));
  }

  GamingDepositAddressModel? addressModel;
  late final _address = addressModel.obs;
  GamingDepositAddressModel? get address => _address.value;
}
