import 'package:flutter/material.dart';
import 'package:gogaming_app/common/delegate/base_refresh_view_delegate.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_game_label_icon.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/home/views/home_footer.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../R.dart';
import '../../common/service/merchant_service/merchant_service.dart';
import '../../common/widgets/gaming_banner.dart';
import '../../common/widgets/gaming_image/gaming_image.dart';
import '../game_stats/game_stats_view.dart';
import 'game_home_logic.dart';
import 'views/game_home_hall_view.dart';
import 'views/game_home_tab_view.dart';

class GameHomePage extends BaseView<GameHomeLogic>
    with BaseRefreshViewDelegate {
  const GameHomePage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => GameHomePage.argument(Get.arguments as Map<String, dynamic>?),
    );
  }

  factory GameHomePage.argument(Map<String, dynamic>? arguments) {
    return const GameHomePage();
  }

  GameHomeState get state => controller.state;

  @override
  RefreshViewController get renderController => controller.controller;

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  bool resizeToAvoidBottomInset() => false;

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.userAppbar();
  }

  @override
  Widget body(BuildContext context) {
    Get.put(GameHomeLogic());
    return Stack(
      children: [
        Positioned.fill(
          child: _buildBack(),
        ),
        Positioned.fill(
          child: RefreshView(
            delegate: this,
            controller: controller,
            child: SingleChildScrollView(
              child: Column(
                children: [
                  Gaps.vGap10,
                  Obx(() {
                    return GamingBanner(
                      banner: state.banner,
                    );
                  }),
                  Gaps.vGap20,
                  _buildLabelBar(),
                  Obx(() {
                    if (state.index.value == 0) {
                      return const GameHomeHallView();
                    }
                    return GameHomeTabView(
                      label: state.currentLabel,
                    );
                  }),
                  Gaps.vGap20,
                  const GameStatsView(gameCategory: ["SlotGame", "LiveCasino"]),
                  Gaps.vGap22,
                  const HomeFooter(),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBack() {
    if (MerchantService
            .sharedInstance.merchantConfigModel?.config?.isEuropeanCup ==
        true) {
      return Obx(() {
        return Visibility(
          visible: controller.state.loadSuccess.value,
          child: Stack(
            children: [
              Positioned.fill(
                child: GamingImage.asset(
                  R.homeEuropeanBg,
                  fit: BoxFit.cover,
                ),
              ),
              Positioned.fill(
                child: Container(
                  color: GGColors.background.color.withOpacity(0.6),
                ),
              ),
            ],
          ),
        );
      });
    }
    return Container();
  }

  Widget _buildLabelBar() {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 12.dp),
      height: 50.dp,
      child: Obx(
        () => TabBar(
          controller: state.tabController,
          isScrollable: true,
          indicatorWeight: 0.dp,
          indicator: const BoxDecoration(),
          labelPadding: EdgeInsets.zero,
          tabs: List.generate(state.hallTab.length, (index) {
            final isFirst = index == 0;
            final isLast = index == state.hallTab.length - 1;
            return Ink(
              height: 50.dp,
              decoration: BoxDecoration(
                borderRadius: isFirst || isLast
                    ? BorderRadius.horizontal(
                        left: Radius.circular(isFirst ? 25.dp : 0),
                        right: Radius.circular(isLast ? 25.dp : 0))
                    : BorderRadius.zero,
                color: GGColors.gameTabBarBackgroundColor.color,
              ),
              padding: EdgeInsets.only(
                left: isFirst ? 5.dp : 0,
                right: isLast ? 5.dp : 0,
              ),
              child: Center(
                child: InkWell(
                  onTap: () {
                    state.tabController.animateTo(index);
                  },
                  overlayColor:
                      MaterialStateProperty.all(GGColors.border.color),
                  borderRadius: BorderRadius.circular(18.dp),
                  child: Obx(() => Container(
                        height: 40.dp,
                        padding: EdgeInsets.symmetric(horizontal: 14.dp),
                        decoration: ShapeDecoration(
                          shape: const StadiumBorder(),
                          color: state.index.value == index
                              ? GGColors.gameTabBarActiveColor.color
                              : null,
                        ),
                        alignment: Alignment.center,
                        child: Row(
                          children: [
                            GamingGameLabelIcon(
                              iconName: state.hallTab[index].icon ?? '',
                              size: 14.dp,
                            ),
                            SizedBox(width: 3.5.dp),
                            Text(
                              state.hallTab[index].labelName ?? '',
                              style: GGTextStyle(
                                fontSize: GGFontSize.content,
                                color: GGColors.textMain.color,
                              ),
                            ),
                          ],
                        ),
                      )),
                ),
              ),
            );
          }),
        ),
      ),
    );
  }
}
