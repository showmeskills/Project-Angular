import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingGameListFooter extends StatefulWidget {
  const GamingGameListFooter({
    super.key,
    this.progressName,
    this.onPressedMore,
    this.progressValue = 0.0,
    this.hiddenMoreButton = false,
  });

  final String? progressName;
  final bool hiddenMoreButton;
  final double progressValue;
  final VoidCallback? onPressedMore;

  @override
  State<GamingGameListFooter> createState() => _GamingGameListFooterState();
}

class _GamingGameListFooterState extends State<GamingGameListFooter> {
  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: 188.dp,
          child: LinearProgressIndicator(
            value: widget.progressValue,
            minHeight: 2.dp,
            backgroundColor: GGColors.border.color,
            valueColor: AlwaysStoppedAnimation(GGColors.brand.color),
          ),
        ),
        Gaps.vGap8,
        Visibility(
          visible: widget.progressName?.isNotEmpty ?? false,
          child: Padding(
            padding: EdgeInsets.symmetric(vertical: 8.dp),
            child: Text(
              widget.progressName!,
              style: GGTextStyle(
                fontSize: GGFontSize.hint,
                color: GGColors.textSecond.color,
              ),
            ),
          ),
        ),
        if (widget.hiddenMoreButton) ...[
          Gaps.vGap10,
          SizedBox(
            width: 188.dp,
            height: 42.dp,
            child: GGButton(
              height: 42.dp,
              text: localized("load_m"),
              backgroundColor: GGColors.border.color,
              onPressed: () => widget.onPressedMore?.call(),
              textStyle: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
              ),
            ),
          ),
        ]
      ],
    );
  }
}
