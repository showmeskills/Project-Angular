import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/widget_header.dart';

const String obscureFundText = '*****';

class WalletHomeItemView extends StatelessWidget {
  const WalletHomeItemView({
    Key? key,
    required this.name,
    required this.balance,
    required this.subTitle,
    required this.onPress,
    required this.obscureFund,
  }) : super(key: key);

  final String name;
  final String balance;
  final String subTitle;
  final void Function() onPress;
  final bool obscureFund;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsetsDirectional.only(
        top: 8.dp,
        start: 16.dp,
        end: 16.dp,
      ),
      child: InkWell(
        onTap: onPress,
        borderRadius: BorderRadius.circular(4.dp),
        child: Ink(
          padding: EdgeInsetsDirectional.all(20.dp),
          decoration: BoxDecoration(
            color: GGColors.moduleBackground.color,
            borderRadius: BorderRadius.circular(4.dp),
            border: Border.all(
              color: ThemeManager.shareInstacne.isDarkMode
                  ? GGColors.transparent.color
                  : GGColors.border.color,
              width: 1.dp,
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0x0D000000),
                blurRadius: 6.dp,
                offset: Offset(0, 3.dp),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildName(),
              Gaps.vGap20,
              _buildBalance(),
              Gaps.vGap20,
              _buildSubTitle(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSubTitle() {
    return Row(
      children: [
        Expanded(
          child: Text(
            subTitle,
            style: GGTextStyle(
              fontSize: GGFontSize.hint,
              color: GGColors.textSecond.color,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBalance() {
    return Row(
      crossAxisAlignment:
          obscureFund ? CrossAxisAlignment.center : CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.ideographic,
      children: [
        Text(
          obscureFund ? obscureFundText : balance,
          style: GGTextStyle(
            fontSize: GGFontSize.bigTitle20,
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
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color,
            // fontWeight: GGFontWeigh.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildName() {
    return Row(
      children: [
        SvgPicture.asset(R.iconWalletHome, width: 14.dp, height: 14.dp),
        Gaps.hGap8,
        Text(
          name,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color,
          ),
        ),
      ],
    );
  }
}
