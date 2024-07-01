import 'dart:math';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/list_by_label_model.dart';
import 'package:gogaming_app/common/widgets/game_provider_view.dart';
import 'package:gogaming_app/common/widgets/gaming_game_image.dart';
import 'package:gogaming_app/pages/game_home/game_home_logic.dart';
import 'package:gogaming_app/pages/home/views/home_swiper.dart';
import 'package:gogaming_app/widget_header.dart';

class GameHomeHallView extends StatelessWidget {
  const GameHomeHallView({super.key});

  GameHomeLogic get logic => Get.find<GameHomeLogic>();

  @override
  Widget build(BuildContext context) {
    return Obx(() => Column(
          children: logic.state.hall.map((e) {
            return _buildGame(e);
          }).toList()
            ..insert(
                insertIndex,
                const GameProviderView(
                  tag: "GameHomeHallView",
                  filterProviders: true,
                )),
        ));
  }

  int get insertIndex {
    if (logic.state.hall.length >= 2) {
      return 2;
    } else if (logic.state.hall.isNotEmpty) {
      return 1;
    }
    return 0;
  }

  Widget _buildGame(GamingGameListByLabelModel label) {
    if (label.gameLists.isEmpty) {
      return Gaps.empty;
    }
    return HomeSwiper(
      iconName: label.icon,
      title: label.labelName ?? '',
      total: min(label.gameLists.length, 24),
      onPressedTitle: () => logic.openGameList(label),
      mainAxisCount: 3,
      crossAxisCount: label.multiLine,
      builder: (context, index) {
        return GamingGameImage(
          radius: 4.dp,
          data: label.gameLists[index],
        );
      },
    );
  }
}
