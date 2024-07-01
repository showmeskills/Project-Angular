// ignore_for_file: public_member_api_docs, sort_constructors_first
part of 'main_wallet_logic.dart';

enum MainWalletCurrencySortType {
  currency,
  canUseAmount,
  freezeAmount,
  all;

  const MainWalletCurrencySortType();
  String get title {
    switch (this) {
      case currency:
        return localized('curr');
      case all:
        return localized('all');
      case canUseAmount:
        return localized('ava');
      case freezeAmount:
        return localized('in_order');
    }
  }
}

enum MainWalletCurrencySortOrder {
  ascending,
  descending,
}

class MainWalletCurrencySort {
  final MainWalletCurrencySortType type;
  final MainWalletCurrencySortOrder order;

  MainWalletCurrencySort({
    required this.type,
    required this.order,
  });

  factory MainWalletCurrencySort.ascending({
    required MainWalletCurrencySortType type,
  }) {
    return MainWalletCurrencySort(
      type: type,
      order: MainWalletCurrencySortOrder.ascending,
    );
  }

  factory MainWalletCurrencySort.descending({
    required MainWalletCurrencySortType type,
  }) {
    return MainWalletCurrencySort(
      type: type,
      order: MainWalletCurrencySortOrder.descending,
    );
  }

  MainWalletCurrencySort copyWith({
    MainWalletCurrencySortType? type,
    MainWalletCurrencySortOrder? order,
  }) {
    return MainWalletCurrencySort(
      type: type ?? this.type,
      order: order ?? this.order,
    );
  }
}

class MainWalletState {
  late final _wallet = GamingMainWalletModel().obs;
  GamingMainWalletModel get wallet => _wallet.value;

  final RxList<GamingMainWalletCurrencyModel> _currencies =
      <GamingMainWalletCurrencyModel>[].obs;
  List<GamingMainWalletCurrencyModel> get currencies => _currencies;

  final textFieldController = GamingTextFieldController();

  final _currencyService = CurrencyService();

  GamingCurrencyModel get selectedCurrency => _currencyService.selectedCurrency;

  double get _selectedCurrencyRate =>
      _currencyService.getUSDTRate(selectedCurrency.currency);

  /// 转换为USDT
  NumberPrecision _convertUSDT(double amount, String currency) {
    return NumberPrecision(amount)
        .times(NumberPrecision(_currencyService.getUSDTRate(currency)));
  }

  /// usdt转换用户选择币种
  String get usdtConvert {
    if (_selectedCurrencyRate == 0) {
      return NumberPrecision(0).balanceText(selectedCurrency.isDigital);
    }
    final result = NumberPrecision(wallet.totalAsset)
        .divide(NumberPrecision(_selectedCurrencyRate));

    return result.balanceText(selectedCurrency.isDigital);
  }

  final RxnString _expanded = RxnString();
  String? get expanded => _expanded.value;

  MainWalletCurrencySort? _sortModel;
  late final _sort = _sortModel.obs;
  MainWalletCurrencySort? get sort => _sort.value;

  final _hideSmallAsset = false.obs;

  bool get hideSmallAsset => _hideSmallAsset.value;
}
