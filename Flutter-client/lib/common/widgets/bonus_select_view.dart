import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/bonus/models/gaming_bonus_activity_model.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/widget_header.dart';

class BonusSelectView extends StatelessWidget {
  const BonusSelectView({
    super.key,
    required this.hiddenTitle,
    required this.bonusLoading,
    required this.showMinDeposit,
    this.selected,
    this.onPressed,
  });
  final bool hiddenTitle;
  final bool bonusLoading;
  final bool showMinDeposit;

  final GamingBonusActivityModel? selected;
  final void Function()? onPressed;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap12,
        Visibility(
          visible: !hiddenTitle,
          child: Padding(
            padding: EdgeInsets.only(bottom: 4.dp),
            child: buildSubTitle(localized('select_bonus'), context),
          ),
        ),
        GamingSelectorWidget(
          onPressed: onPressed,
          padding: EdgeInsets.symmetric(
            vertical: 17.dp,
            horizontal: 14.dp,
          ),
          iconColor: GGColors.textSecond.color,
          builder: (context) {
            if (bonusLoading) {
              return Row(
                children: [
                  GoGamingLoading(
                    size: 14.dp,
                    alignment: Alignment.centerLeft,
                    color: GGColors.textMain,
                  ),
                  // 为了和正常文字高度对齐，使用空text占位
                  Text(
                    '',
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textHint.color,
                    ),
                  )
                ],
              );
            }
            if (selected == null) {
              return Text(
                localized('select_bonus_act'),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textHint.color,
                ),
              );
            }
            return Text(
              selected!.description,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
              ),
            );
          },
        ),
        Builder(
          builder: (context) {
            if (selected?.minDeposit != null && showMinDeposit) {
              return Container(
                alignment: Alignment.centerRight,
                margin: EdgeInsets.only(top: 6.dp),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Flexible(
                      child: Text(
                        '${localized('mini_deposit')} ${selected!.minDeposit!.toStringAsFixed(2)}',
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textSecond.color,
                        ),
                      ),
                    ),
                    Gaps.hGap4,
                    GamingImage.network(
                      url: CurrencyService.sharedInstance.getIconUrl('USDT'),
                      width: 14.dp,
                      height: 14.dp,
                    )
                  ],
                ),
              );
            } else {
              return Gaps.empty;
            }
          },
        ),
      ],
    );
  }

  Widget buildSubTitle(String title, BuildContext context) {
    return Container(
      constraints: BoxConstraints(
          maxWidth: (MediaQuery.of(context).size.width - 32.dp) / 3),
      child: Text(
        title,
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.textSecond.color,
        ),
      ),
    );
  }
}
