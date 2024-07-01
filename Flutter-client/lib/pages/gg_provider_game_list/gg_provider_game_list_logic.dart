import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/controller_header.dart';

import '../../common/api/game/models/gaming_game/game_label_provider_model.dart';
import '../../common/api/game/models/gaming_game/game_model.dart';
import '../../common/api/game/models/gaming_game_sort_model.dart';
import '../../common/lang/locale_lang.dart';
import 'package:gogaming_app/common/api/game/game_api.dart';
import '../../common/service/game_service.dart';
import '../../common/widgets/gg_dialog/go_gaming_toast.dart';
import 'gg_provider_game_list_state.dart';

class GGProviderGameListLogic extends BaseController {
  GGProviderGameListLogic({this.type});
  final GGProviderGameListState state = GGProviderGameListState();

  late String providerId;
  var _currentPageIndex = 1;
  final GameSortType? type;

  int get currentPageIndex => _currentPageIndex;

  @override
  void onInit() {
    state.sortSelects.addAll(GameService.sharedInstance.sortItems);
    state.sortSelects.insert(
      0,
      GamingSortSelectModel(
        description: localized("popular"),
        code: 'Hot',
      ),
    );
    if (!AccountService.sharedInstance.isLogin) {
      state.sortSelects
          .removeWhere((element) => element.code == 'RecommendSort');
    }
    super.onInit();
  }

  @override
  void onReady() {
    state.isLoading.value = true;
    Rx.combineLatestList([
      _loadGames().doOnData((event) {
        _currentPageIndex += 1;
        state.games.assignAll(event);
      }),
      _loadGamesProvider().doOnData((event) {
        state.optionalProviders.assignAll(event);
      }),
      GameService.sharedInstance.loadSortItems(),
    ]).listen((event) {
      state.isLoading.value = false;
    }).onError((Object err) {
      state.isLoading.value = false;
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    });
  }

  void selectProvider() {
    _currentPageIndex = 1;
    showLoading();
    _loadGames().listen((event) {
      hideLoading();
      _currentPageIndex += 1;
      state.games.assignAll(event);
    }).onError((err) {
      hideLoading();
    });
  }

  Stream<List<GameLabelProviderModel>> _loadGamesProvider() {
    Map<String, dynamic> req = {
      'providerCatId': providerId,
    };
    return PGSpi(Game.getLabelByProviderId.toTarget(input: req))
        .rxRequest<List<GameLabelProviderModel>>((value) {
      return (value['data'] as List?)
              ?.map((e) =>
                  GameLabelProviderModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [];
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  Stream<List<GamingGameModel>> _loadGames() {
    GamingSortSelectModel? sort = state.sortSelects.firstWhereOrNull(
        (element) => element.description == state.selectSortDescription.value);
    Map<String, dynamic> req = {
      'providerCatIds': [providerId],
      'pageIndex': _currentPageIndex,
      'pageSize': 24,
    };

    if (sort?.code?.isNotEmpty ?? false) {
      req['sort'] = sort!.code;
    }

    if (state.selectProviderIds.isNotEmpty) {
      req['labelCode'] = state.selectProviderIds.toList();
    }

    if (type != null) {
      req['sortType'] = type?.value;
    }

    return PGSpi(Game.getGameListByProvider.toTarget(inputData: req))
        .rxRequest<List<GamingGameModel>>((value) {
      state.gamesTotal.value = value['data']['total'] as int;
      return (value['data']['list'] as List)
          .map((e) => GamingGameModel.fromJson(e as Map<String, dynamic>))
          .toList();
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  void loadMoreGame() {
    _loadGames().listen((event) {
      _currentPageIndex += 1;
      state.games.addAll(event);
    });
  }

  void changeSort(String? description) {
    state.selectSortDescription.value = description ?? '';
    _currentPageIndex = 1;
    showLoading();
    _loadGames().listen((event) {
      hideLoading();
      _currentPageIndex += 1;
      state.games.assignAll(event);
    }).onError((err) {
      hideLoading();
    });
  }
}
