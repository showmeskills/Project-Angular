import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game_scenes_model.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game_scenes_model_extension.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/widget_header.dart';

import 'gg_bar_balance_controller.dart';

class GGBarNavigationView extends StatelessWidget
    implements PreferredSizeWidget {
  const GGBarNavigationView({super.key});

  GGBarNavigationController get controller =>
      Get.find<GGBarNavigationController>();

  @override
  Widget build(BuildContext context) {
    Get.put(GGBarNavigationController());
    return Container(
      alignment: Alignment.centerLeft,
      height: 40.dp,
      child: Obx(() {
        return TabBar(
          controller: controller.tabController,
          isScrollable: true,
          indicatorWeight: 0.dp,
          indicator: const BoxDecoration(),
          labelPadding: EdgeInsets.zero,
          overlayColor: MaterialStateProperty.all(GGColors.transparent.color),
          splashBorderRadius: BorderRadius.circular(4.dp),
          splashFactory: NoSplash.splashFactory,
          tabs: List.generate(controller.navigationMenus.length, (index) {
            final e = controller.navigationMenus[index];
            return _buildTabBarItem(e, index);
          }).toList(),
        );
      }),
    );
  }

  Widget _buildTabBarItem(GameScenseLeftMenus e, int index) {
    return Builder(builder: (ctx) {
      return ScaleTap(
        behavior: HitTestBehavior.opaque,
        scaleMinValue: 1.0,
        opacityMinValue: 1.0,
        onPressed: () {
          controller.selectMenu(ctx, index);
        },
        childBuilder: (p0) {
          return Obx(() {
            return Container(
              height: 40.dp,
              padding: EdgeInsets.symmetric(horizontal: 15.dp),
              decoration: BoxDecoration(
                color: index == controller.selectedMenuIndex.value
                    ? GGColors.darkBackground.color
                    : p0 > 0.5
                        ? GGColors.darkBackground.color.withOpacity(p0)
                        : null,
                borderRadius: BorderRadius.circular(4.dp),
              ),
              child: Row(
                children: [
                  Container(
                    padding: EdgeInsets.all(1.dp),
                    child: GamingImage.network(
                      url: index == controller.selectedMenuIndex.value ||
                              p0 > 0.5
                          ? e.icon
                          : e.menuIcon,
                      width: 16.dp,
                      height: 16.dp,
                    ),
                  ),
                  Gaps.hGap8,
                  Text(
                    e.name ?? '',
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: index == controller.selectedMenuIndex.value
                          ? GGColors.brand.color
                          : p0 > 0.5
                              ? GGColors.brand.color.withOpacity(p0)
                              : GGColors.textMain.color,
                      fontWeight: GGFontWeigh.bold,
                    ),
                  ),
                  if (e.infoExpandList?.isNotEmpty ?? false)
                    Container(
                      margin: EdgeInsets.only(left: 8.dp),
                      child: AnimatedRotation(
                        turns: index == controller.selectedMenuIndex.value
                            ? -0.5
                            : 0,
                        duration: const Duration(milliseconds: 200),
                        child: GamingImage.asset(
                          R.iconArrowDown,
                          width: 14.dp,
                          height: 14.dp,
                          color: index == controller.selectedMenuIndex.value
                              ? GGColors.brand.color
                              : p0 > 0.5
                                  ? GGColors.brand.color.withOpacity(p0)
                                  : GGColors.textSecond.color,
                        ),
                      ),
                    ),
                ],
              ),
            );
          });
        },
      );
    });
  }

  @override
  Size get preferredSize => Size.fromHeight(40.dp);
}

class GGBarSecondNavigationView extends StatelessWidget {
  const GGBarSecondNavigationView({
    super.key,
    required this.width,
    required this.items,
  });
  final double width;
  final List<GameScenseHeaderMenuItem> items;

  GGBarNavigationController get controller =>
      Get.find<GGBarNavigationController>();

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(top: 2.dp),
      width: width,
      decoration: BoxDecoration(
        color: GGColors.menuBackground.color,
        borderRadius: BorderRadius.circular(4.dp),
      ),
      constraints: BoxConstraints(
        maxHeight: 200.dp,
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: items.map((e) {
            return ScaleTap(
              behavior: HitTestBehavior.opaque,
              scaleMinValue: 1.0,
              opacityMinValue: 1.0,
              onPressed: () {
                e.navigateTo(replace: true);
                controller.closeSecondMenu();
              },
              childBuilder: (p0) {
                return Container(
                  padding: EdgeInsets.symmetric(
                    vertical: 13.dp,
                    horizontal: 8.dp,
                  ),
                  child: Text(
                    e.labelName ?? '',
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: p0 > 0.5
                          ? GGColors.brand.color.withOpacity(p0)
                          : GGColors.textMain.color,
                    ),
                  ),
                );
              },
            );
          }).toList(),
        ),
      ),
    );
  }
}
