import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/game_order/game_order_api.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import 'common/base_game_order_logic.dart';
import 'game_order_logic.dart';
import 'views/casino/casino_view.dart';
import 'views/chess/chess_view.dart';
import 'views/lottery/lottery_view.dart';
import 'views/sport/sport_view.dart';

part 'common/views/filter_header_view.dart';
part 'views/_tab_bar.dart';

class GameOrderPage extends BaseView<GameOrderLogic> {
  const GameOrderPage({
    super.key,
    this.gameType = GameType.sportsBook,
  });

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () =>
          GameOrderPage.argument(Get.arguments as Map<String, dynamic>?),
    );
  }

  final GameType gameType;

  factory GameOrderPage.argument(Map<String, dynamic>? arguments) {
    return GameOrderPage(
      gameType: GameTypeExtension.convert(arguments?['gameType'] as String?),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      title: localized('tran_record'),
      centerTitle: true,
    );
  }

  @override
  Color backgroundColor() {
    return GGColors.background.color;
  }

  @override
  bool ignoreBottomSafeSpacing() {
    return true;
  }

  @override
  Widget body(BuildContext context) {
    Get.put(GameOrderLogic(gameType: gameType));
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: GGColors.moduleBackground.color,
        borderRadius: const BorderRadiusDirectional.only(
          topStart: Radius.circular(25),
          topEnd: Radius.circular(25),
        ),
      ),
      child: Column(
        children: [
          const _TabBar(),
          Expanded(
            child: TabBarView(
              controller: controller.tabController,
              children: const [
                GameOrderSportsView(),
                GameOrderLotteryView(),
                GameOrderCasinoView(),
                GameOrderChessView(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
