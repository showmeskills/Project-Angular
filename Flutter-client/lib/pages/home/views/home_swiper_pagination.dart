// ignore_for_file: depend_on_referenced_packages

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/gaming_game_label_icon.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

import 'home_swiper.dart';

class HomeSwiperPagination extends StatelessWidget {
  const HomeSwiperPagination({
    super.key,
    this.iconName,
    this.iconBuilder,
    required this.title,
    required this.controller,
    this.padding,
    this.onPressedTitle,
  });

  final String? iconName;
  final Widget Function()? iconBuilder;
  final String title;
  final HomeSwiperController controller;
  final EdgeInsets? padding;
  final VoidCallback? onPressedTitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding ?? EdgeInsets.symmetric(horizontal: 12.dp),
      child: Row(
        children: [
          _buildTitleContent(),
          Gaps.hGap4,
          Config.isM1 ? _buildContentM1() : _buildContentM2(),
        ],
      ),
    );
  }

  Widget _buildContentM2() {
    return SizedBox(
      height: 38.dp,
      // width: 104.dp,
      // decoration: ShapeDecoration(
      //   shape: const StadiumBorder(
      //       // side: BorderSide(
      //       //   color: GGColors.border.color,
      //       //   width: 1.dp,
      //       // ),
      //       ),
      //   color: GGColors.darkPopBackground.color.withOpacity(0.8),
      // ),
      child: Row(
        children: [
          Obx(
            () => ScaleTap(
              opacityMinValue: 1,
              overlayColor: GGColors.link.color,
              borderRadius: BorderRadius.horizontal(
                left: Radius.circular(19.dp),
              ),
              onPressed: controller.canPrevious
                  ? () {
                      controller.previousPage(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.linear,
                      );
                    }
                  : null,
              child: Ink(
                height: 38.dp,
                width: 51.dp,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.horizontal(
                    left: Radius.circular(19.dp),
                  ),
                  color: GGColors.darkPopBackground.color.withOpacity(0.8),
                ),
                child: Center(
                  child: SvgPicture.asset(
                    R.iconArrowLeftAlt,
                    width: 14.dp,
                    height: 14.dp,
                    color: controller.canPrevious
                        ? GGColors.textSecondDay.color
                        : GGColors.textSecondDay.color.withOpacity(0.5),
                  ),
                ),
              ),
            ),
          ),
          Container(
            width: 2.dp,
            height: double.infinity,
            decoration: BoxDecoration(
              color: GGColors.transparent.color,
            ),
          ),
          Obx(
            () => ScaleTap(
              opacityMinValue: 1,
              overlayColor: GGColors.link.color,
              borderRadius: BorderRadius.horizontal(
                right: Radius.circular(19.dp),
              ),
              onPressed: controller.canNext
                  ? () {
                      controller.nextPage(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.linear,
                      );
                    }
                  : null,
              child: Ink(
                height: 38.dp,
                width: 51.dp,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.horizontal(
                    right: Radius.circular(19.dp),
                  ),
                  color: GGColors.darkPopBackground.color.withOpacity(0.8),
                ),
                child: Center(
                  child: SvgPicture.asset(
                    R.iconArrowRightAlt,
                    width: 14.dp,
                    height: 14.dp,
                    color: controller.canNext
                        ? GGColors.textSecondDay.color
                        : GGColors.textSecondDay.color.withOpacity(0.5),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContentM1() {
    return Container(
      height: 38.dp,
      width: 104.dp,
      decoration: ShapeDecoration(
        shape: StadiumBorder(
          side: BorderSide(
            color: GGColors.border.color,
            width: 1.dp,
          ),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Obx(
              () => ScaleTap(
                opacityMinValue: 0.8,
                scaleMinValue: 0.98,
                onPressed: controller.canPrevious
                    ? () {
                        controller.previousPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.linear,
                        );
                      }
                    : null,
                child: Center(
                  child: SvgPicture.asset(
                    R.iconArrowLeftAlt,
                    width: 14.dp,
                    height: 14.dp,
                    color: controller.canPrevious
                        ? GGColors.textSecond.color
                        : GGColors.textSecond.color.withOpacity(0.5),
                  ),
                ),
              ),
            ),
          ),
          Container(
            width: 1.dp,
            height: double.infinity,
            decoration: BoxDecoration(
              color: GGColors.border.color,
            ),
          ),
          Expanded(
            child: Obx(
              () => ScaleTap(
                opacityMinValue: 0.8,
                scaleMinValue: 0.98,
                onPressed: controller.canNext
                    ? () {
                        controller.nextPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.linear,
                        );
                      }
                    : null,
                child: Center(
                    child: SvgPicture.asset(
                  R.iconArrowRightAlt,
                  width: 14.dp,
                  height: 14.dp,
                  color: controller.canNext
                      ? GGColors.textSecond.color
                      : GGColors.textSecond.color.withOpacity(0.5),
                )),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTitleContent() {
    return Expanded(
      child: ScaleTap(
        scaleMinValue: 0.98,
        opacityMinValue: 0.8,
        onPressed: () => onPressedTitle?.call(),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (iconName?.isNotEmpty == true || iconBuilder != null) ...[
              iconBuilder?.call() ??
                  GamingGameLabelIcon(
                    iconName: iconName ?? '',
                    size: 18.dp,
                  ),
              Gaps.hGap4,
            ],
            Expanded(
              child: Text(
                title,
                style: GGTextStyle(
                  fontSize: GGFontSize.bigTitle,
                  fontWeight: GGFontWeigh.bold,
                  color: GGColors.textMain.color,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
