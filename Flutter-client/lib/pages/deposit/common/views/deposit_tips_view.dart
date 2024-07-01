import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/widget_header.dart';

class DepositTipsView extends StatelessWidget {
  const DepositTipsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: GGColors.error.color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(4.dp),
      ),
      padding: EdgeInsets.symmetric(vertical: 10.dp, horizontal: 20.dp),
      child: Column(
        children: [
          Row(
            children: [
              GamingImage.asset(
                R.iconWarning,
                width: 20.dp,
                color: GGColors.error.color,
              ),
              Gaps.hGap10,
              Expanded(
                child: Text(
                  localized('deposit_not_award_tips'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.smallTitle,
                    color: GGColors.error.color,
                    fontWeight: GGFontWeigh.bold,
                  ),
                ),
              ),
            ],
          ),
          Gaps.vGap10,
          _buildItem(localized('deposit_not_within_time')),
          Gaps.vGap2,
          _buildItem(localized('deposit_modify_amount')),
          Gaps.vGap2,
          _buildItem(localized('deposit_not_arrive_and_check')),
        ],
      ),
    );
  }

  Widget _buildItem(String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          height: (14.dp * 1.44).roundToDouble(),
          alignment: Alignment.center,
          child: Container(
            width: 4.dp,
            height: 4.dp,
            decoration: BoxDecoration(
              color: GGColors.textMain.color,
              shape: BoxShape.circle,
            ),
          ),
        ),
        Gaps.hGap6,
        Expanded(
          child: Text(
            text,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
              height: 1.44,
            ),
          ),
        ),
      ],
    );
  }
}
