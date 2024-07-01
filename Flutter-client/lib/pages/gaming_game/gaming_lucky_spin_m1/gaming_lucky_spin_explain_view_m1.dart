import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/pages/gaming_game/gaming_lucky_spin_m1/views/luck_spin_bg_view.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:flutter_html/flutter_html.dart';

class GamingLuckySpinExplainViewM1 extends StatelessWidget {
  const GamingLuckySpinExplainViewM1(
      {Key? key,
      required this.context,
      required this.height,
      required this.content,
      required this.title})
      : super(key: key);
  final BuildContext context;
  final double height;
  final String content;
  final String title;
  @override
  Widget build(BuildContext context) {
    return LuckSpinBgView(
      width: 349.dp,
      height: height,
      title: title,
      child: Column(
        children: [
          Gaps.vGap10,
          _buildTitle(context),
          Expanded(
            child: SingleChildScrollView(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 8.dp),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Gaps.vGap20,
                    SingleChildScrollView(
                      child: Html(
                        data: content, //调用
                        style: content.contains('style="color')//没有color时默认白色
                            ? {}
                            : {
                                '*': Style(
                                  color: GGColors.buttonTextWhite.color,
                                ),
                              },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildTitle(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: Row(
        children: [
          Gaps.hGap10,
          Expanded(
            child: Container(
              alignment: Alignment.center,
              child: Text(
                localized("whe_desc_con_t"),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.buttonTextWhite.color,
                ),
              ),
            ),
          ),
          InkWell(
            onTap: () {
              Navigator.of(context).pop();
            },
            child: SvgPicture.asset(
              R.iconClose,
              height: 18.dp,
              color: GGColors.buttonTextWhite.color,
            ),
          ),
          Gaps.hGap10,
        ],
      ),
    );
  }
}
