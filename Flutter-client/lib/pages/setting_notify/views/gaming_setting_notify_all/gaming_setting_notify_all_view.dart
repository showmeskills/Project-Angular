part of '../../gaming_setting_notify_page.dart';

class GamingSettingNotifyAllView extends StatelessWidget
    with BaseRefreshViewDelegate {
  GamingSettingNotifyAllView({super.key, this.type = ''});
  final String type;
  GamingSettingNotifyLogic get baseController =>
      Get.find<GamingSettingNotifyLogic>();

  @override
  Color get footerColor => GGColors.darkPopBackground.color;

  Widget _buildContent() {
    return Obx(() {
      return RefreshView(
        delegate: this,
        controller: logic,
        child: SingleChildScrollView(
          child: Column(
            children: baseController.state.curListData.list!.map<Widget>((e) {
              debugPrint('e = $e');
              return GamingSettingNotifyItem(data: e);
            }).toList(),
          ),
        ),
      );
    });
  }

  GamingSettingNotifyAllLogic get logic =>
      Get.find<GamingSettingNotifyAllLogic>(tag: type);

  @override
  RefreshViewController get renderController => logic.controller;

  Widget body(BuildContext context) {
    Get.lazyPut(() => GamingSettingNotifyAllLogic(), tag: type);
    return _buildContent();
  }

  @override
  Widget build(BuildContext context) {
    Get.lazyPut(() => GamingSettingNotifyAllLogic(), tag: type);
    return _buildContent();
  }
}
