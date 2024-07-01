import 'package:gogaming_app/common/api/game/models/gaming_game/game_model.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/game_search_result_model.dart';
import 'package:gogaming_app/common/components/extensions/gg_reg_exp.dart';
import 'package:gogaming_app/common/service/game_service.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/controller_header.dart';

class GameSearchLogic extends BaseController {
  late GamingTextFieldController searchController = GamingTextFieldController(
    onChanged: _onChanged,
    validator: [
      GamingTextFieldValidator(
        reg: GGRegExp.gameSearch,
      ),
    ],
  );
  final _keyword = ''.obs;
  final recommendGame = GameService().recommendGame;
  final searchResultsGames = <GamingGameModel>[].obs;
  final searchResultsLabels = <LabelInfo>[].obs;
  late final history = List<String>.from(_cacheHistory.val).obs;
  final _cacheHistory =
      ReadWriteValue<List<dynamic>>('GameSearchLogic.SearchHistory', []);
  final isSearching = false.obs;

  @override
  void onReady() {
    super.onReady();
    _initData();
    debounce<String>(
      _keyword,
      time: 1.seconds,
      onSearch,
    );
  }

  void _initData() {
    GameService().loadRecommend().listen((event) {}, onError: (e) {});
  }

  void _onChanged(String text) {
    _keyword.value = text;
    if (text.isEmpty) {
      searchResultsGames.assignAll([]);
      searchResultsLabels.assignAll([]);
      isSearching.value = false;
    }
    // searchError.value = searchController.textController.text.isNotEmpty &&
    //     !searchController.isPass;
  }

  void cacheItem(String item) {
    history.remove(item);
    history.insert(0, item);
    //最多展示六条记录
    if (history.length > 6) {
      history.removeLast();
    }
    _cacheHistory.val = history.toList();
  }

  void deleteHistory(String item) {
    history.remove(item);
    _cacheHistory.val = history.toList();
  }

  void enterSearch(String text) {
    searchController.textController.text = text;
    if (searchController.isPass) {
      cacheItem(text);
      onSearch(text);
    }
  }

  void onSearch(String text) {
    if (searchController.isPass) {
      // _api.gameSearch(text).then((value) {
      //   if (value.success == true) {
      //     searchResults.assignAll(value.data);
      //   }
      // });
      GameService().gameSearch(text).listen((event) {
        searchResultsGames.assignAll(event.data?.gameInfo ?? []);
        searchResultsLabels.assignAll(event.data?.labelInfo ?? []);
      }, onError: (e) {});
      isSearching.value = true;
    }
  }
}
