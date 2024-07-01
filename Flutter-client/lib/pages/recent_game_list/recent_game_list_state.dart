import '../../common/api/base/base_api.dart';
import '../../common/api/game/models/gaming_game/game_model.dart';

class RecentGameListState {
  final RxList<GamingGameModel> games = <GamingGameModel>[].obs;
  final RxInt gamesTotal = 0.obs;

  final RxBool isLoading = false.obs;
}
