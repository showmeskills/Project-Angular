import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:flutter_html/flutter_html.dart';

class GamingLuckySpinExplainView extends StatelessWidget {
  const GamingLuckySpinExplainView(
      {Key? key,
      required this.context,
      required this.height,
      required this.content})
      : super(key: key);
  final BuildContext context;
  final double height;
  final String content;
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 349.dp,
      height: height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20.dp),
        gradient: const LinearGradient(
          colors: [
            Color(0xFF0F1E29),
            Color(0xFF1D5F8C),
          ],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
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
              color: GGColors.buttonTextWhite.color.withOpacity(0.2),
            ),
          ),
          Gaps.hGap10,
        ],
      ),
    );
  }
}
