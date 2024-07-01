import 'package:gogaming_app/common/api/base/base_api.dart';

import '../../api/game/game_api.dart';
import '../../api/game/models/gaming_game_scenes_model.dart';
import '../restart_service.dart';

class GamingTagService extends RestartServiceInterface {
  factory GamingTagService() => _getInstance();

  static GamingTagService get sharedInstance => _getInstance();

  static GamingTagService? _instance;

  static GamingTagService _getInstance() {
    _instance ??= GamingTagService._internal();
    return _instance!;
  }

  GamingTagService._internal();

  late GameScenseModel? scenseModel = () {
    return cache.val == null ? null : GameScenseModel.fromJson(cache.val!);
  }();

  final cache = ReadWriteValue<Map<String, dynamic>?>(
    'CacheScenseModel',
    null,
    () => GetStorage(),
  );

  bool get hasNavigation => scenseModel?.navigationMenus?.isNotEmpty ?? false;

  Stream<GameScenseModel> getScenseInfo({bool force = false}) {
    if (scenseModel == null || force == true) {
      return PGSpi(Game.getScenesMenu.toTarget(inputData: <String, dynamic>{}))
          .rxRequest<Map<String, dynamic>>((value) {
        return value['data'] as Map<String, dynamic>;
      }).flatMap((event) {
        return Stream.value(_storeScense(event.data));
      });
    }
    return Stream.value(scenseModel!);
  }

  GameScenseModel _storeScense(Map<String, dynamic> json) {
    final oldHasNavigation = hasNavigation;
    scenseModel = GameScenseModel.fromJson(json);
    cache.val = json;
    // 使用forceAppUpdate更新导航栏
    if (oldHasNavigation != hasNavigation) {
      Get.forceAppUpdate();
    }
    return scenseModel!;
  }

  void restore() {
    cache.val = null;
    scenseModel = null;
  }

  @override
  void onClose() {
    _instance = null;
  }
}
