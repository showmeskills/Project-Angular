part of '../../gaming_wallet_history_page.dart';

class GamingWalletHistoryBonusView extends StatelessWidget
    with BaseRefreshViewDelegate {
  const GamingWalletHistoryBonusView({Key? key}) : super(key: key);
  GamingWalletHistoryBonusLogic get controller2 =>
      Get.find<GamingWalletHistoryBonusLogic>();
  @override
  Color get footerColor => GGColors.moduleBackground.color;
  @override
  Widget build(BuildContext context) {
    Get.put(GamingWalletHistoryBonusLogic());

    return RefreshView(
      controller: controller2,
      delegate: this,
      child: SingleChildScrollView(
        child: Obx(() {
          return Column(
            children: controller2.state.historyData.map((e) {
              return GamingWalletHistoryBonusCryptoViewItem(data: e);
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
