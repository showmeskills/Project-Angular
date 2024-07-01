part of '../../gaming_wallet_history_page.dart';

class GamingWalletHistoryCommissionView extends StatelessWidget
    with BaseRefreshViewDelegate {
  const GamingWalletHistoryCommissionView({Key? key}) : super(key: key);
  GamingWalletHistoryCommissionLogic get controller2 =>
      Get.find<GamingWalletHistoryCommissionLogic>();
  @override
  Color get footerColor => GGColors.moduleBackground.color;
  @override
  Widget build(BuildContext context) {
    Get.put(GamingWalletHistoryCommissionLogic());

    return RefreshView(
      controller: controller2,
      delegate: this,
      child: SingleChildScrollView(
        child: Obx(() {
          return Column(
            children: controller2.state.historyData.map((e) {
              return GamingWalletHistoryCommissionViewItem(data: e);
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
