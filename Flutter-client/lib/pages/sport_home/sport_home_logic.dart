import 'package:base_framework/src.widget/render_view/render_view.dart';
import 'package:gogaming_app/controller_header.dart';

import '../../common/api/banner/banner_api.dart';
import '../../common/api/banner/models/gaming_banner_model.dart';
import '../../common/api/game/game_api.dart';
import '../../common/api/game/models/gaming_game/list_by_label_model.dart';
import '../../common/api/game/models/gaming_game_scenes_model.dart';
import '../../common/service/game_service.dart';
import '../../common/service/gaming_tag_service/gaming_tag_service.dart';
import '../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../../helper/url_scheme_util.dart';
import 'sport_home_state.dart';

class SportHomeLogic extends BaseController with RefreshControllerMixin {
  final SportHomeState state = SportHomeState();

  final GameScenseHeaderMenuModel? extra = GamingTagService
      .sharedInstance.scenseModel?.headerMenus
      ?.firstWhereOrNull((element) {
    return element.config?.assignAppUrl?.contains('/sport') ?? false;
  });

  @override
  LoadCallback? get onRefresh => (p1) {
        refreshCompleted(
          state: LoadState.loading,
        );
        Rx.combineLatestList([
          _loadBanner().doOnData((event) {
            state.banner.assignAll(event);
          }),
          GameService().loadProvider(),
          _loadGamesByLabelIds().doOnData((event) {
            state.data.value = event;
          }),
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

  Stream<List<GamingGameListByLabelModel>> _loadGamesByLabelIds() {
    return GamingTagService.sharedInstance
        .getScenseInfo(force: true)
        .flatMap((value) {
      List<int> labelIds =
          GamingTagService.sharedInstance.scenseModel?.headerMenus
                  ?.firstWhereOrNull((element) {
                    return element.config?.assignUrl?.contains('sports') ??
                        false;
                  })
                  ?.infoVerticallyList
                  ?.map((e) {
                    return e.labelId ?? 0;
                  })
                  .toList() ??
              [];
      return PGSpi(Game.getScenesGameListByLabelIds.toTarget(input: {
        'ids': labelIds,
      })).rxRequest<List<GamingGameListByLabelIds>>((value) {
        return (value['data'] as List)
            .map((e) =>
                GamingGameListByLabelIds.fromJson(e as Map<String, dynamic>))
            .toList();
      }).flatMap((value) {
        final List<GamingGameListByLabelModel> games =
            GamingTagService.sharedInstance.scenseModel?.headerMenus
                    ?.firstWhereOrNull((element) {
                      return element.config?.assignUrl?.contains('sports') ??
                          false;
                    })
                    ?.infoVerticallyList
                    ?.map((element) {
                      final gameLists = value.data
                              .firstWhereOrNull(
                                  (p0) => p0.labelId == element.labelId)
                              ?.gameLists ??
                          [];
                      return GamingGameListByLabelModel.fromScenseModel(
                        element,
                        gameLists,
                      );
                    })
                    .toList() ??
                [];
        return Stream.value(games);
      });
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
