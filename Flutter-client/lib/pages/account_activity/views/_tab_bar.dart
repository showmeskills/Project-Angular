part of '../account_activity_page.dart';

class _TabBar extends StatelessWidget {
  const _TabBar();

  AccountActivityLogic get controller => Get.find<AccountActivityLogic>();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(top: 17.dp, bottom: 8.dp),
      width: double.infinity,
      alignment: Alignment.centerLeft,
      child: TabBar(
        indicatorColor: GGColors.highlightButton.color,
        indicatorSize: TabBarIndicatorSize.label,
        indicatorWeight: 4.dp,
        isScrollable: true,
        labelStyle: GGTextStyle(fontSize: GGFontSize.content),
        labelColor: GGColors.textMain.color,
        unselectedLabelColor: GGColors.textSecond.color,
        labelPadding: EdgeInsets.symmetric(horizontal: 16.dp),
        tabs: AccountActivityType.values.map((e) {
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
