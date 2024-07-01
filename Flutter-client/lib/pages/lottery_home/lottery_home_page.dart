import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/delegate/base_refresh_view_delegate.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_banner.dart';
import 'package:gogaming_app/common/widgets/gaming_game_label_icon.dart';
import 'package:gogaming_app/config/game_config.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/game_stats/game_stats_view.dart';
import 'package:gogaming_app/pages/home/views/home_footer.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../common/service/merchant_service/merchant_service.dart';
import '../../common/widgets/gaming_image/gaming_image.dart';
import 'lottery_home_logic.dart';
import 'views/lottery_home_hall_view.dart';
import 'views/lottery_home_tab_view.dart';

class LotteryHomePage extends BaseView<LotteryHomeLogic>
    with BaseRefreshViewDelegate {
  const LotteryHomePage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () =>
          LotteryHomePage.argument(Get.arguments as Map<String, dynamic>?),
    );
  }

  factory LotteryHomePage.argument(Map<String, dynamic>? arguments) {
    return const LotteryHomePage();
  }

  LotteryHomeState get state => controller.state;

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
    Get.put(LotteryHomeLogic());
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
                  _buildGame(),
                  Gaps.vGap20,
                  _buildLabelBar(),
                  Obx(() {
                    if (state.index.value == 0) {
                      return const LotteryHomeHallView();
                    }
                    return LotteryHomeTabView(
                      label: state.currentLabel,
                    );
                  }),
                  Gaps.vGap20,
                  const GameStatsView(gameCategory: ['Lottery']),
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
      width: double.infinity,
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
                              localized(state.hallTab[index].labelName!),
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

  Widget _buildGame() {
    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(horizontal: 12.dp),
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _buildGameItem(
            icon: R.lotteryPMLottery,
            title: localized('ob_lottery'),
            onPressed: _onPressedPMLottery,
          ),
          Gaps.hGap6,
          _buildGameItem(
            icon: R.lotteryTCLottery,
            title: localized('tc_lottery'),
            onPressed: _onPressedTCLottery,
          ),
          Gaps.hGap6,
          _buildGameItem(
            icon: R.lotterySGLottery,
            title: localized('sg_lottery'),
            onPressed: _onPressedSGLottery,
          ),
          Gaps.hGap6,
          _buildGameItem(
            icon: R.lotteryVRLottery,
            title: localized('vr_lottery'),
            onPressed: _onPressedVRLottery,
          ),
          // Gaps.hGap6,
          // _buildGameItem(
          //   icon: R.lotteryGPILottery,
          //   title: localized('gpi_lottery'),
          //   onPressed: _onPressedGPIMLottery,
          // ),
        ],
      ),
    );
  }

  Widget _buildGameItem({
    required String icon,
    required String title,
    void Function()? onPressed,
  }) {
    return ScaleTap(
      onPressed: onPressed,
      child: Container(
        decoration: BoxDecoration(
          color: GGColors.homeFootBackground.color,
          borderRadius: BorderRadius.circular(6.dp),
        ),
        padding: EdgeInsets.symmetric(
          horizontal: 10.dp,
          vertical: 7.dp,
        ),
        height: 69.dp,
        child: Row(
          children: [
            Image.asset(
              icon,
              width: 46.dp,
              height: 46.dp,
            ),
            Gaps.hGap10,
            Column(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Text(
                  title,
                  style: GGTextStyle(
                    fontSize: GGFontSize.smallTitle,
                    color: GGColors.textSecond.color,
                    fontWeight: GGFontWeigh.bold,
                  ),
                ),
                Container(
                  decoration: ShapeDecoration(
                    shape: const StadiumBorder(),
                    color: GGColors.border.color,
                  ),
                  padding: EdgeInsets.symmetric(
                    horizontal: 10.dp,
                    vertical: 3.dp,
                  ),
                  child: Text(
                    localized('enter_game'),
                    style: GGTextStyle(
                      fontSize: GGFontSize.hint,
                      color: GGColors.textSecond.color,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

extension _Action on LotteryHomePage {
  void _onPressedPMLottery() {
    Get.offAndToNamed<void>(Routes.gamePlayReady.route, arguments: {
      'providerId': GameConfig.obLotteryProvider,
    });
  }

  void _onPressedTCLottery() {
    Get.offAndToNamed<void>(Routes.gamePlayReady.route, arguments: {
      'providerId': GameConfig.tcLotteryProvider,
    });
  }

  void _onPressedSGLottery() {
    Get.offAndToNamed<void>(Routes.gamePlayReady.route, arguments: {
      'providerId': GameConfig.sgLotteryProvider,
    });
  }

  void _onPressedVRLottery() {
    Get.offAndToNamed<void>(Routes.gamePlayReady.route, arguments: {
      'providerId': GameConfig.vrLotteryProvider,
    });
  }

  // void _onPressedGPIMLottery() {
  //   Get.toNamed<dynamic>(Routes.providerGameList.route, arguments: {
  //     'providerId': GameConfig.gpiProvider,
  //   });
  // }
}
