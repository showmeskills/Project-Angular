import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/widget_header.dart';

class GameOrderTotalView extends StatelessWidget {
  const GameOrderTotalView({
    super.key,
    required this.count,
    required this.betTotal,
    required this.payoutTotal,
    this.color,
  });

  final int count;
  final double betTotal;
  final double payoutTotal;
  final Color? color;

  String get betTotalText {
    return NumberPrecision(betTotal).balanceText(true);
  }

  String get payoutTotalText {
    return symbol + NumberPrecision(payoutTotal).balanceText(true);
  }

  Color get payoutTotalColor {
    if (color != null) {
      return color!;
    }
    if (payoutTotal == 0) {
      return GGColors.textSecond.color;
    } else {
      if (payoutTotal > 0) {
        return GGColors.success.color;
      } else {
        return GGColors.error.color;
      }
    }
  }

  String get symbol {
    return payoutTotal > 0 ? '+' : '';
  }

  @override
  Widget build(BuildContext context) {
    final currency = GamingCurrencyModel.usdt();
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '${localized('deal_cout')}: $count',
          style: GGTextStyle(
            fontSize: GGFontSize.hint,
            color: color ?? GGColors.textSecond.color,
          ),
        ),
        Gaps.hGap14,
        Expanded(
          child: LayoutBuilder(builder: (context, constraints) {
            final width = (constraints.maxWidth - 14.dp) ~/ 2;
            return Wrap(
              alignment: WrapAlignment.end,
              spacing: 14.dp,
              runSpacing: 4.dp,
              children: [
                ConstrainedBox(
                  constraints: BoxConstraints(
                    minWidth: width.toDouble(),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        '${localized('deal_flow')}: ',
                        style: GGTextStyle(
                          fontSize: GGFontSize.hint,
                          color: color ?? GGColors.textSecond.color,
                        ),
                      ),
                      Text(
                        betTotalText,
                        style: GGTextStyle(
                          fontSize: GGFontSize.hint,
                          color: color ?? GGColors.textSecond.color,
                        ),
                      ),
                      Gaps.hGap4,
                      GamingImage.network(
                        url: currency.iconUrl,
                        width: 14.dp,
                        height: 14.dp,
                      ),
                    ],
                  ),
                ),
                ConstrainedBox(
                  constraints: BoxConstraints(
                    minWidth: width.toDouble(),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        '${localized('wol')}: ',
                        style: GGTextStyle(
                          fontSize: GGFontSize.hint,
                          color: color ?? GGColors.textSecond.color,
                        ),
                      ),
                      Text(
                        payoutTotalText,
                        style: GGTextStyle(
                          fontSize: GGFontSize.hint,
                          color: payoutTotalColor,
                        ),
                      ),
                      Gaps.hGap4,
                      GamingImage.network(
                        url: currency.iconUrl,
                        width: 14.dp,
                        height: 14.dp,
                      ),
                    ],
                  ),
                ),
              ],
            );
          }),
        ),
      ],
    );
  }
}

class GameOrderTopTotalView extends StatelessWidget {
  const GameOrderTopTotalView({
    super.key,
    required this.count,
    required this.betTotal,
    required this.payoutTotal,
    this.color,
  });

  final int count;
  final double betTotal;
  final double payoutTotal;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: Container(
        decoration: BoxDecoration(
          color: GGColors.highlightButton.color,
          borderRadius: BorderRadius.circular(4.dp),
        ),
        padding: EdgeInsets.symmetric(horizontal: 10.dp, vertical: 10.dp),
        child: GameOrderTotalView(
          count: count,
          betTotal: betTotal,
          payoutTotal: payoutTotal,
          color: color ?? GGColors.buttonTextWhite.color,
        ),
      ),
    );
  }
}
