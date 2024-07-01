part of 'currency_service.dart';

mixin _SettingsMixin {
  /// 是否隐藏0余额的货币
  final _cacheHideZeroBalance = ReadWriteValue<bool>(
    'CurrencyService._cacheHideZeroBalance',
    false,
    () => GetStorage(),
  );

  late final hideZeroBalanceObs = () {
    final hide = _cacheHideZeroBalance.val;
    return hide.obs;
  }();
  bool get hideZeroBalance => hideZeroBalanceObs.value;

  /// 缓存 加密货币是否显示为法币
  // final _cacheDisplayCryptoInFiat = ReadWriteValue<bool>(
  //   'CurrencyService._cacheDisplayCryptoInFiat',
  //   false,
  //   () => GetStorage(),
  // );

  // late final _displayCryptoInFiat = () {
  //   final inFiat = _cacheDisplayCryptoInFiat.val;
  //   return inFiat.obs;
  // }();
  // bool get displayCryptoInFiat =>
  //     _displayCryptoInFiat.value && displayFiatCurrency != null;

  /// 缓存 显示法币币种
  final _cacheDisplayFiatCurrency = ReadWriteValue<Map<String, dynamic>?>(
    'CurrencyService._displayCurrency',
    null,
    () => GetStorage(),
  );

  late final displayFiatCurrencyObs = () {
    final currency = _cacheDisplayFiatCurrency.val;
    return (currency == null ? null : GamingCurrencyModel.fromJson(currency))
        .obs;
  }();
  GamingCurrencyModel? get displayFiatCurrency => displayFiatCurrencyObs.value;
  bool get diplayInFiat => displayFiatCurrency != null;

  /// 切换是否隐藏0余额的货币
  void setHideZeroBalance(bool v) {
    hideZeroBalanceObs.value = v;
    _cacheHideZeroBalance.val = v;
  }

  /// 切换是否以法币显示加密货币
  void setDisplayCryptoInFiat(GamingCurrencyModel? currency) {
    displayFiatCurrencyObs.value = currency;
    _cacheDisplayFiatCurrency.val = currency?.toJson();
  }

  /// 加密货币余额转法币
  NumberPrecision cryptoToFiat({
    required String currency,
    required num balance,
  }) {
    if (diplayInFiat) {
      final fiatUSDTRate = CurrencyService.sharedInstance
          .getUSDTRate(displayFiatCurrency!.currency);
      // 当前加密货币的汇率
      final rate = CurrencyService.sharedInstance.getUSDTRate(currency);
      // 加密货币转为USDT
      final usdtBalance = NumberPrecision(balance).times(NumberPrecision(rate));
      // USDT转为法币
      return usdtBalance.divide(NumberPrecision(fiatUSDTRate));
    } else {
      return NumberPrecision(balance);
    }
  }
}
