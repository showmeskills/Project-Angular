import '../../common/api/base/base_api.dart';
import '../../common/api/game/models/gaming_game/game_label_provider_model.dart';
import '../../common/api/game/models/gaming_game/game_model.dart';
import '../../common/api/game/models/gaming_game_sort_model.dart';

class GGProviderGameListState {
  final RxList<GamingSortSelectModel> sortSelects =
      <GamingSortSelectModel>[].obs;
  final RxList<String> selectProviderIds = <String>[].obs;

  final RxList<GamingGameModel> games = <GamingGameModel>[].obs;
  final RxList<GameLabelProviderModel> optionalProviders =
      <GameLabelProviderModel>[].obs;

  final RxString selectSortDescription = ''.obs;
  final RxInt gamesTotal = 0.obs;

  final RxBool isLoading = false.obs;
}
