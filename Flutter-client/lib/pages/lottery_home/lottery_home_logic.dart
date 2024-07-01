import 'package:flutter/material.dart' hide Banner;
import 'package:gogaming_app/common/api/banner/banner_api.dart';
import 'package:gogaming_app/common/api/banner/models/gaming_banner_model.dart';
import 'package:gogaming_app/common/api/game/game_api.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/list_by_label_model.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../common/api/game/models/gaming_game_scenes_model.dart';
import '../../common/service/gaming_tag_service/gaming_tag_service.dart';
import '../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../../helper/url_scheme_util.dart';

part 'lottery_home_state.dart';

class LotteryHomeLogic extends BaseController
    with RefreshControllerMixin, GetTickerProviderStateMixin {
  final LotteryHomeState state = LotteryHomeState();

  final GameScenseHeaderMenuModel? extra = GamingTagService
      .sharedInstance.scenseModel?.headerMenus
      ?.firstWhereOrNull((element) {
    return element.config?.assignAppUrl?.contains('/lottery') ?? false;
  });

  @override
  void onInit() {
    super.onInit();
    beginTracker();
    _configScenseData();
    _initTabController(state.hallTab.length);
    ever<List<GamingGameListByLabelModel>>(state._hallTab, (value) {
      _initTabController(state.hallTab.length);
    });
  }

  void _configScenseData() {
    if (extra == null) {
      return;
    }

    state._hallTab.value = extra?.infoHorizontalList?.map((element) {
          return GamingGameListByLabelModel(
            labelCode: element.labelCode ?? '',
            labelName: element.labelName ?? '',
            icon: element.icon,
            image: element.image,
            menuIcon: element.menuIcon,
            // gameLists: element.gameList ?? [],
            gameCount: element.gameCount ?? 0,
          );
        }).toList() ??
        [];

    state._hall.value = extra?.infoVerticallyList?.map((element) {
          return GamingGameListByLabelModel(
            labelCode: element.labelCode ?? '',
            labelName: element.labelName ?? '',
            icon: element.icon,
            image: element.image,
            menuIcon: element.menuIcon,
            // gameLists: element.gameList ?? [],
            gameCount: element.gameCount ?? 0,
          );
        }).toList() ??
        [];
  }

  @override
  void onClose() {
    // 上报彩票也浏览时间
    // 进入首页浏览埋点
    Map<String, dynamic> dataMap = {"actionvalue2": 1};
    GamingDataCollection.sharedInstance
        .submitDataPoint(TrackEvent.productVisitTime, dataMap: dataMap);

    super.onClose();
  }

  void beginTracker() {
    // 进入首页浏览埋点
    Map<String, dynamic> dataMap = {"actionvalue1": 1};
    GamingDataCollection.sharedInstance
        .submitDataPoint(TrackEvent.visitProductMainPage, dataMap: dataMap);

    // 开始埋点计时 进入彩票的时间
    GamingDataCollection.sharedInstance
        .startTimeEvent(TrackEvent.productVisitTime);
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
      'BannerPageType': BannerType.lottery.value,
      'ClientType': 'App',
    })).rxRequest<List<GamingBannerModel>>((value) {
      return (value['data'] as List)
          .map((e) => GamingBannerModel.fromJson(e as Map<String, dynamic>))
          .toList();
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  Stream<void> _loadGames() {
    if (extra == null) {
      return _loadGameByLabel().doOnData((event) {
        state._hall.value = event;
        state._hallTab.value = event;
      });
    }
    return _loadGamesByLabelIds().doOnData((event) {
      state._hallTab.value = extra?.infoHorizontalList?.map((element) {
            return GamingGameListByLabelModel(
              labelCode: element.labelCode ?? '',
              labelName: element.labelName ?? '',
              icon: element.icon,
              image: element.image,
              menuIcon: element.menuIcon,
              gameLists: event
                      .firstWhereOrNull((p0) => p0.labelId == element.labelId)
                      ?.gameLists ??
                  [],
              gameCount: element.gameCount ?? 0,
              redirectMethod: element.redirectMethod,
              assignAppUrl: element.config?.assignAppUrl ?? '',
              multiLine: element.multiLine ?? 1,
            );
          }).toList() ??
          [];

      state._hall.value = extra?.infoVerticallyList?.map((element) {
            return GamingGameListByLabelModel(
              labelCode: element.labelCode ?? '',
              labelName: element.labelName ?? '',
              icon: element.icon,
              image: element.image,
              menuIcon: element.menuIcon,
              gameLists: event
                      .firstWhereOrNull((p0) => p0.labelId == element.labelId)
                      ?.gameLists ??
                  [],
              gameCount: element.gameCount ?? 0,
              redirectMethod: element.redirectMethod,
              assignAppUrl: element.config?.assignAppUrl ?? '',
              multiLine: element.multiLine ?? 1,
            );
          }).toList() ??
          [];
    });
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

  Stream<List<GamingGameListByLabelModel>> _loadGameByLabel() {
    Map<String, dynamic> req = {
      'labelCodes': Config.sharedInstance.gameConfig.lotteryList
          .map((e) => e.labelCode)
          .toList(),
      'gameCount': 50,
      'entryType': 2,
      'isHill': true,
    };

    return PGSpi(Game.getGameListByLabel.toTarget(
      inputData: req,
    )).rxRequest<List<GamingGameListByLabelModel>>((value) {
      final list = (value['data'] as List)
          .map((e) =>
              GamingGameListByLabelModel.fromJson(e as Map<String, dynamic>))
          .toList();

      return list;
    }).flatMap((value) {
      return Stream.value(
          value.data..removeWhere((element) => element.labelName == null));
    });
  }

  void openGameList(GamingGameListByLabelModel? model) {
    if (model == null) {
      return;
    }
    final item = extra?.infoVerticallyList?.firstWhereOrNull((element) {
      return element.labelCode == model.labelCode;
    });
    if (model.redirectMethod == GameLabelRedirectMethod.labelPage.value) {
      Get.toNamed<dynamic>(Routes.gameList.route, arguments: {
        'labelId': model.labelCode,
        'type': GameSortType.label,
      });
    } else if (model.redirectMethod ==
        GameLabelRedirectMethod.assignProvider.value) {
      Get.toNamed<dynamic>(Routes.providerGameList.route, arguments: {
        "providerId": item?.config?.assignProviderId,
      });
    } else if (model.redirectMethod ==
        GameLabelRedirectMethod.assignGame.value) {
      Get.toNamed<dynamic>(Routes.gamePlayReady.route, arguments: {
        "providerId": item?.config?.assignGameProviderId,
        'gameId': item?.config?.assignGameCode,
      });
    } else {
      UrlSchemeUtil.navigateTo(model.assignAppUrl);
    }
  }
}
