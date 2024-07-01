part of 'wallet_logic.dart';

class DashboardWalletState {
  final RxList<GamingAggsWalletModel> _wallets = <GamingAggsWalletModel>[].obs;
  List<GamingAggsWalletModel> get wallets => _wallets;
  GamingAggsWalletModel? get currentWallet {
    return _index.value == null ? null : wallets[_index.value!];
  }

  String get totalText {
    return encrypt(NumberPrecision(currentWallet!.total).balanceText(false));
  }

  String get totalText2 {
    return encrypt(NumberPrecision((currentWallet!.total /
            CurrencyService().getUSDTRate(selectedCurrency.currency!)))
        .balanceText(selectedCurrency.isDigital));
  }

  final _encryption = false.obs;
  bool get encryption => _encryption.value;

  GamingCurrencyModel get selectedCurrency =>
      CurrencyService.sharedInstance.selectedCurrency;

  final RxInt _pieTouchedIndex = RxInt(-1);

  List<PieChartSectionData> get currentPieChartSectionData {
    if (currentWallet == null || encryption) {
      return [
        _defaultPieChartSectionData.copyWith(
          color: GGColors.border.color,
          value: 100,
          title: '******',
        ),
      ];
    }
    final list =
        ((currentWallet!.currencies)..removeWhere((element) => element.totalBalance == 0))
          ..sort((a, b) => b.convertUSDT.compareTo(a.convertUSDT));
    List<PieChartSectionData> result = [];
    if (list.isEmpty) {
      result = [
        _defaultPieChartSectionData.copyWith(
          color: GGColors.border.color,
          value: 100,
          title: localized('no_data'),
        )
      ];
    } else {
      final maxCount = min(list.length, 7);
      result = List.generate(maxCount, (index) {
        final model = list[index];
        final Big value = model.convertUSDT / currentWallet!.total * 100;
        return _buildPieChartSectionData(
          index: index,
          value: value.toNumber(),
          title: '${model.currency} ${encrypt(model.balanceText)}',
          color: CurrencyService.sharedInstance.getColor(model.currency),
        );
      });
      if (list.length > maxCount) {
        final surplus = 100 -
            result
                .map((e) => e.value)
                .reduce((value, element) => value + element);
        result.add(_buildPieChartSectionData(
          index: maxCount,
          value: surplus,
          title: localized('other00'),
          color: GGColors.border.color,
        ));
      }
    }
    return result;
  }

  final _defaultPieChartSectionData = PieChartSectionData(
    showTitle: false,
    radius: 18.dp,
    titleStyle: GGTextStyle(
      fontSize: GGFontSize.content,
      color: GGColors.textMain.color,
    ),
  );

  PieChartSectionData _buildPieChartSectionData({
    int index = 0,
    required String title,
    required double value,
    required Color color,
  }) {
    final seleted = index == _pieTouchedIndex.value;
    return _defaultPieChartSectionData.copyWith(
      radius: seleted ? 22.dp : null,
      color: color
          .withOpacity(_pieTouchedIndex.value == -1 || seleted ? 0.8 : 0.4),
      value: value,
      title: title,
      titleStyle: GGTextStyle(
        fontSize: GGFontSize.content,
        color: _pieTouchedIndex.value == -1 || seleted
            ? GGColors.textMain.color
            : GGColors.textSecond.color,
      ),
    );
  }

  final RxnInt _index = RxnInt();
  int get index => _index.value ?? 0;

  String encrypt(String balanceText) {
    if (!encryption) {
      return balanceText;
    } else {
      return balanceText
          .replaceAll(RegExp(r'[\.\,]'), '')
          .replaceAll(RegExp(r'[\s\S]'), '*');
    }
  }
}
