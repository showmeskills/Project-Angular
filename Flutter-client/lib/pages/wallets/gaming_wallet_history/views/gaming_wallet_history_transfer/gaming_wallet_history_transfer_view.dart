part of '../../gaming_wallet_history_page.dart';

class GamingWalletHistoryTransferView extends StatelessWidget
    with BaseRefreshViewDelegate {
  const GamingWalletHistoryTransferView({Key? key}) : super(key: key);
  GamingWalletHistoryTransferLogic get controller2 =>
      Get.find<GamingWalletHistoryTransferLogic>();
  @override
  Color get footerColor => GGColors.moduleBackground.color;
  @override
  Widget build(BuildContext context) {
    Get.put(GamingWalletHistoryTransferLogic());

    return RefreshView(
      controller: controller2,
      delegate: this,
      child: SingleChildScrollView(
        child: Obx(() {
          return Column(
            children: controller2.state.historyData.map((e) {
              return GamingWalletHistoryTransferCryptoViewItem(data: e);
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
