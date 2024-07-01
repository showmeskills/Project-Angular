import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/go_gaming_maintaining.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

class GoGamingEmpty extends StatelessWidget {
  const GoGamingEmpty({
    Key? key,
    this.icon,
    this.text,
    this.maint = false,
  }) : super(key: key);

  final String? icon;
  final String? text;
  final bool maint;

  @override
  Widget build(BuildContext context) {
    if (maint) {
      return GoGamingMaintaining(
        text: text,
      );
    }
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Image.asset(
            icon ?? R.commonEmpty,
            height: 80.dp,
          ),
          Gaps.vGap20,
          Text(
            text ?? localized('no_record'),
            style: GGTextStyle(
              fontSize: GGFontSize.smallTitle,
              color: GGColors.textSecond.color,
            ),
          ),
          Gaps.vGap20,
        ],
      ),
    );
  }
}
