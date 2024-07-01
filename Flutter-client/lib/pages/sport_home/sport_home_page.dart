import 'dart:math';

import 'package:flutter/material.dart';
import 'package:gogaming_app/pages/sport_home/sport_home_state.dart';
import 'package:gogaming_app/pages/sport_home/views/list_game_logic.dart';
import 'package:gogaming_app/pages/sport_home/views/list_game_view.dart';

import 'package:gogaming_app/widget_header.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:visibility_detector/visibility_detector.dart';
import '../../R.dart';
import '../../common/api/game/models/gaming_game/list_by_label_model.dart';
import '../../common/delegate/base_refresh_view_delegate.dart';
import '../../common/service/game_service.dart';
import '../../common/service/merchant_service/merchant_service.dart';
import '../../common/widgets/appbar/appbar.dart';
import '../../common/widgets/gaming_game_image.dart';
import '../../common/widgets/gaming_image/gaming_image.dart';
import '../../common/widgets/gaming_sport_banner.dart';
import '../game_stats/game_stats_view.dart';
import '../home/views/home_footer.dart';
import '../home/views/home_swiper.dart';
import 'sport_home_logic.dart';

class SportHomePage extends BaseView<SportHomeLogic>
    with BaseRefreshViewDelegate {
  const SportHomePage({Key? key}) : super(key: key);

  SportHomeState get state => controller.state;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () =>
          SportHomePage.argument(Get.arguments as Map<String, dynamic>?),
    );
  }

  factory SportHomePage.argument(Map<String, dynamic>? arguments) {
    return const SportHomePage();
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.userAppbar();
  }

  @override
  RefreshViewController get renderController => controller.controller;

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  bool resizeToAvoidBottomInset() => false;

  @override
  Widget body(BuildContext context) {
    Get.put(SportHomeLogic());
    return VisibilityDetector(
      key: const Key('SportHomePage'),
      onVisibilityChanged: (visibilityInfo) {
        if (visibilityInfo.visibleFraction == 1) {
          state.visible.value = true;
        } else if (visibilityInfo.visibleFraction == 0) {
          state.visible.value = false;
        }
      },
      child: Stack(
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
                      if (state.banner.isNotEmpty) {
                        return GamingSportBanner(
                          banner: state.banner,
                        );
                      }
                      return Container();
                    }),
                    _buildHandicapWidget(),
                    _buildGames(),
                    Gaps.vGap20,
                    const GameStatsView(),
                    Gaps.vGap22,
                    const HomeFooter(),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGames() {
    return Obx(() {
      return Column(
        children: state.data.map((e) {
          return _buildGame(e);
        }).toList(),
      );
    });
  }

  Widget _buildHandicapWidget() {
    return Obx(() {
      if (state.visible.value) {
        final provider = GameService()
            .provider
            .firstWhereOrNull((element) => element.showHome == true);
        if (provider != null) {
          return Padding(
            padding: EdgeInsets.only(left: 12.dp, right: 12.dp, top: 20.dp),
            child: SizedBox(
              height: Get.height * 2 / 3,
              child: ListGameWidget(
                provider: provider,
              ),
            ),
          );
        }
      }
      Get.delete<ListGameLogic>();
      return Container();
    });
  }

  Widget _buildGame(GamingGameListByLabelModel label) {
    if (label.gameLists.isEmpty) {
      return Gaps.empty;
    }
    return Container(
      margin: EdgeInsets.only(top: 30.dp),
      child: HomeSwiper(
        iconName: label.icon,
        title: label.labelName ?? '',
        total: min(label.gameLists.length, 24),
        onPressedTitle: () => controller.openGameList(label),
        mainAxisCount: 3,
        crossAxisCount: label.multiLine,
        builder: (context, index) {
          return GamingGameImage(
            radius: 4.dp,
            data: label.gameLists[index],
          );
        },
      ),
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
}
