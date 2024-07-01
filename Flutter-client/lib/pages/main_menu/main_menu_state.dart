import 'package:base_framework/base_framework.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import '../../common/api/game/models/gaming_game_scenes_model.dart';
import '../../common/service/gaming_tag_service/gaming_tag_service.dart';

class MainMenuState {
  final isLogin = AccountService.sharedInstance.isLogin.obs;
  RxInt recentGameCount = 0.obs;
  RxInt favoriteGameCount = 0.obs;

  RxList<GameScenseLeftMenus> leftMenus =
      (GamingTagService.sharedInstance.scenseModel?.leftMenus ??
              <GameScenseLeftMenus>[])
          .obs;
  RxList<GameScenseHeaderMenuModel> headerMenus = (GamingTagService
              .sharedInstance.scenseModel?.headerMenus
              ?.where((element) => element.key != '0')
              .toList() ??
          [])
      .obs;

  final showTournament = false.obs;
  final showTodayRace = false.obs;
  final showLuckySpin = false.obs;
  final showRecentActivity = false.obs;
}
