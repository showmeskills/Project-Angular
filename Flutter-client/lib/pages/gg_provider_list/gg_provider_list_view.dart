import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/gaming_close_button.dart';
import 'package:gogaming_app/common/widgets/gaming_image/fuzzy_url_parser.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../common/delegate/base_refresh_view_delegate.dart';
import '../../common/service/game_service.dart';
import '../../common/widgets/appbar/appbar.dart';
import '../../common/widgets/gaming_image/gaming_image.dart';
import '../../generated/r.dart';
import '../home/views/home_footer.dart';
import 'gg_provider_list_logic.dart';

class GGProviderListPage extends BaseView<GGProviderListLogic>
    with BaseRefreshViewDelegate {
  const GGProviderListPage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const GGProviderListPage(),
    );
  }

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.userBottomAppbar(
      title: localized("game_pro"),
      bottomHeight: 80.dp,
      bottomBackgroundColor: GGColors.gameListHeaderBackground.color,
      leadingIcon: GamingBackButton(
        color: GGColors.textSecond.color,
        padding: EdgeInsets.symmetric(
          horizontal: 12.dp,
          vertical: 16.dp,
        ).copyWith(right: 8.dp),
      ),
      titleStyle: GGTextStyle(
        fontSize: GGFontSize.superBigTitle26,
        fontWeight: GGFontWeigh.bold,
      ),
      trailingWidgets: [
        Expanded(
          child: Image.asset(
            R.gameGameProBack,
            height: 80.dp,
            fit: BoxFit.fitHeight,
            alignment: Alignment.centerRight,
          ),
        ),
      ],
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(GGProviderListLogic());
    return Scaffold(
      backgroundColor: GGColors.background.color,
      body: RefreshView(
        delegate: this,
        controller: controller,
        child: SingleChildScrollView(
          child: Column(
            children: [
              Gaps.vGap20,
              _buildProviderList(),
              Gaps.vGap20,
              const HomeFooter(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProviderList() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12.dp),
      child: Obx(() {
        final width = ((Get.width - 48.dp) ~/ 3).toDouble();
        final height = width * 0.4;
        return Wrap(
          runSpacing: 24.dp,
          spacing: 12.dp,
          children: List.generate(
            GameService.sharedInstance.provider.length,
            (index) {
              final url = GameService.sharedInstance.provider[index].dayLogo;
              return ScaleTap(
                opacityMinValue: 0.8,
                scaleMinValue: 0.98,
                onPressed: () {
                  controller.pressProvider(
                      GameService.sharedInstance.provider[index]);
                },
                child: SizedBox(
                  width: width,
                  height: height,
                  child: Container(
                    decoration: BoxDecoration(
                      color: GGColors.providerBackground.color,
                      borderRadius: BorderRadius.circular(4.dp),
                    ),
                    child: GamingImage.fuzzyNetwork(
                      url: FuzzyUrlParser(url: url ?? '').toString(),
                      progressUrl:
                          FuzzyUrlParser.blur(url: url ?? '').toString(),
                      fit: BoxFit.cover,
                      radius: 4.dp,
                      color: Colors.white,
                      colorBlendMode: BlendMode.srcIn,
                    ),
                  ),
                ),
              );
            },
          ),
        );
      }),
    );
  }

  @override
  RefreshViewController get renderController => controller.controller;
}
