import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';
import 'package:gogaming_app/common/api/game_order/game_order_api.dart';
import 'package:gogaming_app/common/api/game_order/models/chess/gaming_chess_order_model.dart';
import 'package:gogaming_app/pages/game_order/common/base_game_order_logic.dart';

export 'package:gogaming_app/pages/game_order/common/base_game_order_logic.dart'
    show IGameOrderState;

class GameOrderChessState extends IGameOrderState<GamingChessOrderModel> {}

class GamingOrderChessLogic extends BaseGameOrderLogic<GamingChessOrderModel> {
  GamingOrderChessLogic()
      : super(
          state: GameOrderChessState(),
          gameType: GameType.chess,
        );

  @override
  GoGamingPagination<GamingChessOrderModel> dataFactory(
      Map<String, dynamic> value) {
    return GoGamingPagination<GamingChessOrderModel>.fromJson(
      itemFactory: (e) => GamingChessOrderModel.fromJson(e),
      json: value['data'] as Map<String, dynamic>,
    );
  }
}
