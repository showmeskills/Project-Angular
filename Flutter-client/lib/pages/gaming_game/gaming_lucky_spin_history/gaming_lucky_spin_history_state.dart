import 'package:gogaming_app/controller_header.dart';
import '../../../common/api/lucky_spin/models/game_lucky_spin_history_model.dart';

class GamingLuckySpinHistoryState {
  RxList<GameLuckySpinHistoryModel> dataList =
      <GameLuckySpinHistoryModel>[].obs;
}
