part of '../../gaming_wallet_history_page.dart';

class GamingWalletHistoryDepositView extends StatelessWidget
    with BaseRefreshViewDelegate {
  const GamingWalletHistoryDepositView({
    Key? key,
  }) : super(key: key);

  GamingWalletHistoryDepositLogic get controller2 =>
      Get.find<GamingWalletHistoryDepositLogic>();
  @override
  Color get footerColor => GGColors.moduleBackground.color;
  @override
  Widget build(BuildContext context) {
    Get.put(
      GamingWalletHistoryDepositLogic(),
    );

    return RefreshView(
      controller: controller2,
      delegate: this,
      child: SingleChildScrollView(
        child: Obx(() {
          return Column(
            children: logic.state.isDigital.value
                ? controller2.state.cryptoData.map((e) {
                    return GamingWalletHistoryDepositCryptoViewItem(data: e);
                  }).toList()
                : controller2.state.currencyData.map((e) {
                    return GamingWalletHistoryDepositCurrencyViewItem(data: e);
                  }).toList(),
          );
        }),
      ),
    );
  }

  GamingWalletHistoryLogic get logic => Get.find<GamingWalletHistoryLogic>();

  @override
  RefreshViewController get renderController => logic.controller;
}
