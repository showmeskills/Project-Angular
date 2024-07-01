import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/pages/home/views/home_swiper.dart';
import 'package:gogaming_app/pages/home/views/home_swiper_builder.dart';
import 'package:gogaming_app/widget_header.dart';

import '../models/game_order_detail_layout.dart';
import 'game_order_detail_row.dart';

class GameOrderDetailSport extends StatelessWidget {
  const GameOrderDetailSport({
    Key? key,
    required this.bunchList,
    required this.selectedIndex,
    this.controller,
    required this.pressItem,
    required this.scrollEnd,
    this.itemSizeChange,
  }) : super(key: key);

  // 串单列表
  final List<GameOrderDetailBunchLayout> bunchList;
  final int selectedIndex;
  final HomeSwiperController? controller;
  final void Function(int index) pressItem;
  final void Function(Size size)? itemSizeChange;
  final void Function() scrollEnd;

  @override
  Widget build(BuildContext context) {
    if (bunchList.isEmpty) return const SizedBox();
    if (bunchList.length == 1) {
      return _buildSingle();
    } else {
      return _buildMulti();
    }
  }

  Widget _buildMulti() {
    final index = selectedIndex;
    final bunch = bunchList[index];
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(height: 8.dp),
        Stack(
          children: [
            _buildMultiContent(index, bunch),
            Positioned(top: 0, left: 0, right: 0, child: _buildSection()),
          ],
        ),
        Gaps.vGap8,
      ],
    );
  }

  Widget _buildMultiContent(int index, GameOrderDetailBunchLayout bunch) {
    return Container(
      margin: EdgeInsetsDirectional.only(top: 39.dp), //留下注单的空间
      padding: EdgeInsetsDirectional.only(top: 17.dp, bottom: 17.dp),
      decoration: BoxDecoration(
        border: Border.all(color: GGColors.border.color, width: 1),
        borderRadius: BorderRadius.only(
          topLeft: index % (controller?.mainAxisCount ?? 4) == 0
              ? Radius.zero
              : Radius.circular(3.dp),
          topRight: Radius.circular(3.dp),
          bottomLeft: Radius.circular(3.dp),
          bottomRight: Radius.circular(3.dp),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: bunch.valueLayouts
            .map(
              (e) => GameOrderDetailRow(
                layout: e,
                padding: EdgeInsetsDirectional.only(
                  start: 16.dp,
                  end: 16.dp,
                  top: 7.dp,
                  bottom: 7.dp,
                ),
              ),
            )
            .toList(),
      ),
    );
  }

  Widget _buildSection() {
    return NotificationListener(
      onNotification: (notification) {
        if (notification is ScrollEndNotification) {
          controller?.canPrevious = notification.metrics.pixels > 0;
          controller?.canNext = (notification.metrics.maxScrollExtent -
                      notification.metrics.pixels)
                  .abs() >
              1;
          scrollEnd();
        }
        return true;
      },
      child: Row(
        children: [
          Expanded(
            child: HomeSwiperBuilder(
              height: 40.dp,
              padding: EdgeInsets.zero,
              itemPadding: EdgeInsets.zero,
              controller: controller!,
              builder: (ctx, index) {
                final bunch = bunchList[index];
                bool isSelected = index == selectedIndex;
                final borderSide = BorderSide(
                  width: 1,
                  color: GGColors.border.color,
                );
                return MeasureSize(
                  onChange: (Size size, Offset globalOffset) {
                    if (itemSizeChange != null) {
                      itemSizeChange!(size);
                    }
                  },
                  child: InkWell(
                    child: Container(
                      // padding: EdgeInsets.only(left: 13.dp, right: 13.dp),
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color:
                            isSelected ? GGColors.alertBackground.color : null,
                        border: isSelected
                            ? Border(
                                top: borderSide,
                                left: borderSide,
                                right: borderSide,
                              )
                            : null,
                      ),
                      child: Text(
                        bunch.nameText,
                        style: GGTextStyle(
                          color: isSelected
                              ? GGColors.highlightButton.color
                              : GGColors.textSecond.color,
                          fontSize: GGFontSize.content,
                        ),
                      ),
                    ),
                    onTap: () {
                      pressItem(index);
                    },
                  ),
                );
              },
            ),
          ),
          SizedBox(width: 22.dp),
          _buildPageButton(),
        ],
      ),
    );
  }

  Widget _buildPageButton() {
    final controller = this.controller;
    if (controller == null) return const SizedBox();
    return SizedBox(
      width: 44.dp,
      child: Row(
        children: [
          Expanded(
            child: Obx(
              () => GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: controller.canPrevious
                    ? () {
                        controller.previousPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.linear,
                        );
                      }
                    : null,
                child: Center(
                  child: SvgPicture.asset(
                    R.iconArrowLeft,
                    width: 14.dp,
                    height: 14.dp,
                    color: controller.canPrevious
                        ? GGColors.textSecond.color
                        : GGColors.border.color,
                  ),
                ),
              ),
            ),
          ),
          Expanded(
            child: Obx(
              () => GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: controller.canNext
                    ? () {
                        controller.nextPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.linear,
                        );
                      }
                    : null,
                child: Center(
                    child: SvgPicture.asset(
                  R.iconArrowRight,
                  width: 14.dp,
                  height: 14.dp,
                  color: controller.canNext
                      ? GGColors.textSecond.color
                      : GGColors.border.color,
                )),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSingle() {
    final bunch = bunchList.first;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: bunch.valueLayouts
          .map(
            (e) => GameOrderDetailRow(layout: e),
          )
          .toList(),
    );
  }
}
