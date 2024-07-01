import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';

import '../../../common/api/base/base_api.dart';

class GamingGameList extends StatefulWidget {
  const GamingGameList({
    super.key,
    required this.builder,
    required this.total,
    this.runSpacing,
    this.spacing,
    this.itemWidth,
    this.itemHeight,
  });

  final int total;
  final double? itemWidth;
  final double? itemHeight;
  final double? runSpacing;
  final double? spacing;
  final Widget Function(BuildContext, int) builder;

  @override
  State<GamingGameList> createState() => _GamingGameListState();
}

class _GamingGameListState extends State<GamingGameList> {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(left: 12.dp),
      width: double.infinity,
      child: Wrap(
        runSpacing: widget.runSpacing ?? 10.dp,
        spacing: widget.spacing ?? 6.dp,
        children: List.generate(
          widget.total,
          (index) {
            final width = widget.itemWidth ?? ((Get.width - 36.dp) / 3);
            final height = widget.itemHeight ?? (width * 1.33);
            return SizedBox(
              width: width.ceilToDouble(),
              height: height.ceilToDouble(),
              child: widget.builder(context, index),
            );
          },
        ),
      ),
    );
  }
}
