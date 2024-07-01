import 'dart:async';

import 'package:gogaming_app/common/api/banner/banner_api.dart';
import 'package:gogaming_app/common/api/banner/models/gaming_banner_model.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/footer/footer_api.dart';
import 'package:gogaming_app/common/api/footer/models/footer_license_model.dart';
import 'package:gogaming_app/common/api/footer/models/footer_menu_list_model.dart';
import 'package:gogaming_app/common/api/footer/models/footer_model.dart';
import 'package:gogaming_app/common/api/footer/models/footer_response_data_model.dart';
import 'package:gogaming_app/common/api/game/game_api.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/list_by_label_model.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game_provider_model.dart';
import 'package:gogaming_app/common/service/game_service.dart';
import 'package:gogaming_app/config/global_setting.dart';
import 'package:gogaming_app/helper/url_scheme_util.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../common/api/base/go_gaming_service.dart';
import '../../common/api/game/models/gaming_game_scenes_model.dart';
import '../../common/api/game/models/gaming_hot_match.dart';
import '../../common/service/gaming_tag_service/gaming_tag_service.dart';
import '../../common/widgets/gg_dialog/go_gaming_toast.dart';

part 'home_state.dart';

class HomeLogic extends GetxController with RefreshControllerMixin {
  final state = HomeState();
  Timer? timer;

  void _startTimer() {
    timer = Timer.periodic(const Duration(seconds: 30), (t) {
      _loadHotMatch().doOnData((event) {
        state._match.value = event;
      }).listen((event) {});
      t.cancel();
    });
  }

  @override
  LoadCallback? get onRefresh => (p) {
        GlobalSetting.sharedInstance.isRiskClose.value = false;

        refreshCompleted(
          state: LoadState.loading,
        );
        Rx.combineLatestList([
          _loadBanner().doOnData((event) {
            state._banner.assignAll(event);
          }),
          _loadProvider(),
          _loadFooter().doOnData((event) {
            state._footer.value = event.footer ?? [];
            state._footerLicense.value = event.license ?? [];
          }),
          _loadGame().doOnData((event) {
            state._game.value = event;
          }),
          _loadHotMatch().doOnData((event) {
            state._match.value = event;
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
            state: LoadState.successful,
            hasMoreData: false,
          );
        });
      };

  Stream<List<GamingGameListByLabelModel>> _loadGame() {
    return GamingTagService.sharedInstance.getScenseInfo().flatMap((value) {
      return _loadGamesByLabelIds(value);
    });
  }

  Stream<List<GamingGameListByLabelModel>> _loadGamesByLabelIds(
      GameScenseModel scenseModel) {
    List<int> labelIds =
        scenseModel.headerMenus?.first.infoVerticallyList?.map((e) {
              return e.labelId ?? 0;
            }).toList() ??
            [];
    return PGSpi(Game.getScenesGameListByLabelIds.toTarget(input: {
      'ids': labelIds,
    })).rxRequest<List<GamingGameListByLabelIds>>((value) {
      return (value['data'] as List)
          .map((e) =>
              GamingGameListByLabelIds.fromJson(e as Map<String, dynamic>))
          .toList();
    }).flatMap((value) {
      final homeModel =
          GamingTagService.sharedInstance.scenseModel?.headerMenus?.first;
      final List<GamingGameListByLabelModel> games =
          homeModel?.infoVerticallyList?.map((element) {
                return GamingGameListByLabelModel(
                  labelCode: element.labelCode ?? '',
                  labelName: element.labelName ?? '',
                  icon: element.icon,
                  image: element.image,
                  menuIcon: element.menuIcon,
                  gameLists: value.data
                          .firstWhereOrNull(
                              (p0) => p0.labelId == element.labelId)
                          ?.gameLists ??
                      [],
                  gameCount: element.gameCount ?? 0,
                  redirectMethod: element.redirectMethod,
                  assignAppUrl: element.config?.assignAppUrl ?? '',
                  multiLine: element.multiLine ?? 1,
                );
              }).toList() ??
              [];
      return Stream.value(games);
    });
  }

  Stream<List<GamingBannerModel>> _loadBanner() {
    return PGSpi(Banner.getBanner.toTarget(input: {
      'BannerPageType': BannerType.front.value,
      'ClientType': 'App',
    })).rxRequest<List<GamingBannerModel>>((value) {
      return (value['data'] as List)
          .map((e) => GamingBannerModel.fromJson(e as Map<String, dynamic>))
          .toList();
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  Stream<List<GamingGameHotMatchModel>> _loadHotMatch() {
    return PGSpi(Game.getHotMatch.toTarget(input: {
      'matchCount': 10,
      'lang': GoGamingService.sharedInstance.apiLang,
    })).rxRequest<List<GamingGameHotMatchModel>>((value) {
      if (value['data'] is List) {
        return (value['data'] as List)
            .map((e) =>
                GamingGameHotMatchModel.fromJson(e as Map<String, dynamic>))
            .toList();
      } else {
        return [];
      }
    }).flatMap((value) {
      return Stream.value(value.data);
    }).doOnDone(() {
      _startTimer();
    });
  }

  Stream<List<GamingGameProviderModel>> _loadProvider() {
    return GameService().loadProvider();
  }

  Stream<FooterResponseDataModel> _loadFooter() {
    return PGSpi(Footer.getFooter.toTarget(input: {
      'ClientType': 'App',
    })).rxRequest<FooterResponseDataModel>((value) {
      return FooterResponseDataModel.fromJson(
          value['data'] as Map<String, dynamic>);
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  void toggleExpand(String type) {
    if (state.activeExpanded == type) {
      state._activeExpanded.value = null;
    } else {
      state._activeExpanded.value = type;
    }
  }

  void openGameList(GamingGameListByLabelModel? model) {
    if (model == null) {
      return;
    }
    final item = GamingTagService
        .sharedInstance.scenseModel?.headerMenus?.first.infoVerticallyList
        ?.firstWhereOrNull((element) {
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
