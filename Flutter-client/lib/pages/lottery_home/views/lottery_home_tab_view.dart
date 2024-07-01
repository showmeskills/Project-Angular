import 'dart:math';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/list_by_label_model.dart';
import 'package:gogaming_app/common/widgets/gaming_game_image.dart';
import 'package:gogaming_app/common/widgets/gaming_game_label_icon.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/widget_header.dart';

import '../lottery_home_logic.dart';

class LotteryHomeTabView extends StatelessWidget {
  LotteryHomeTabView({required this.label})
      : super(key: ValueKey(label.labelCode));
  final GamingGameListByLabelModel label;

  LotteryHomeLogic get logic => Get.find<LotteryHomeLogic>();

  @override
  Widget build(BuildContext context) {
    if (label.gameLists.isEmpty) {
      return Gaps.empty;
    }
    return _buildGame();
  }

  Widget _buildGame() {
    return Column(
      children: [
        Gaps.vGap20,
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () => logic.openGameList(label),
          child: Container(
            height: 38.dp,
            padding: EdgeInsets.symmetric(horizontal: 12.dp),
            child: Row(
              children: [
                GamingGameLabelIcon(
                  iconName: label.icon ?? '',
                  size: 18.dp,
                ),
                Gaps.hGap4,
                Expanded(
                  child: Text(
                    localized(label.labelName!),
                    style: GGTextStyle(
                      fontSize: GGFontSize.bigTitle,
                      fontWeight: GGFontWeigh.bold,
                      color: GGColors.textMain.color,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ),
        Gaps.vGap10,
        Container(
          width: double.infinity,
          padding: EdgeInsets.only(left: 9.dp, right: 9.dp),
          child: LayoutBuilder(builder: (context, constraints) {
            final itemPadding = EdgeInsets.symmetric(horizontal: 3.dp);
            final width = (constraints.maxWidth ~/ 3).toDouble();
            final height = (width - itemPadding.horizontal) * 1.33;
            return Wrap(
              runSpacing: 10.dp,
              children: List.generate(
                min(label.gameLists.length, 24),
                (index2) {
                  return Container(
                    padding: itemPadding,
                    width: width,
                    height: height,
                    child: GamingGameImage(
                      radius: 4.dp,
                      data: label.gameLists[index2],
                    ),
                  );
                },
              ),
            );
          }),
        ),
        if (label.gameCount > 24)
          Container(
            width: 210.dp,
            margin: EdgeInsets.only(top: 20.dp),
            child: GGButton.minor(
              height: 42.dp,
              onPressed: () => logic.openGameList(label),
              text: '${localized('view_all')} ${localized(label.labelName!)}',
              textStyle: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
              ),
            ),
          ),
      ],
    );
  }
}
