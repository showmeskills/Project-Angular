import 'package:expandable/expandable.dart';
import 'package:extra_hittest_area/extra_hittest_area.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/game_order/models/sport/gaming_sport_order_model.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/pages/game_order/common/views/base_game_order_view.dart';
import 'package:gogaming_app/pages/game_order/common/views/game_order_item_bottom_view.dart';
import 'package:gogaming_app/pages/game_order/common/views/game_order_item_container.dart';
import 'package:gogaming_app/pages/game_order/game_order_detail/game_order_detail_page.dart';
import 'package:gogaming_app/pages/game_order/logics/game_order_share_logic.dart';
import 'package:gogaming_app/pages/game_order/logics/game_order_sport_logic.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:qr_flutter/qr_flutter.dart';

part '_sport_item_view.dart';
part '_sport_game_view.dart';
part '_sport_share_view.dart';

class GameOrderSportsView
    extends GameOrderBaseView<GamingOrderSportLogic, GamingSportOrderModel> {
  const GameOrderSportsView({super.key});

  @override
  Widget build(BuildContext context) {
    Get.put(GamingOrderSportLogic());
    return super.build(context);
  }

  @override
  Widget itemBuilder(GamingSportOrderModel v) {
    return _SportItemView(data: v);
  }
}
