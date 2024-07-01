part of '../game_order_page.dart';

class _TabBar extends StatelessWidget {
  const _TabBar();

  GameOrderLogic get controller => Get.find<GameOrderLogic>();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(top: 17.dp, bottom: 8.dp),
      child: TabBar(
        indicatorColor: GGColors.highlightButton.color,
        indicatorSize: TabBarIndicatorSize.label,
        indicatorWeight: 4.dp,
        labelStyle: GGTextStyle(fontSize: GGFontSize.content),
        labelColor: GGColors.textMain.color,
        unselectedLabelColor: GGColors.textSecond.color,
        tabs: GameType.values.map((e) {
          return _buildTabItem(e.translate);
        }).toList(),
        controller: controller.tabController,
      ),
    );
  }

  Widget _buildTabItem(String title) {
    return Container(
      margin: EdgeInsets.only(bottom: 3.dp, top: 7.dp),
      child: Text(title),
    );
  }
}
