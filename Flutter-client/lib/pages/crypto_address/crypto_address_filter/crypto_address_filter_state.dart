part of 'crypto_address_filter_logic.dart';

class CryptoAddressFilterState {
  final _type = CryptoAddressPayMethod.all.obs;
  CryptoAddressPayMethod get type => _type.value;

  final _isUniversalAddress = CryptoAddressIsUniversal.all.obs;
  CryptoAddressIsUniversal get isUniversalAddress => _isUniversalAddress.value;

  final _isWhiteList = CryptoAddressIsWhitelist.all.obs;
  CryptoAddressIsWhitelist get isWhiteList => _isWhiteList.value;

  late final _currency = () {
    GamingCurrencyModel? model;
    return model.obs;
  }();

  GamingCurrencyModel? get currency => _currency.value;

  late final _ewalletPayment = () {
    EWalletPaymentListModel? model;
    return model.obs;
  }();
  EWalletPaymentListModel? get ewalletPayment => _ewalletPayment.value;

  List<EWalletPaymentListModel>? _ewalletPaymentList;
}
