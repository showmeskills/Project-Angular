import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/game_order/models/casino/gaming_casino_order_model.dart';
import 'package:gogaming_app/pages/game_order/common/views/base_game_order_view.dart';
import 'package:gogaming_app/pages/game_order/common/views/game_order_cell_item.dart';
import 'package:gogaming_app/pages/game_order/common/views/game_order_item_bottom_view.dart';
import 'package:gogaming_app/pages/game_order/common/views/game_order_item_container.dart';
import 'package:gogaming_app/pages/game_order/game_order_detail/game_order_detail_page.dart';
import 'package:gogaming_app/pages/game_order/logics/game_order_casino_logic.dart';
import 'package:gogaming_app/widget_header.dart';

part '_casino_item_view.dart';

class GameOrderCasinoView
    extends GameOrderBaseView<GamingOrderCasinoLogic, GamingCasinoOrderModel> {
  const GameOrderCasinoView({super.key});

  @override
  Widget build(BuildContext context) {
    Get.put(GamingOrderCasinoLogic());
    return super.build(context);
  }

  @override
  Widget itemBuilder(GamingCasinoOrderModel v) {
    return _CasinoItemView(
      data: v,
    );
  }
}
