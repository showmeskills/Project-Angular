import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';

class GoGamingNoMore extends StatelessWidget {
  const GoGamingNoMore({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          height: 1.dp,
          width: 14.dp,
          color: GGColors.border.color,
        ),
        Gaps.hGap8,
        Text(
          localized('no_more'),
          style: GGTextStyle(
            color: GGColors.textHint.color,
            fontSize: GGFontSize.hint,
            fontWeight: GGFontWeigh.regular,
          ),
        ),
        Gaps.hGap8,
        Container(
          height: 1.dp,
          width: 14.dp,
          color: GGColors.border.color,
        ),
      ],
    );
  }
}
