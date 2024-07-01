import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';

mixin WalletCommonUIMixin {
  Widget buildOverviewContainer({
    required Widget child,
    EdgeInsets? padding,
  }) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: GGColors.moduleBackground.color,
        borderRadius: const BorderRadiusDirectional.only(
          topStart: Radius.circular(25),
          topEnd: Radius.circular(25),
        ),
      ),
      padding: padding ??
          EdgeInsets.only(
            top: 24.dp,
            left: 16.dp,
            bottom: 24.dp,
            right: 16.dp,
          ),
      child: child,
    );
  }

  Widget buildWalletName(String name) {
    return Text(
      name,
      style: GGTextStyle(
        fontSize: GGFontSize.bigTitle20,
        fontWeight: GGFontWeigh.bold,
        color: GGColors.textMain.color,
      ),
    );
  }

  Widget buildTotalAmount({required Widget child}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized('wal_det'),
          style: GGTextStyle(
            color: GGColors.textMain.color,
            fontSize: GGFontSize.content,
          ),
        ),
        Gaps.vGap8,
        child,
      ],
    );
  }

  String get obscureFundText => "*****";

  Widget buildNumRow(
    GGFontSize fontSize,
    String totalValue,
    double total,
    bool obscureFund,
    Widget? convertWidegt,
  ) {
    return Row(
      crossAxisAlignment:
          obscureFund ? CrossAxisAlignment.center : CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.ideographic,
      children: [
        Text(
          obscureFund ? obscureFundText : totalValue,
          style: GGTextStyle(
            fontSize: fontSize,
            height: 1,
            color: GGColors.textMain.color,
            fontFamily: GGFontFamily.dingPro,
            // fontWeight: GGFontWeigh.bold,
          ),
        ),
        Gaps.hGap4,
        Text(
          'USDT',
          style: GGTextStyle(
            fontSize: GGFontSize.smallTitle,
            color: GGColors.textMain.color,
          ),
        ),
        SizedBox(width: 12.dp),
        if (convertWidegt != null) convertWidegt,
      ],
    );
  }
}
