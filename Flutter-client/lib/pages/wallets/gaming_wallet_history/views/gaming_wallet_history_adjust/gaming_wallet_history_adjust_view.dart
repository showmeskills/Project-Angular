part of '../../gaming_wallet_history_page.dart';

class GamingWalletHistoryAdjustView extends StatelessWidget
    with BaseRefreshViewDelegate {
  const GamingWalletHistoryAdjustView({Key? key}) : super(key: key);
  GamingWalletHistoryAdjustLogic get controller2 =>
      Get.find<GamingWalletHistoryAdjustLogic>();
  @override
  Color get footerColor => GGColors.moduleBackground.color;
  @override
  Widget build(BuildContext context) {
    Get.put(GamingWalletHistoryAdjustLogic());

    return RefreshView(
      controller: controller2,
      delegate: this,
      child: SingleChildScrollView(
        child: Obx(() {
          return Column(
            children: controller2.state.historyData.map((e) {
              return GamingWalletHistoryAdjustViewItem(data: e);
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
