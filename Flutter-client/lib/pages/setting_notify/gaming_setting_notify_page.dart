import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/delegate/base_refresh_view_delegate.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/header/gg_user_app_bar_controller.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';
import 'gaming_setting_notify_logic.dart';
import 'views/gaming_setting_notify_all/gaming_setting_notify_all_logic.dart';
import 'views/gaming_setting_notify_all/gaming_setting_notify_item.dart';
import 'package:gogaming_app/common/widgets/gaming_popup.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
part 'views/gaming_setting_notify_all/gaming_setting_notify_all_view.dart';

class GamingSettingNotifyPage extends BaseView<GamingSettingNotifyLogic>
    with BaseRefreshViewDelegate {
  const GamingSettingNotifyPage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => const GamingSettingNotifyPage(),
    );
  }

  GGUserAppBarController get userAppController =>
      Get.find<GGUserAppBarController>();

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  Color get footerColor {
    return GGColors.darkPopBackground.color;
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    Get.lazyPut(() => GamingSettingNotifyLogic());
    return GGAppBar.userBottomAppbar(
      title: localized("noti"),
      trailingWidgets: [
        const Spacer(),
        GestureDetector(
          onTap: _onClickToProfile,
          child: SvgPicture.asset(
            R.mainMenuSetting,
            height: 20.dp,
            fit: BoxFit.fitHeight,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.hGap14,
        GestureDetector(
          onTap: _readAll,
          child: SvgPicture.asset(
            R.iconIconRight,
            width: 18.dp,
            height: 18.dp,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.hGap14,
        GamingPopupLinkWidget(
          overlay: controller.limitOverlay,
          followerAnchor: Alignment.topRight,
          targetAnchor: Alignment.topLeft,
          popup: _buildClearRead(),
          offset: Offset(20.dp, 20.dp),
          triangleInset: EdgeInsetsDirectional.only(end: 8.dp),
          child: SvgPicture.asset(
            R.iconMore,
            width: 18.dp,
            height: 18.dp,
            color: GGColors.textSecond.color,
          ),
        ),
        SizedBox(
          width: 16.dp,
        ),
      ],
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.lazyPut(() => GamingSettingNotifyLogic());
    return Container(
      decoration: BoxDecoration(
          color: GGColors.darkPopBackground.color,
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(16.dp),
          )),
      padding: EdgeInsets.only(
        left: 16.dp,
        right: 16.dp,
        top: 24.dp,
      ),
      width: double.infinity,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildTabBar(),
          Gaps.vGap16,
          Expanded(child: _buildTabBarView()),
          // SizedBox(
          //     height: MediaQuery.of(context).size.height - 280.dp, //
          //     child: _buildTabBarView()),
        ],
      ),
    );
  }

  Widget _buildClearRead() {
    return Container(
      height: 80.dp,
      padding: EdgeInsets.only(left: 16.dp, right: 16.dp),
      child: Column(children: [
        GestureDetector(
          onTap: _clearBeenRead,
          child: _buildMainText(localized('clear_all')),
        ),
        _buildMainTextTwo(),
      ]),
    );
  }

  Widget _buildMainText(String str) {
    return Container(
      height: 40.dp,
      alignment: Alignment.center,
      child: Text(
        str,
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.textBlackOpposite.color,
          fontFamily: GGFontFamily.dingPro,
        ),
      ),
    );
  }

  Widget _buildMainTextTwo() {
    return GestureDetector(
        onTap: showBeenRead,
        child: Container(
          height: 40.dp,
          alignment: Alignment.center,
          child: Obx(() {
            return Text(
              controller.state.showBeenReade.value
                  ? localized('hide_read_noti')
                  : localized('show_hide_read_noti'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textBlackOpposite.color,
                fontFamily: GGFontFamily.dingPro,
              ),
            );
          }),
        ));
  }

  Widget _buildTabBar() {
    return Obx(() {
      return TabBar(
        controller: controller.state.tabController,
        padding: EdgeInsets.zero,
        isScrollable: true,
        indicatorColor: Colors.transparent,
        indicatorPadding: EdgeInsets.zero,
        unselectedLabelStyle: TextStyle(
          fontSize: GGFontSize.content.fontSize,
        ),
        unselectedLabelColor: GGColors.textSecond.color,
        labelStyle: TextStyle(
          fontSize: GGFontSize.content.fontSize,
        ),
        labelColor: GGColors.textMain.color,
        labelPadding: EdgeInsets.zero,
        tabs: [
          _buildTabItem(0, localized('all_noti'),
              controller.state.curNoticeAmount?.all ?? 0),
          _buildTabItem(1, localized('activities_noti'),
              controller.state.curNoticeAmount?.activity ?? 0),
          _buildTabItem(2, localized('sys_noti'),
              controller.state.curNoticeAmount?.system ?? 0),
          _buildTabItem(3, localized('news_noti'),
              controller.state.curNoticeAmount?.information ?? 0),
          _buildTabItem(4, localized('trade_noti'),
              controller.state.curNoticeAmount?.transaction ?? 0),
        ],
      );
    });
  }

  Widget _buildTabItem(int index, String title, int num) {
    return Obx(() {
      return Container(
        height: 36.dp,
        decoration: BoxDecoration(
          color: controller.state.curIndex.value == index
              ? GGColors.border.color
              : Colors.transparent,
          borderRadius: BorderRadius.circular(4.dp),
        ),
        alignment: Alignment.center,
        padding: EdgeInsets.symmetric(vertical: 8.dp, horizontal: 10.dp),
        child: Text(
          '$title（$num）',
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: controller.state.curIndex.value == index
                ? GGColors.textMain.color
                : GGColors.textSecond.color,
            fontFamily: GGFontFamily.dingPro,
          ),
        ),
      );
    });
  }

  Widget _buildTabBarView() {
    return TabBarView(
      controller: controller.state.tabController,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        KeepAliveWrapper(
          child: GamingSettingNotifyAllView(type: ''),
        ),
        KeepAliveWrapper(
          child: GamingSettingNotifyAllView(type: 'Activity'),
        ),
        KeepAliveWrapper(
          child: GamingSettingNotifyAllView(type: 'System'),
        ),
        KeepAliveWrapper(
          child: GamingSettingNotifyAllView(type: 'Information'),
        ),
        KeepAliveWrapper(
            child: GamingSettingNotifyAllView(
          type: 'Transaction',
        )),
      ],
    );
  }

  /// 删除所有已读通知弹窗
  void clickDelRead() {
    final title = localized('hint');
    final content = localized('sure_del_noti00');
    final dialog = DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: title,
      content: content,
      rightBtnName: localized('sure'),
      leftBtnName: localized('cancels'),
      onRightBtnPressed: () {
        Get.back<dynamic>();
        controller.deleteAll();
      },
      onLeftBtnPressed: () {
        Get.back<dynamic>();
      },
    );
    dialog.showNoticeDialogWithTwoButtons();
  }

  /// 已读所有通知弹窗
  void clickReadAll() {
    final title = localized('hint');
    final content = localized('sure_read_noti00');
    final dialog = DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: title,
      content: content,
      rightBtnName: localized('sure'),
      leftBtnName: localized('cancels'),
      onRightBtnPressed: () {
        Get.back<dynamic>();
        controller.readAll();
      },
      onLeftBtnPressed: () {
        Get.back<dynamic>();
      },
    );
    dialog.showNoticeDialogWithTwoButtons();
  }

  @override
  RefreshViewController get renderController => controller.controller;
}

extension _Action on GamingSettingNotifyPage {
  /// 清除已读
  void _clearBeenRead() {
    controller.limitOverlay.hide();
    clickDelRead();
  }

  /// 显示/隐藏已读通知
  void showBeenRead() {
    controller.limitOverlay.hide();
    controller.showBeenRead(!controller.state.showBeenReade.value);
  }

  void _onClickToProfile() {
    Get.back<dynamic>();
    Get.toNamed<dynamic>(Routes.preferencePage.route);
  }

  /// 已读所有
  void _readAll() {
    clickReadAll();
  }
}
