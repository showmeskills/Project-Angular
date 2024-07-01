import 'package:flutter/material.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

class LuckySpinBannerHeader extends StatelessWidget {
  const LuckySpinBannerHeader({super.key, required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
        height: 168.dp,
        // width: double.infinity,
        child: Column(
          children: [
            Image.asset(
              R.gameLuckySpinBgM1,
              height: 128.dp,
              width: 329.dp,
            ),
            SizedBox(height: 10.dp),
            Text(
              title,
              style: GGTextStyle(
                fontSize: GGFontSize.smallTitle,
                color: GGColors.buttonTextWhite.color,
                fontWeight: GGFontWeigh.medium,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ));
  }
}
