import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app_base_project/gg_base_project_header.dart';

import '../../R.dart';
import '../../common/theme/text_styles/gg_text_styles.dart';
import '../../config/gaps.dart';
import 'line_center_logic.dart';
import 'line_center_state.dart';

class LineCenterPage extends BaseView<LineCenterLogic> {
  const LineCenterPage({Key? key}) : super(key: key);

  LineCenterState get state => controller.state;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const LineCenterPage(),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.userAppbar();
  }

  @override
  Widget body(BuildContext context) {
    Get.put(LineCenterLogic());
    return SingleChildScrollView(
      child: Column(
        children: [
          Container(
            alignment: Alignment.center,
            child: GamingImage.asset(
              R.homeLineCenterBg,
              width: 229.dp,
              height: 229.dp,
            ),
          ),
          Gaps.vGap20,
          Text(
            localized('line_inspection_center'),
            style: GGTextStyle(
              color: GGColors.textMain.color,
              fontSize: GGFontSize.bigTitle20,
            ),
          ),
          Gaps.vGap20,
          Text(
            localized('line_center_tip'),
            style: GGTextStyle(
              color: GGColors.textHint.color,
              fontSize: GGFontSize.hint,
            ),
            textAlign: TextAlign.center,
          ),
          Gaps.vGap20,
          _buildList(),
          Gaps.safeArea(),
        ],
      ),
    );
  }

  Widget _buildList() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 18.dp),
      child: Obx(() {
        return Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ...state.domainList.map((element) {
              return _buildItem(element);
            }).toList(),
            Gaps.vGap20,
            Text(
              localized('line_center_tip2'),
              style: GGTextStyle(
                color: GGColors.textMain.color,
                fontSize: GGFontSize.content,
              ),
            ),
          ],
        );
      }),
    );
  }

  Widget _buildItem(LineCenterDomainModel model) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12.dp),
      child: Container(
        height: 48.dp,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(4.dp),
          color: GGColors.border.color,
        ),
        child: Row(
          children: [
            Gaps.hGap12,
            Text(
              model.domain ?? '',
              style: GGTextStyle(
                color: GGColors.textMain.color,
                fontSize: GGFontSize.hint,
              ),
            ),
            const Spacer(),
            Text(
              model.delay ?? '',
              style: GGTextStyle(
                color: GGColors.textMain.color,
                fontSize: GGFontSize.hint,
              ),
            ),
            Gaps.hGap8,
            GestureDetector(
              onTap: () {
                controller.changeDomain(model.domain ?? '');
              },
              behavior: HitTestBehavior.opaque,
              child: Container(
                width: 54.dp,
                decoration: BoxDecoration(
                  color: GGColors.brand.color,
                  borderRadius: BorderRadius.only(
                    topRight: Radius.circular(4.dp),
                    bottomRight: Radius.circular(4.dp),
                  ),
                ),
                child: Center(
                  child: Text(
                    localized("access"),
                    style: GGTextStyle(
                      color: Colors.white,
                      fontSize: GGFontSize.hint,
                    ),
                  ),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}
