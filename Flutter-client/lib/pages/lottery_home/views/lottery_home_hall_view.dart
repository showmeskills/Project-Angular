import 'dart:math';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/list_by_label_model.dart';
import 'package:gogaming_app/common/widgets/gaming_game_image.dart';
import 'package:gogaming_app/pages/home/views/home_swiper.dart';
import 'package:gogaming_app/pages/lottery_home/lottery_home_logic.dart';
import 'package:gogaming_app/widget_header.dart';

class LotteryHomeHallView extends StatelessWidget {
  const LotteryHomeHallView({super.key});

  LotteryHomeLogic get logic => Get.find<LotteryHomeLogic>();

  @override
  Widget build(BuildContext context) {
    return Obx(() => Column(
          children: logic.state.hall.map((e) {
            return _buildGame(e);
          }).toList(),
        ));
  }

  Widget _buildGame(GamingGameListByLabelModel label) {
    if (label.gameLists.isEmpty) {
      return Gaps.empty;
    }
    return HomeSwiper(
      iconName: label.icon,
      title: localized(label.labelName!),
      total: min(label.gameLists.length, 24),
      onPressedTitle: () => logic.openGameList(label),
      mainAxisCount: 3,
      crossAxisCount: 1,
      builder: (context, index) {
        return GamingGameImage(
          radius: 4.dp,
          data: label.gameLists[index],
        );
      },
    );
  }
}
