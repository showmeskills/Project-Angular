import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import 'gaming_preference_invisibility_mode_logic.dart';

class GamingPreferenceInvisibilityModePage
    extends BaseView<GamingPreferenceInvisibilityModeLogic> {
  const GamingPreferenceInvisibilityModePage({
    super.key,
  });

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => const GamingPreferenceInvisibilityModePage(),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      title: localized('invisible_mode'),
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(GamingPreferenceInvisibilityModeLogic());
    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(horizontal: 0.dp),
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
          _commonInset(Text(
            localized('invisible_desc'),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.hint,
              fontWeight: GGFontWeigh.regular,
            ),
          )),
          Gaps.vGap12,
          _buildItems(),
          const Spacer(),
          _commonInset(_buildBottom(context)),
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
        _buildItem(controller.allModeStr[0]),
        _buildItem(controller.allModeStr[1]),
        _buildItem(controller.allModeStr[2]),
      ],
    );
  }

  // "fully_invisible": "完全隐身",
  // "show_uid": "显示UID",
  // "show_username": "显示用户名",
  Widget _buildItem(String str) {
    return Obx(() {
      return InkWell(
        onTap: () {
          controller.setMode(str);
        },
        child: _commonInset(Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(height: 44.dp),
            Text(
              localized(str),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: controller.isCurMode(str)
                    ? GGColors.highlightButton.color
                    : GGColors.textMain.color,
                fontWeight: GGFontWeigh.regular,
              ),
            ),
            const Spacer(),
            Visibility(
              visible: controller.isCurMode(str),
              child: SvgPicture.asset(
                R.preferencesCurRight,
                width: 14.dp,
                height: 14.dp,
                color: GGColors.highlightButton.color,
              ),
            ),
          ],
        )),
      );
    });
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

  Widget _commonInset(Widget child) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: child,
    );
  }
}
