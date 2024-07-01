import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';

class WalletAmountView extends StatelessWidget {
  const WalletAmountView({
    super.key,
    required this.fontSize,
    required this.totalValue,
    this.obscureFund = false,
    this.convertWidegt,
  });

  final GGFontSize fontSize;
  final String totalValue;
  final bool obscureFund;
  final Widget? convertWidegt;

  String get obscureFundText => "*****";

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: obscureFund
              ? CrossAxisAlignment.center
              : CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.ideographic,
          children: [
            Text(
              obscureFund ? obscureFundText : totalValue,
              style: GGTextStyle(
                fontSize: fontSize,
                height: 1,
                color: GGColors.textMain.color,
                fontFamily: GGFontFamily.dingPro,
                fontWeight: GGFontWeigh.bold,
              ),
            ),
            Gaps.hGap4,
            Text(
              'USDT',
              style: GGTextStyle(
                fontSize: GGFontSize.smallTitle,
                color: GGColors.textMain.color,
                // fontWeight: GGFontWeigh.bold,
              ),
            ),
          ],
        ),
        Gaps.vGap4,
        if (convertWidegt != null) convertWidegt!,
      ],
    );
  }
}
