import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/game_order/models/chess/gaming_chess_order_model.dart';
import 'package:gogaming_app/pages/game_order/common/views/base_game_order_view.dart';
import 'package:gogaming_app/pages/game_order/common/views/game_order_cell_item.dart';
import 'package:gogaming_app/pages/game_order/common/views/game_order_item_bottom_view.dart';
import 'package:gogaming_app/pages/game_order/common/views/game_order_item_container.dart';
import 'package:gogaming_app/pages/game_order/game_order_detail/game_order_detail_page.dart';
import 'package:gogaming_app/pages/game_order/logics/game_order_chess_logic.dart';
import 'package:gogaming_app/widget_header.dart';

part '_chess_item_view.dart';

class GameOrderChessView
    extends GameOrderBaseView<GamingOrderChessLogic, GamingChessOrderModel> {
  const GameOrderChessView({super.key});

  @override
  Widget build(BuildContext context) {
    Get.put(GamingOrderChessLogic());
    return super.build(context);
  }

  @override
  Widget itemBuilder(GamingChessOrderModel v) {
    return _ChessItemView(
      data: v,
    );
  }
}
