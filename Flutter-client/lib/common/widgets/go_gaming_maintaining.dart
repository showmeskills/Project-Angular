import 'package:flutter/material.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

class GoGamingMaintaining extends StatelessWidget {
  const GoGamingMaintaining({super.key, this.text});
  final String? text;

  @override
  Widget build(BuildContext context) {
    final tips = text ?? localized('channel_try');
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image.asset(
            R.commonMaintaining,
            width: 152.dp,
            height: 95.dp,
          ),
          Gaps.vGap20,
          Text(
            localized('in_maint'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            ),
          ),
          if (tips.isNotEmpty)
            Container(
              margin: EdgeInsets.only(top: 20.dp),
              child: Text(
                tips,
                style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  color: GGColors.textSecond.color,
                ),
              ),
            ),
          Gaps.vGap20,
        ],
      ),
    );
  }
}
