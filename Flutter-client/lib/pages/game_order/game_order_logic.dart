import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/game_order/game_order_api.dart';
import 'package:gogaming_app/controller_header.dart';

class GameOrderLogic extends BaseController
    with GetSingleTickerProviderStateMixin {
  GameOrderLogic({GameType gameType = GameType.sportsBook}) {
    tabController = TabController(
      length: GameType.values.length,
      vsync: this,
      initialIndex: gameType.index,
    );
  }

  late final TabController tabController;
}
