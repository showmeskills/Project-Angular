import 'package:flutter/cupertino.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import 'gaming_preference_notification_logic.dart';

class GamingPreferenceNotificationPage
    extends BaseView<GamingPreferenceNotificationLogic> {
  const GamingPreferenceNotificationPage({
    super.key,
  });

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => const GamingPreferenceNotificationPage(),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      title: localized('insite_noti'),
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(GamingPreferenceNotificationLogic());
    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: _buildContent(context),
    );
  }

  Widget _buildContent(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).size.height - 100.dp,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap20,
          Text(localized('noti_set_tip'),
              style: GGTextStyle(
                color: GGColors.textSecond.color,
                fontSize: GGFontSize.hint,
                fontWeight: GGFontWeigh.regular,
              )),
          Gaps.vGap20,
          _buildItems(),
          const Spacer(),
          _buildBottom(context),
          SizedBox(
            height: Util.iphoneXBottom + 20.dp,
          )
        ],
      ),
    );
  }

  Widget _buildItems() {
    return Column(
      children: [
        _buildItemSys(),
        Gaps.vGap16,
        _buildItemTrade(),
        Gaps.vGap16,
        _buildItemNews(),
        Gaps.vGap16,
        _buildItemActivities(),
      ],
    );
  }

  Widget _buildItemSys() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          localized('sys_noti'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color,
            fontWeight: GGFontWeigh.regular,
          ),
        ),
        const Spacer(),
        Obx(() {
          return CupertinoSwitch(
            value: controller.isSys.value, //当前状态
            activeColor: GGColors.highlightButton.color,
            onChanged: (value) {
              controller.isSys.value = value;
            },
          );
        }),
      ],
    );
  }

  Widget _buildItemTrade() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          localized('trade_noti'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color,
            fontWeight: GGFontWeigh.regular,
          ),
        ),
        const Spacer(),
        Obx(() {
          return CupertinoSwitch(
            value: controller.isTrade.value, //当前状态
            activeColor: GGColors.highlightButton.color,
            onChanged: (value) {
              controller.isTrade.value = value;
            },
          );
        }),
      ],
    );
  }

  Widget _buildItemNews() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          localized('news_noti'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color,
            fontWeight: GGFontWeigh.regular,
          ),
        ),
        const Spacer(),
        Obx(() {
          return CupertinoSwitch(
            value: controller.isNews.value, //当前状态
            activeColor: GGColors.highlightButton.color,
            onChanged: (value) {
              controller.isNews.value = value;
            },
          );
        }),
      ],
    );
  }

  Widget _buildItemActivities() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          localized('activities_noti'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color,
            fontWeight: GGFontWeigh.regular,
          ),
        ),
        const Spacer(),
        Obx(() {
          return CupertinoSwitch(
            value: controller.isActivities.value, //当前状态
            activeColor: GGColors.highlightButton.color,
            onChanged: (value) {
              controller.isActivities.value = value;
            },
          );
        }),
      ],
    );
  }

  Widget _buildBottom(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 48.dp,
      child: GGButton(
        onPressed: () {
          controller.save();
          Navigator.of(context).pop();
        },
        text: localized('save_btn'),
      ),
    );
  }
}
