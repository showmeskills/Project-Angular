part of '../../gaming_wallet_history_page.dart';

class GamingWalletHistoryLuckyDrawView extends StatelessWidget
    with BaseRefreshViewDelegate {
  const GamingWalletHistoryLuckyDrawView({Key? key}) : super(key: key);
  GamingWalletHistoryLuckyDrawLogic get controller2 =>
      Get.find<GamingWalletHistoryLuckyDrawLogic>();
  @override
  Color get footerColor => GGColors.moduleBackground.color;
  @override
  Widget build(BuildContext context) {
    Get.put(GamingWalletHistoryLuckyDrawLogic());

    return RefreshView(
      controller: controller2,
      delegate: this,
      child: SingleChildScrollView(
        child: Obx(() {
          return Column(
            children: controller2.state.historyData.map((e) {
              return GamingWalletHistoryLuckyDrawItem(data: e);
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
