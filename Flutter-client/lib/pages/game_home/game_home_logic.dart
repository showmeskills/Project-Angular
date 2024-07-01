import 'package:flutter/material.dart' hide Banner;
import 'package:gogaming_app/common/api/banner/banner_api.dart';
import 'package:gogaming_app/common/api/banner/models/gaming_banner_model.dart';
import 'package:gogaming_app/common/api/game/game_api.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/list_by_label_model.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game_provider_model.dart';
import 'package:gogaming_app/common/service/game_service.dart';
import 'package:gogaming_app/common/service/gaming_tag_service/gaming_tag_service.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/helper/url_scheme_util.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../common/api/game/models/gaming_game_scenes_model.dart';
import '../../common/tracker/analytics_manager.dart';
import '../../common/widgets/gg_dialog/go_gaming_toast.dart';

part 'game_home_state.dart';

class GameHomeLogic extends BaseController
    with RefreshControllerMixin, GetTickerProviderStateMixin {
  final state = GameHomeState();

  final GameScenseHeaderMenuModel? extra = GamingTagService
      .sharedInstance.scenseModel?.headerMenus
      ?.firstWhereOrNull((element) {
    return element.config?.assignAppUrl?.contains('/casino') ?? false;
  });

  @override
  void onInit() {
    super.onInit();

    beginTracker();
    _initTabController(state.hallTab.length);
    ever<List<GamingGameListByLabelModel>>(state._hallTab, (value) {
      _initTabController(state.hallTab.length);
    });
  }

  @override
  void onClose() {
    Map<String, dynamic> dataMap = {"actionvalue2": 2};
    GamingDataCollection.sharedInstance
        .submitDataPoint(TrackEvent.productVisitTime, dataMap: dataMap);

    super.onClose();
  }

  void beginTracker() {
    Map<String, dynamic> dataMap = {"actionvalue1": 2};
    GamingDataCollection.sharedInstance
        .submitDataPoint(TrackEvent.visitProductMainPage, dataMap: dataMap);

    // 开始埋点计时 进入娱乐场的时间
    GamingDataCollection.sharedInstance
        .startTimeEvent(TrackEvent.productVisitTime);
    AnalyticsManager.logEvent(name: 'casino_visit');
  }

  void _initTabController(int length) {
    state.tabController = TabController(
      initialIndex: state.index.value,
      length: length,
      vsync: this,
    )..addListener(() {
        state.index.value = state.tabController.index;
      });
  }

  @override
  LoadCallback? get onRefresh => (p1) {
        refreshCompleted(
          state: LoadState.loading,
        );
        Rx.combineLatestList([
          _loadBanner().doOnData((event) {
            state._banner.assignAll(event);
          }),
          GameService().loadProvider(),
          _loadGames(),
        ]).listen((event) {
          state.loadSuccess.value = true;
          refreshCompleted(
            state: LoadState.successful,
            hasMoreData: false,
          );
        }).onError((Object err) {
          if (err is GoGamingResponse) {
            Toast.showFailed(err.message);
          } else {
            Toast.showTryLater();
          }
          refreshCompleted(
            state: LoadState.failed,
            hasMoreData: false,
          );
        });
      };

  Stream<List<GamingBannerModel>> _loadBanner() {
    return PGSpi(Banner.getBanner.toTarget(input: {
      'BannerPageType': BannerType.games.value,
      'ClientType': 'App',
    })).rxRequest<List<GamingBannerModel>>((value) {
      return (value['data'] as List)
          .map((e) => GamingBannerModel.fromJson(e as Map<String, dynamic>))
          .toList();
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  Stream<List<GamingGameListByLabelModel>> _loadLabel({
    required GameLabelType type,
    int count = 24,
  }) {
    return PGSpi(Game.getLabelAndGameListByScenes.toTarget(inputData: {
      'gameCount': count,
      'scenesType': type.value,
    })).rxRequest<List<GamingGameListByLabelModel>>((value) {
      return (value['data'] as List)
          .map((e) =>
              GamingGameListByLabelModel.fromJson(e as Map<String, dynamic>))
          .toList();
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  Stream<void> _loadGames() {
    if (extra == null) {
      return Rx.combineLatestList([
        _loadLabel(
          type: GameLabelType.hall,
        ).doOnData((event) {
          state._hall.value = event;
        }),
        _loadLabel(
          type: GameLabelType.hallBar,
          count: 25,
        ).doOnData((event) {
          state._hallTab.value = event;
        }),
      ]);
    } else {
      return _loadGamesByLabelIds().doOnData((event) {
        state._hallTab.value = extra?.infoHorizontalList?.map((element) {
              final gameLists = event
                      .firstWhereOrNull((p0) => p0.labelId == element.labelId)
                      ?.gameLists ??
                  [];
              return GamingGameListByLabelModel.fromScenseModel(
                  element, gameLists);
            }).toList() ??
            [];

        state._hall.value = extra?.infoVerticallyList?.map((element) {
              final gameLists = event
                      .firstWhereOrNull((p0) => p0.labelId == element.labelId)
                      ?.gameLists ??
                  [];
              return GamingGameListByLabelModel.fromScenseModel(
                  element, gameLists);
            }).toList() ??
            [];
      });
    }
  }

  Stream<List<GamingGameListByLabelIds>> _loadGamesByLabelIds() {
    List<int> labelIds = extra?.infoVerticallyList?.map((e) {
          return e.labelId ?? 0;
        }).toList() ??
        [];
    labelIds.addAll(extra?.infoHorizontalList?.map((e) {
          return e.labelId ?? 0;
        }).toList() ??
        []);
    return PGSpi(Game.getScenesGameListByLabelIds.toTarget(input: {
      'ids': labelIds,
    })).rxRequest<List<GamingGameListByLabelIds>>((value) {
      return (value['data'] as List)
          .map((e) =>
              GamingGameListByLabelIds.fromJson(e as Map<String, dynamic>))
          .toList();
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  void openGameList(GamingGameListByLabelModel? model) {
    if (model == null) {
      return;
    }
    if (model.redirectMethod == GameLabelRedirectMethod.labelPage.value) {
      Get.toNamed<dynamic>(Routes.gameList.route, arguments: {
        'labelId': model.labelCode,
        'type': GameSortType.label,
      });
    } else if (model.redirectMethod ==
        GameLabelRedirectMethod.assignProvider.value) {
      Get.toNamed<dynamic>(Routes.providerGameList.route, arguments: {
        "providerId": model.assignProviderId,
      });
    } else if (model.redirectMethod ==
        GameLabelRedirectMethod.assignGame.value) {
      Get.toNamed<dynamic>(Routes.gamePlayReady.route, arguments: {
        "providerId": model.assignGameProviderId,
        'gameId': model.assignGameCode,
      });
    } else {
      UrlSchemeUtil.navigateTo(model.assignAppUrl);
    }
  }
}
