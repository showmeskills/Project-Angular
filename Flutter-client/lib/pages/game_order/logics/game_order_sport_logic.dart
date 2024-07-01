import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';
import 'package:gogaming_app/common/api/game_order/game_order_api.dart';
import 'package:gogaming_app/common/api/game_order/models/sport/gaming_sport_order_model.dart';
import 'package:gogaming_app/pages/game_order/common/base_game_order_logic.dart';

export 'package:gogaming_app/pages/game_order/common/base_game_order_logic.dart'
    show IGameOrderState;

class GameOrderSportState extends IGameOrderState<GamingSportOrderModel> {}

class GamingOrderSportLogic extends BaseGameOrderLogic<GamingSportOrderModel> {
  GamingOrderSportLogic()
      : super(
          state: GameOrderSportState(),
          gameType: GameType.sportsBook,
        );

  @override
  GoGamingPagination<GamingSportOrderModel> dataFactory(
      Map<String, dynamic> value) {
    return GoGamingPagination<GamingSportOrderModel>.fromJson(
      itemFactory: (e) => GamingSportOrderModel.fromJson(e),
      json: value['data'] as Map<String, dynamic>,
    );
  }
}
