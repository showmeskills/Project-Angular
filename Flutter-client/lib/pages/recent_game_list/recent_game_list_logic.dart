import 'package:gogaming_app/common/api/base/base_api.dart';

import '../../common/api/game/game_api.dart';
import '../../common/api/game/models/gaming_game/game_model.dart';
import '../../common/service/game_service.dart';
import '../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../base/base_controller.dart';
import 'recent_game_list_state.dart';

class RecentGameListLogic extends BaseController {
  final RecentGameListState state = RecentGameListState();

  var _currentPageIndex = 1;

  int get currentPageIndex => _currentPageIndex;

  @override
  void onReady() {
    state.isLoading.value = true;
    Rx.combineLatestList([
      _loadFavoriteGameList().doOnData((event) {
        _currentPageIndex += 1;
        state.games.assignAll(event);
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

  Stream<List<GamingGameModel>> _loadFavoriteGameList() {
    Map<String, dynamic> req = {
      'pageIndex': _currentPageIndex,
      'pageSize': 24,
    };

    return PGSpi(Game.getRecentlyPlayed.toTarget(input: req))
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
    _loadFavoriteGameList().listen((event) {
      _currentPageIndex += 1;
      state.games.addAll(event);
    });
  }
}
