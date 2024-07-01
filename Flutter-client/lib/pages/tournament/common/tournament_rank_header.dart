import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';

class TournamentRankHeader extends StatelessWidget {
  const TournamentRankHeader({
    super.key,
    this.height,
    this.textColor,
  });

  final double? height;

  final Color? textColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(right: 8.dp),
      height: height ?? 40.dp,
      child: Row(
        children: [
          SizedBox(
            width: 60.dp,
            child: Text(
              localized('rank_a'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                fontWeight: GGFontWeigh.bold,
                color: textColor ?? GGColors.textMain.color,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          Gaps.hGap10,
          Expanded(
            child: Text(
              localized('gamer'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                fontWeight: GGFontWeigh.bold,
                color: textColor ?? GGColors.textMain.color,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          Gaps.hGap10,
          Expanded(
            child: Text(
              localized('bonus_t'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                fontWeight: GGFontWeigh.bold,
                color: textColor ?? GGColors.textMain.color,
              ),
              textAlign: TextAlign.right,
            ),
          ),
          Gaps.hGap10,
          Expanded(
            child: Text(
              localized('score'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                fontWeight: GGFontWeigh.bold,
                color: textColor ?? GGColors.textMain.color,
              ),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }
}
