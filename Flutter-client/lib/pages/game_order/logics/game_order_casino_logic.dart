import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';
import 'package:gogaming_app/common/api/game_order/game_order_api.dart';
import 'package:gogaming_app/common/api/game_order/models/casino/gaming_casino_order_model.dart';
import 'package:gogaming_app/pages/game_order/common/base_game_order_logic.dart';

export 'package:gogaming_app/pages/game_order/common/base_game_order_logic.dart'
    show IGameOrderState;

class GameOrderCasinoState extends IGameOrderState<GamingCasinoOrderModel> {}

class GamingOrderCasinoLogic
    extends BaseGameOrderLogic<GamingCasinoOrderModel> {
  GamingOrderCasinoLogic()
      : super(
          state: GameOrderCasinoState(),
          gameType: GameType.casino,
        );

  @override
  GoGamingPagination<GamingCasinoOrderModel> dataFactory(
      Map<String, dynamic> value) {
    return GoGamingPagination<GamingCasinoOrderModel>.fromJson(
      itemFactory: (e) => GamingCasinoOrderModel.fromJson(e),
      json: value['data'] as Map<String, dynamic>,
    );
  }
}
