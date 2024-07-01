import 'package:flutter/material.dart' hide RefreshIndicator;
import 'package:gogaming_app/common/delegate/base_refresh_view_delegate.dart';
import 'package:gogaming_app/common/widgets/game_provider_view.dart';
import 'package:gogaming_app/common/widgets/gaming_banner.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/pages/game_stats/game_stats_logic.dart';
import 'package:gogaming_app/pages/home/home_logic.dart';
import 'package:gogaming_app/pages/home/views/home_hot_match_view.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:visibility_detector/visibility_detector.dart';

import '../../R.dart';
import '../../common/service/merchant_service/merchant_service.dart';
import '../../common/tracker/analytics_manager.dart';
import '../../common/widgets/gaming_game_image.dart';
import '../game_stats/game_stats_view.dart';
import 'views/home_footer.dart';
import 'views/home_swiper.dart';

class HomePage extends StatelessWidget with BaseRefreshViewDelegate {
  const HomePage({super.key});

  HomeLogic get logic => Get.find<HomeLogic>();

  @override
  RefreshViewController get renderController => logic.controller;

  @override
  RefreshIndicator getHeaderWidget(BuildContext context) {
    return CustomHeader(
      height: 48.dp,
      builder: (context, mode) {
        return Container(
          alignment: Alignment.center,
          height: 38.dp,
          child: const GoGamingLoading(),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    Get.put(HomeLogic());
    // 防止请求后再加载的视图被别的页面route绑定 提前绑定controoler
    Get.put(GameStatsLogic(gameCategory: null));
    return Scaffold(
      backgroundColor: GGColors.background.color,
      resizeToAvoidBottomInset: false,
      body: VisibilityDetector(
        key: const Key('HomePage'),
        onVisibilityChanged: (visibilityInfo) {
          if (visibilityInfo.visibleFraction == 1) {
            GamingDataCollection.sharedInstance
                .submitDataPoint(TrackEvent.visitMainPage);
            AnalyticsManager.logEvent(name: 'home_visit');

            GamingDataCollection.sharedInstance
                .startTimeEvent(TrackEvent.productVisitTime);
          } else if (visibilityInfo.visibleFraction == 0) {
            Map<String, dynamic> dataMap2 = {"actionvalue2": 0};
            GamingDataCollection.sharedInstance.submitDataPoint(
                TrackEvent.productVisitTime,
                dataMap: dataMap2);
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
                controller: logic,
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      Gaps.vGap10,
                      Obx(() {
                        return GamingBanner(
                          banner: logic.state.banner,
                        );
                      }),
                      _buildHotMatch(),
                      _buildGames(),
                      // const HomeOriginGaming(),
                      const GameStatsView(),
                      Gaps.vGap32,
                      const HomeFooter(),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBack() {
    if (MerchantService
            .sharedInstance.merchantConfigModel?.config?.isEuropeanCup ==
        true) {
      return Obx(() {
        return Visibility(
          visible: logic.state.loadSuccess.value,
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

  int get insertIndex {
    if (logic.state.game.isEmpty) {
      return 0;
    } else if (logic.state.game.length < 2) {
      return 1;
    }
    return 2;
  }

  Widget _buildHotMatch() {
    return Obx(
      () {
        if (logic.state.match.isNotEmpty) {
          return HomeSwiper(
            iconName: R.homeHotMatch,
            title: localized('pop_eve'),
            total: logic.state.match.length,
            mainAxisCount: 1,
            crossAxisCount: 1,
            needRefresh: true,
            aspectRatio: 0.3989,
            builder: (context, index) {
              return HomeHotMatchView(
                hotMatchModel: logic.state.match[index],
                index: index,
              );
            },
          );
        }
        return Container();
      },
    );
  }

  Widget _buildGames() {
    return Obx(
      () {
        return Column(
          children: logic.state.game.map<Widget>((e) {
            return HomeSwiper(
              iconName: e.icon,
              title: e.labelName ?? '',
              total: e.gameLists.length,
              mainAxisCount: 3,
              crossAxisCount: e.multiLine,
              onPressedTitle: () => logic.openGameList(e),
              builder: (context, index) {
                return GamingGameImage(
                  radius: 4.dp,
                  data: e.gameLists[index],
                );
              },
            );
          }).toList()
            ..insert(insertIndex, const GameProviderView()),
        );
      },
    );
  }
}
