import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/activity/models/register_bonus_model.dart';
import 'package:gogaming_app/common/painting/bonus_shape_border.dart';
import 'package:gogaming_app/widget_header.dart';

class RegisterBonusItemView extends StatelessWidget {
  const RegisterBonusItemView({
    super.key,
    required this.data,
    this.selected = false,
  });

  final RegisterBonusModel data;
  final bool selected;

  @override
  Widget build(BuildContext context) {
    final color = selected ? GGColors.brand.color : GGColors.border.color;
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
        horizontal: 20.dp,
      ),
      constraints: BoxConstraints(
        minHeight: 84.dp,
      ),
      decoration: ShapeDecoration(
        shape: BonusShapeBorder(
          color: color,
          iconColor: GGColors.buttonTextWhite.color,
          size: selected ? Size(32.dp, 32.dp) : Size.zero,
          aligemnt: Alignment.topRight,
          radius: 4.dp,
          holeSize: 20.dp,
          side: BorderSide(
            color: color,
            width: 1.dp,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: EdgeInsets.symmetric(vertical: 13.dp),
            child: Text(
              data.content?.title ?? '',
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                fontWeight: GGFontWeigh.bold,
                color: GGColors.textMain.color,
              ),
            ),
          ),
          Text(
            data.content?.prizeName ?? '',
            style: GGTextStyle(
              fontSize: GGFontSize.hint,
              color: GGColors.textSecond.color,
            ),
          ),
          Gaps.vGap16,
        ],
      ),
    );
  }
}
