import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/game_order/models/lottery/gaming_lottery_order_model.dart';
import 'package:gogaming_app/pages/game_order/common/views/base_game_order_view.dart';
import 'package:gogaming_app/pages/game_order/common/views/game_order_cell_item.dart';
import 'package:gogaming_app/pages/game_order/common/views/game_order_item_bottom_view.dart';
import 'package:gogaming_app/pages/game_order/common/views/game_order_item_container.dart';
import 'package:gogaming_app/pages/game_order/game_order_detail/game_order_detail_page.dart';
import 'package:gogaming_app/pages/game_order/logics/game_order_lottery_logic.dart';
import 'package:gogaming_app/widget_header.dart';

part '_lottery_item_view.dart';

class GameOrderLotteryView extends GameOrderBaseView<GamingOrderLotteryLogic,
    GamingLotteryOrderModel> {
  const GameOrderLotteryView({super.key});

  @override
  Widget build(BuildContext context) {
    Get.put(GamingOrderLotteryLogic());
    return super.build(context);
  }

  @override
  Widget itemBuilder(GamingLotteryOrderModel v) {
    return _LotteryItemView(
      data: v,
    );
  }
}
