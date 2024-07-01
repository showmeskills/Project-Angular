import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/widget_header.dart';

mixin AppealCommonUIMixin {
  Widget buildContainer({
    required Widget child,
    Color? color,
  }) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
        horizontal: 14.dp,
        vertical: color == null ? 16.dp : 17.dp,
      ),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(4.dp),
        border: color == null
            ? Border.all(
                color: GGColors.border.color,
                width: 1.dp,
              )
            : null,
      ),
      child: child,
    );
  }

  Widget buildTitle(
    String title, {
    bool? isRequired,
  }) {
    return Row(
      children: [
        Text(
          title,
          style: GGTextStyle(
            fontSize: GGFontSize.bigTitle20,
            color: GGColors.textMain.color,
          ),
        ),
        if (isRequired == true)
          SvgPicture.asset(
            R.iconRequired,
            width: 14.dp,
            height: 14.dp,
            color: GGColors.error.color,
          ),
        if (isRequired == false)
          Text(
            ' (${localized('optional')})',
            style: GGTextStyle(
              fontSize: GGFontSize.bigTitle20,
              color: GGColors.textSecond.color,
            ),
          ),
      ],
    );
  }

  Widget buildSubTitle(
    String title, {
    bool? isRequired,
  }) {
    return Row(
      children: [
        Text(
          title,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        if (isRequired == true)
          SvgPicture.asset(
            R.iconRequired,
            width: 14.dp,
            height: 14.dp,
            color: GGColors.error.color,
          ),
      ],
    );
  }

  Widget buildTips(String text) {
    return Container(
      decoration: BoxDecoration(
        color: GGColors.appealCryptoTipsBackground.color,
        borderRadius: BorderRadius.circular(4.dp),
      ),
      padding: EdgeInsets.all(15.dp),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 14.dp * 1.4,
            alignment: Alignment.center,
            child: Image.asset(
              R.commonToastError,
              width: 14.dp,
              height: 14.dp,
            ),
          ),
          Gaps.hGap8,
          Expanded(
            child: Text(
              text,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
