import 'package:base_framework/base_framework.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/service/x5_core_service.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/config/gaps.dart';

import '../../R.dart';
import '../../common/lang/locale_lang.dart';
import '../../common/theme/colors/go_gaming_colors.dart';
import '../../common/theme/text_styles/gg_text_styles.dart';
import '../../common/widgets/appbar/appbar.dart';
import '../base/base_view.dart';
import 'about_us_logic.dart';

class AboutUsPage extends BaseView<AboutUsLogic> {
  const AboutUsPage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const AboutUsPage(),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.userBottomAppbar(
      title: localized('abount_us'),
    );
  }

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  Widget body(BuildContext context) {
    Get.put(AboutUsLogic());
    return SingleChildScrollView(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.dp),
        child: Column(
          children: [
            Gaps.vGap20,
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 30.dp),
              child: Image.asset(
                R.mainMenuAboutUsBack,
              ),
            ),
            Gaps.vGap20,
            Obx(() {
              if (!controller.showDebugInfo.value) {
                return Gaps.empty;
              }
              return Container(
                width: double.infinity,
                height: 48.dp,
                decoration: BoxDecoration(
                  color: GGColors.moduleBackground.color,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16.dp),
                  child: Row(
                    children: [
                      Text(
                        'WebView Core:',
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textMain.color,
                        ),
                      ),
                      const Spacer(),
                      Obx(() {
                        return Text(
                          X5CoreService.sharedInstance.version.isX5Core
                              ? 'x5_${X5CoreService.sharedInstance.version.coreVersion}'
                              : 'System',
                          style: GGTextStyle(
                            fontSize: GGFontSize.content,
                            color: GGColors.textMain.color,
                          ),
                        );
                      })
                    ],
                  ),
                ),
              );
            }),
            GestureDetector(
              onTap: controller.debugInfo,
              child: Container(
                width: double.infinity,
                height: 48.dp,
                decoration: BoxDecoration(
                  color: GGColors.moduleBackground.color,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16.dp),
                  child: Row(
                    children: [
                      Text(
                        localized("app_version"),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textMain.color,
                        ),
                      ),
                      const Spacer(),
                      Text(
                        _versionName(),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textMain.color,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            Gaps.vGap16,
            Obx(() => ScaleTap(
                  opacityMinValue: 0.8,
                  scaleMinValue: 0.98,
                  onPressed: controller.isChecking.value
                      ? null
                      : controller.checkUpdate,
                  child: Container(
                    width: double.infinity,
                    height: 40.dp,
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: GGColors.border.color,
                        width: 1.dp,
                      ),
                      color: Colors.transparent,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Center(
                      child: Text(
                        localized("check_update"),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textMain.color,
                        ),
                      ),
                    ),
                  ),
                )),
          ],
        ),
      ),
    );
  }

  String _versionName() {
    String? appVersionNumber;
    if (!Config.versionName.contains('#')) {
      appVersionNumber = Config.versionName;
    }
    return appVersionNumber ?? '';
  }
}
