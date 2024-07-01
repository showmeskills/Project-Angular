import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/game_service.dart';
import 'package:gogaming_app/controller_header.dart';

import '../../common/api/game/models/gaming_game/game_model.dart';
import '../../common/api/game/models/gaming_game_provider_model.dart';
import 'package:gogaming_app/common/api/game/game_api.dart';
import '../../common/api/game/models/gaming_game_sort_model.dart';
import '../../common/widgets/gg_dialog/go_gaming_toast.dart';
import 'gg_game_list_state.dart';

class GGGameListLogic extends BaseController {
  GGGameListLogic({this.type});

  final GGGameListState state = GGGameListState();

  late String labelId;
  final GameSortType? type;
  var _currentPageIndex = 1;

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
      _loadOptionalProviders().doOnData((event) {
        state.optionalProvider.assignAll(event);
      }),
      GameService.sharedInstance.loadSortItems()
    ]).listen((event) {
      state.isLoading.value = false;
    }).onError((Object err) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
      state.isLoading.value = false;
    });
    super.onReady();
  }

  Stream<List<GamingGameProviderModel>> _loadOptionalProviders() {
    return PGSpi(Game.getProviderByLabel.toTarget(inputData: {
      "labelCodes": [labelId]
    })).rxRequest<List<GamingGameProviderModel>>((value) {
      return (value['data'] as List)
          .map((e) =>
              GamingGameProviderModel.fromJson(e as Map<String, dynamic>))
          .toList();
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  Stream<List<GamingGameModel>> _loadGames() {
    GamingSortSelectModel? sort = state.sortSelects.firstWhereOrNull(
        (element) => element.description == state.selectSortDescription.value);
    Map<String, dynamic> req = {
      'labelCode': [labelId],
      'pageIndex': _currentPageIndex,
      'pageSize': 24,
    };

    if (state.selectProviderIds.isNotEmpty) {
      req['providerCatIds'] = state.selectProviderIds.toList();
    }

    if (sort?.code?.isNotEmpty ?? false) {
      req['sort'] = sort!.code;
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
}
