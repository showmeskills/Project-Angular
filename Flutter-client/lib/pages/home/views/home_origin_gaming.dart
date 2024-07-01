import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
// import 'package:gogaming_app/config/gaps.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

class HomeOriginGaming extends StatelessWidget {
  const HomeOriginGaming({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: EdgeInsets.symmetric(horizontal: 12.dp, vertical: 20.dp),
      padding: EdgeInsets.symmetric(horizontal: 12.dp, vertical: 34.dp),
      height: 553.dp,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.all(Radius.circular(12.dp)),
        image: const DecorationImage(
          image: AssetImage(
            R.homeOriginalGamingBg,
          ),
          fit: BoxFit.cover,
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            bottom: -30.dp,
            left: 90.dp,
            right: -90.dp,
            child: Image.asset(
              R.homeRocket,
              width: double.infinity,
            ),
          ),
          Positioned.fill(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      localized('o_b_crash_t'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.bigTitle,
                        fontWeight: GGFontWeigh.bold,
                        color: GGColors.textMain.color,
                      ),
                    ),
                    Gaps.vGap30,
                    Text(
                      localized('o_b_crash_i1'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.textMain.color,
                        height: 1.5,
                      ),
                    ),
                    Gaps.vGap28,
                    Text(
                      localized('o_b_crash_i2'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.textMain.color,
                        height: 1.5,
                      ),
                    ),
                    Gaps.vGap36,
                    Text(
                      localized('o_b_crash'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.superBigTitle36,
                        color: GGColors.textMain.color,
                        fontWeight: GGFontWeigh.bold,
                      ),
                    ),
                    Gaps.vGap8,
                    Text(
                      localized('o_b_crash_desc'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.hint,
                        color: GGColors.textMain.color,
                      ),
                    ),
                  ],
                ),
                SizedBox(
                  width: 120.dp,
                  height: 40.dp,
                  child: GGButton.main(
                    onPressed: () {},
                    textStyle: GGTextStyle(
                      fontSize: GGFontSize.content,
                    ),
                    text: localized('try_it_now'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
