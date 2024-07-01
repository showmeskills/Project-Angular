import '../../common/api/base/base_api.dart';
import '../../common/api/game/models/gaming_game/game_model.dart';
import '../../common/api/game/models/gaming_game_provider_model.dart';
import '../../common/api/game/models/gaming_game_sort_model.dart';

class GGGameListState {
  /// 游戏标签列表页可选厂商
  final RxList<GamingGameProviderModel> optionalProvider =
      <GamingGameProviderModel>[].obs;

  final RxList<GamingSortSelectModel> sortSelects =
      <GamingSortSelectModel>[].obs;

  final RxList<GamingGameModel> games = <GamingGameModel>[].obs;

  final RxString selectSortDescription = ''.obs;
  final RxList<String> selectProviderIds = <String>[].obs;
  final RxInt gamesTotal = 0.obs;

  final RxBool isLoading = false.obs;
}
