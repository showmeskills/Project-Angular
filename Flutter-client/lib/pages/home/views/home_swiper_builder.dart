// ignore_for_file: no_leading_underscores_for_local_identifiers

import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';

import 'home_swiper.dart';

class HomeSwiperBuilder extends StatelessWidget {
  const HomeSwiperBuilder({
    super.key,
    this.aspectRatio = 1.33,
    required this.controller,
    required this.builder,
    this.padding,
    this.height,
    this.itemPadding,
  });

  final double aspectRatio;
  final double? height;
  final EdgeInsets? itemPadding;
  final EdgeInsets? padding;
  final Widget Function(BuildContext, int) builder;
  final HomeSwiperController controller;

  @override
  Widget build(BuildContext context) {
    final _itemPadding = itemPadding ?? EdgeInsets.symmetric(horizontal: 3.dp);
    return Padding(
      padding: padding ?? EdgeInsets.only(left: 9.dp, right: 9.dp),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final width =
              (constraints.maxWidth ~/ controller.mainAxisCount).toDouble();
          final height =
              this.height ?? (width - _itemPadding.horizontal) * aspectRatio;

          return SizedBox(
            height: height.ceilToDouble() * controller.crossAxisCount +
                10.dp * (controller.crossAxisCount - 1),
            child: ListView.builder(
              controller: controller,
              scrollDirection: Axis.horizontal,
              physics: const PageScrollPhysics(
                parent: ClampingScrollPhysics(),
              ),
              itemBuilder: (BuildContext context, int index) {
                final length =
                    controller.total >= (index + 1) * controller.limit
                        ? controller.limit
                        : controller.total - index * controller.limit;
                return SizedBox(
                  width: (length >= controller.mainAxisCount
                      ? constraints.maxWidth
                      : width * (length / controller.crossAxisCount).ceil()),
                  child: Wrap(
                    spacing: 10.dp,
                    direction: Axis.vertical,
                    children: List.generate(
                      length,
                      (index2) {
                        return Container(
                          padding: _itemPadding,
                          width: width,
                          height: height,
                          child: builder(
                            context,
                            index * controller.limit + index2,
                          ),
                        );
                      },
                    ),
                  ),
                );
              },
              itemCount: controller.pageCount,
            ),
          );
        },
      ),
    );
  }
}
