import 'package:flutter/material.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:focus_detector/focus_detector.dart';
import 'package:gogaming_app/common/api/base/go_gaming_response.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/game_model.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/tag_model.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game_range_setting_model.dart';

import 'package:gogaming_app/common/service/game_service.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_game_image.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/home/views/home_swiper.dart';
import 'package:gogaming_app/pages/tournament/common/dialog/tournament_dialog_view.dart';
import 'package:gogaming_app/widget_header.dart';

import '../game_stats/game_stats_view.dart';
import '../main/main_logic.dart';
import 'game_detail_logic.dart';
import 'game_detail_state.dart';
import 'views/game_detail_des_view.dart';
import 'views/game_detail_header.dart';
import '../../common/widgets/game_provider_view.dart';

class GameDetailPage extends BaseView<GameDetailLogic> {
  const GameDetailPage({
    Key? key,
    required this.providerId,
    required this.gameId,
  }) : super(key: key);

  final String gameId;
  final String providerId;

  @override
  String? get tag => '$providerId-$gameId';

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () =>
          GameDetailPage.argument(Get.arguments as Map<String, dynamic>),
    );
  }

  factory GameDetailPage.argument(Map<String, dynamic> arguments) {
    final String gameId = arguments['gameId'] as String;
    final String providerId = arguments['providerId'] as String;

    return GameDetailPage(
      gameId: gameId,
      providerId: providerId,
    );
  }

  GameDetailState get state => Get.find<GameDetailLogic>(tag: tag).state;

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.userBottomAppbar(
      titleWidget: Obx(() {
        return Text(
          state.gameData.value.gameName ?? '',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: GGTextStyle(
            color: GGColors.textMain.color,
            fontSize: GGFontSize.bigTitle20,
            fontWeight: GGFontWeigh.bold,
          ),
        );
      }),
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(
      GameDetailLogic(
        gameId: gameId,
        providerId: providerId,
      ),
      tag: tag,
    );

    return FocusDetector(
      onVisibilityGained: () {
        controller.checkNeedTransfer().listen((event) {}, onError: (Object e) {
          if (e is GoGamingResponse) {
            Toast.showFailed(e.message);
          } else {
            Toast.showTryLater();
          }
        });
      },
      onVisibilityLost: controller.viewDisappear,
      child: ListView(
        padding: EdgeInsetsDirectional.only(bottom: 12.dp),
        controller: controller.scrollController,
        children: [
          _inset(Obx(() {
            if (state.displayCurrency.value == null) {
              return Container();
            }
            return GameDetailHeader(
              data: state.gameData.value,
              displayCurrency: state.displayCurrency.value!,
              onPressDisplay: _onPressDisplayCurrency,
              onPressRangeSetting: _onPressRangeSetting,
              onPressRealMode: _onPressRealMode,
              onPressTryMode: _onPressTryMode,
              onPressGoBackHome: _onPressGoBackHome,
              isCollection: state.gameData.value.isFavorite == true,
              onPressCollection: _onPressCollection,
              onPressTournament: _onPressTournament,
              isLogin: state.isLogin.value,
              needTransfer: state.needTransfer,
              onPressTransfer: _onPressTransfer,
              currencyRatio: state.selectCurrencyRatio,
              tryLinkLoading: state.tryLinkLoading.value,
              realLinkLoading: state.realLinkLoading.value,
              curRange: state.curRange.value,
              showRangeSetting: controller.showRangeSetting(),
              gameInfoLoading: state.gameInfoLoading.value,
              showNoSupport: state.showNoSupport.value,
            );
          })),
          Gaps.vGap20,
          _inset(GameDetailDesView(
            tag: tag,
            state: state,
            onPressExpand: _onPressExpand,
            onPressTag: _onPressTag,
          )),
          _buildRecommend(),
          const GameProviderView(),
          Gaps.vGap24,
          Obx(
            () =>
                GameStatsView(gameCategory: state.gameData.value.gameCategory),
          ),
          Gaps.vGap22,
        ],
      ),
    );
  }

  Widget _inset(Widget child, {double? start, double? end}) {
    return Padding(
      padding: EdgeInsetsDirectional.only(
        start: start ?? 12.dp,
        end: end ?? 12.dp,
      ),
      child: child,
    );
  }

  Widget _buildRecommend() {
    return Obx(
      () {
        final recommendGame = state.recommendGame.value;
        final count = recommendGame.gameLists.length;
        if (recommendGame.labelName == null || count == 0) {
          return Gaps.empty;
        }
        return HomeSwiper(
          iconName: recommendGame.icon,
          title: recommendGame.labelName ?? '',
          total: count,
          mainAxisCount: 3,
          builder: (context, index) {
            final gameItem = recommendGame.gameLists[index];
            return GamingGameImage(
              radius: 4.dp,
              data: gameItem,
              onPress: () => _onPressGame(gameItem),
            );
          },
        );
      },
    );
  }
}

extension _Action on GameDetailPage {
  void _onPressTag(GamingGameTagModel tag) {
    final providerId = state.gameData.value.providerCatId;
    if (providerId != null) {
      Get.toNamed<dynamic>(Routes.gameList.route, arguments: {
        "labelId": tag.code,
        "title": tag.description,
      });
    }
  }

  void _onPressGame(GamingGameModel gameItem) {
    controller.setGame(gameItem);
    controller.scrollController.animateTo(0,
        duration: const Duration(milliseconds: 200), curve: Curves.linear);
  }

  void _onPressExpand() {
    controller.revertExpand();
  }

  void _onPressCurrency(String currency) {
    Get.back<dynamic>();
    controller.setDisplayCurrency(currency);
    controller.initBetRangeSetting();
  }

  void _onPressDisplayCurrency() {
    List<String> list = state.gameData.value.currencies;
    GamingSelector.simple<String>(
      title: localized('sel_display'),
      original: list,
      itemBuilder: (context, e, index) {
        return InkWell(
          onTap: () => _onPressCurrency(e),
          child: Row(
            children: [
              SizedBox(height: 40.dp),
              Gaps.hGap16,
              GamingImage.network(
                url: GameService().displayIconUrl(e),
                width: 24.dp,
                height: 24.dp,
              ),
              Gaps.hGap6,
              Text(
                GameService().displayCurrency(e),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _onPressRange(RangeSettingList range) {
    Get.back<dynamic>();
    controller.setRange(range);
  }

  void _onPressRangeSetting() {
    GamingSelector.simple<RangeSettingList>(
      title: localized('sel_range'),
      original: state.allRange,
      itemBuilder: (context, e, index) {
        return InkWell(
          onTap: () => _onPressRange(e),
          child: Row(
            children: [
              SizedBox(height: 40.dp),
              Gaps.hGap16,
              GamingImage.network(
                url: GameService()
                    .displayIconUrl(state.displayCurrency.value?.currency),
                width: 24.dp,
                height: 24.dp,
              ),
              Gaps.hGap6,
              Text(
                e.value,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _onPressTryMode() {
    controller.playGame(true);
  }

  void _onPressGoBackHome() {
    Get.until((route) => Get.currentRoute == Routes.main.route);
    Get.find<MainLogic>().changeSelectIndex(-1);
  }

  void _onPressRealMode() {
    controller.playGame(false);
  }

  void _onPressCollection() {
    if (state.gameData.value.isFavorite == false) {
      controller.addFavoriteGame();
    } else {
      controller.removeFavoriteGame();
    }
  }

  void _onPressTournament() {
    SmartDialog.show<void>(
      tag: 'game_tournament',
      builder: (context) {
        return TournamentDialogView(
          list: state.tournament,
          providerId: state.gameData.value.providerId!,
          category: state.gameData.value.category!,
          gameId: state.gameData.value.gameId!,
        );
      },
    );
  }

  void _onPressTransfer() {
    controller.goTransfer();
  }
}
