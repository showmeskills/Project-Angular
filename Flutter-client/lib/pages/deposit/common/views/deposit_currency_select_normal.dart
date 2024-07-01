import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_ui_mixin.dart';
import 'package:gogaming_app/widget_header.dart';

import 'deposi_common_select_view.dart';

class DepositCurrencySelectorNormal extends StatelessWidget
    with DepositCommonUIMixin {
  const DepositCurrencySelectorNormal({
    super.key,
    required this.title,
    this.hintText,
    required this.onPressed,
    this.selected,
  });

  final String title;
  final String? hintText;
  final void Function() onPressed;
  final GamingCurrencyModel? selected;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildSubTitle(title, context),
        Gaps.vGap4,
        DepositCommonSelectView(
          onPressed: onPressed,
          builder: (context) {
            if (selected == null) {
              return Text(
                hintText ?? title,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textHint.color,
                ),
              );
            } else {
              return Row(
                children: [
                  GamingImage.network(
                    url: selected?.iconUrl,
                    width: 18.dp,
                    height: 18.dp,
                  ),
                  Gaps.hGap10,
                  Text(
                    selected!.currency!,
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textMain.color,
                      fontFamily: GGFontFamily.dingPro,
                      fontWeight: GGFontWeigh.bold,
                    ),
                  ),
                  Gaps.hGap4,
                  Text(
                    selected!.name ?? '',
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textSecond.color,
                      fontFamily: GGFontFamily.dingPro,
                    ),
                  ),
                ],
              );
            }
          },
        ),
      ],
    );
  }
}
