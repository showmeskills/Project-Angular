part of 'transfer_wallet_logic.dart';

class TransferWalletState {
  TransferWalletState(GamingAggsWalletModel wallet) : _walletModel = wallet;

  final GamingAggsWalletModel _walletModel;
  late final _wallet = _walletModel.obs;
  GamingAggsWalletModel get wallet => _wallet.value;

  final _data = GoGamingPagination<GamingTransferWalletHistoryModel>().obs;

  GoGamingPagination<GamingTransferWalletHistoryModel> get data => _data.value;

  final _currencyService = CurrencyService();

  GamingCurrencyModel get selectedCurrency => _currencyService.selectedCurrency;

  double get _selectedCurrencyRate =>
      _currencyService.getUSDTRate(selectedCurrency.currency);

  /// usdt转换用户选择币种
  String get usdtConvert {
    if (_selectedCurrencyRate == 0) {
      return NumberPrecision(0).balanceText(selectedCurrency.isDigital);
    }
    final result = NumberPrecision(wallet.total)
        .divide(NumberPrecision(_selectedCurrencyRate));

    return result.balanceText(selectedCurrency.isDigital);
  }
}
