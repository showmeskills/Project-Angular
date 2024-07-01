import 'dart:async';

import 'package:gogaming_app/controller_header.dart';
import '../../../common/api/game/models/gaming_hot_match.dart';
import '../../../config/game_config.dart';

class HomeHotMatchLogic extends BaseController {
  HomeHotMatchLogic({
    required this.hotMatchModel,
  }) {
    _init(hotMatchModel);
  }

  final GamingGameHotMatchModel hotMatchModel;
  Timer? timer;

  final matchTimeContent = ''.obs;

  late int gameTime;

  void _init(GamingGameHotMatchModel hotMatchModel) {
    timer?.cancel();
    gameTime = hotMatchModel.gameTime?.toInt() ?? -1;
    if (gameTime != -1) {
      matchTimeContent.value =
          "${(gameTime ~/ 60).toString().padLeft(2, '0')}:${(gameTime % 60).toString().padLeft(2, '0')}";
      timer = Timer.periodic(const Duration(seconds: 1), (t) {
        _countDown();
      });
    }
  }

  @override
  void onClose() {
    super.onClose();
    timer?.cancel();
  }

  void _countDown() {
    /// 篮球倒数计时
    if (hotMatchModel.sportId == 2) {
      gameTime -= 1;
      if (gameTime == 0) {
        timer?.cancel();
      }
    } else {
      gameTime += 1;
    }
    matchTimeContent.value =
        "${(gameTime ~/ 60).toString().padLeft(2, '0')}:${(gameTime % 60).toString().padLeft(2, '0')}";
  }

  void gotoSport() {
    Get.toNamed<void>(Routes.gamePlayReady.route, arguments: {
      'providerId': GameConfig.sportProviderId,
      'matchInfo': {
        "tournamentId": hotMatchModel.tournamentId,
        "matchId": hotMatchModel.matchId,
        "sportId": hotMatchModel.sportId.toString(),
      }
    });
  }
}
