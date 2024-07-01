part of '../../gaming_wallet_history_page.dart';

class GamingWalletHistoryWithdrawView extends StatelessWidget
    with BaseRefreshViewDelegate {
  const GamingWalletHistoryWithdrawView({Key? key}) : super(key: key);
  GamingWalletHistoryWithdrawLogic get controller2 =>
      Get.find<GamingWalletHistoryWithdrawLogic>();

  @override
  Color get footerColor => GGColors.moduleBackground.color;

  @override
  Widget build(BuildContext context) {
    Get.put(GamingWalletHistoryWithdrawLogic());

    return RefreshView(
      controller: controller2,
      delegate: this,
      child: SingleChildScrollView(
        child: Obx(() {
          return Column(
            children: logic.state.isDigital.value
                ? controller2.state.cryptoData.map((e) {
                    return GamingWalletHistoryWithdrawCryptoViewItem(data: e);
                  }).toList()
                : controller2.state.currencyData.map((e) {
                    return GamingWalletHistoryWithdrawCurrencyViewItem(data: e);
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
