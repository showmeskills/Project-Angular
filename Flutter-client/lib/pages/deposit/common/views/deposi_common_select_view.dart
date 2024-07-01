import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_ui_mixin.dart';
import 'package:gogaming_app/widget_header.dart';

class DepositCommonSelectView extends StatelessWidget
    with DepositCommonUIMixin {
  const DepositCommonSelectView({
    super.key,
    this.onPressed,
    required this.builder,
  });

  final void Function()? onPressed;

  final Widget Function(BuildContext context) builder;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onPressed,
      child: buildContainer(
        child: Row(
          children: [
            Expanded(
              child: builder(context),
            ),
            SvgPicture.asset(
              R.iconDown,
              height: 7.dp,
              color: GGColors.textSecond.color,
            ),
          ],
        ),
      ),
    );
  }
}
