import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';
import 'package:gogaming_app/common/api/game_order/game_order_api.dart';
import 'package:gogaming_app/common/api/game_order/models/lottery/gaming_lottery_order_model.dart';
import 'package:gogaming_app/pages/game_order/common/base_game_order_logic.dart';

export 'package:gogaming_app/pages/game_order/common/base_game_order_logic.dart'
    show IGameOrderState;

class GameOrderLotteryState extends IGameOrderState<GamingLotteryOrderModel> {}

class GamingOrderLotteryLogic
    extends BaseGameOrderLogic<GamingLotteryOrderModel> {
  GamingOrderLotteryLogic()
      : super(
          state: GameOrderLotteryState(),
          gameType: GameType.lottery,
        );

  @override
  GoGamingPagination<GamingLotteryOrderModel> dataFactory(
      Map<String, dynamic> value) {
    return GoGamingPagination<GamingLotteryOrderModel>.fromJson(
      itemFactory: (e) => GamingLotteryOrderModel.fromJson(e),
      json: value['data'] as Map<String, dynamic>,
    );
  }
}
