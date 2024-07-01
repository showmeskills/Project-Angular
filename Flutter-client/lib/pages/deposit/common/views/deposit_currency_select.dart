import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/faq/faq_api.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_ui_mixin.dart';
import 'package:gogaming_app/widget_header.dart';

import 'deposi_common_select_view.dart';

class DepositCurrencySelector extends StatelessWidget
    with DepositCommonUIMixin {
  const DepositCurrencySelector({
    super.key,
    required this.title,
    this.hintText,
    required this.onPressed,
    this.tag,
    this.selected,
  });

  final String title;
  final String? hintText;
  final void Function() onPressed;
  final GamingCurrencyModel? selected;
  final FaqTag? tag;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (tag != null)
          buildTitle(
            title,
            context,
            tag: tag!,
          )
        else
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
