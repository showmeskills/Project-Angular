// ignore_for_file: prefer_const_declarations, unused_local_variable

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/game_order/game_order_api.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_wager_status_selector.dart';
import 'package:gogaming_app/pages/game_order/game_order_detail/views/game_order_detail_row.dart';
import 'package:gogaming_app/widget_header.dart';

import 'game_order_detail_logic.dart';
import 'models/game_order_detail_layout.dart';
import 'views/game_order_detail_sport.dart';

class GameOrderDetailPage extends StatelessWidget {
  const GameOrderDetailPage({
    Key? key,
    required this.wagerNumber,
    required this.gameType,
    required this.statusSelector,
  }) : super(key: key);

  /// 游戏订单编号
  final String wagerNumber;

  /// 游戏类型
  final GameType gameType;
  final GamingWagerStatusSelector statusSelector;

  static Future<dynamic> show({
    required String wagerNumber,
    required GameType gameType,
    required GamingWagerStatusSelector statusSelector,
  }) {
    // final sportSignal = 'G1438612986184837G';
    // final sportMulti = 'G1438613941683333G';
    // final sportType = 'SportsBook';
    //
    // final lotteryNum = 'G1437097059259973G';
    // final lotteryType = 'Lottery';
    //
    // final casinoNumber = 'G1438641862886533G';
    // final casinoType = 'LiveCasino';
    //
    // final chessNumber = 'G1438660772418693G';
    // final chessType = 'Chess';

    return GamingBottomSheet.show<dynamic>(
      title: localized('transfer_details'),
      useCloseButton: true,
      centerTitle: true,
      fixedHeight: false,
      builder: (context) {
        return GameOrderDetailPage(
          wagerNumber: wagerNumber,
          // wagerNumber: sportSignal,
          gameType: gameType,
          statusSelector: statusSelector,
        );
      },
    );
  }

  GameOrderDetailLogic get controller =>
      Get.find<GameOrderDetailLogic>(tag: tag);

  String get tag => '{$gameType}-$wagerNumber';

  @override
  Widget build(BuildContext context) {
    Get.put(
      GameOrderDetailLogic(wagerNumber, gameType, statusSelector),
      tag: tag,
    );
    final screenHeight = MediaQuery.of(context).size.height;

    return GetBuilder(
        init: controller,
        builder: (value) {
          return Stack(
            children: [
              ConstrainedBox(
                constraints: BoxConstraints(
                  minWidth: double.infinity,
                  minHeight: screenHeight * 0.5,
                  maxHeight: screenHeight * 0.85,
                ),
                child: ListView(
                  shrinkWrap: true,
                  physics: const ClampingScrollPhysics(),
                  padding: EdgeInsetsDirectional.only(
                    top: 10.dp,
                    bottom: 12.dp + Util.iphoneXBottom,
                    start: 16.dp,
                    end: 16.dp,
                  ),
                  children: [
                    _buildValueWidget(
                      controller.transactionNumberValueLayout,
                      padding: EdgeInsets.only(bottom: 7.dp),
                    ),
                    _buildValueWidget(controller.gameTypeValueLayout),
                    _buildValueWidget(controller.venueValueLayout),
                    if (controller.bunchList.isNotEmpty)
                      _buildBunchWidget(context),
                    ...controller.otherValueLayout
                        .map((e) => _buildValueWidget(e))
                        .toList(),
                  ],
                ),
              ),
              Positioned.fill(
                child: Obx(() {
                  return Visibility(
                    visible: controller.isLoading.value,
                    child: const GoGamingLoading(),
                  );
                }),
              ),
            ],
          );
        });
  }

  /// 构建串单模块
  Widget _buildBunchWidget(BuildContext context) {
    return Obx(() {
      return GameOrderDetailSport(
        bunchList: controller.bunchList,
        selectedIndex: controller.selectedBunchIndex.value,
        controller: controller.swiperController,
        scrollEnd: controller.swiperScrollEnd,
        itemSizeChange: (size) {
          controller.itemSize = size;
        },
        pressItem: (int index) {
          controller.selectedBunchIndex.value = index;
        },
      );
    });
  }

  Widget _buildValueWidget(
    GameOrderDetailValueLayout? layout, {
    EdgeInsetsGeometry? padding,
  }) {
    if (layout == null) return const SizedBox();
    return GameOrderDetailRow(layout: layout, padding: padding);
  }
}
