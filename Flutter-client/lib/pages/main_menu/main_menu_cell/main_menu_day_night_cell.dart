// ignore_for_file: prefer_const_constructors

import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/widget_header.dart';

class MainMenuDayNightCell extends StatefulWidget {
  const MainMenuDayNightCell({super.key});

  @override
  State<MainMenuDayNightCell> createState() => _MainMenuDayNightCellState();
}

class _MainMenuDayNightCellState extends State<MainMenuDayNightCell> {
  late ValueNotifier<bool> controller = ValueNotifier(isDarkMode);

  bool get isDarkMode => ThemeManager.shareInstacne.isDarkMode;

  @override
  void initState() {
    super.initState();
    controller.addListener(() {
      ThemeManager.shareInstacne.changeTheme(!controller.value);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsetsDirectional.only(start: 24.dp, end: 24.dp),
      height: 44.dp,
      child: Row(
        children: [
          Text(
            localized("day_m"),
            style: _titleStyle(disable: isDarkMode),
          ),
          Gaps.hGap8,
          AdvancedSwitch(
            activeChild: Image.asset(
              R.mainMenuNightMode,
              width: 15.dp,
              height: 15.dp,
            ),
            inactiveChild: Image.asset(
              R.mainMenuDayMode,
              width: 15.dp,
              height: 15.dp,
            ),
            activeColor:
                Config.isM1 ? GGColors.border.color : GGColors.border.night,
            inactiveColor:
                Config.isM1 ? GGColors.border.color : GGColors.border.night,
            width: 60.dp,
            controller: controller,
            thumb: Config.isM1
                ? null
                : Container(
                    decoration: BoxDecoration(
                      color: GGColors.link.night,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: GGColors.shadow.night,
                          blurRadius: 8.dp,
                        ),
                      ],
                    ),
                  ),
          ),
          Gaps.hGap8,
          Text(
            localized("night_m"),
            style: _titleStyle(disable: !isDarkMode),
          ),
        ],
      ),
    );
  }

  TextStyle _titleStyle({bool disable = false}) {
    return GGTextStyle(
      fontSize: GGFontSize.content,
      color: (Config.isM1 ? GGColors.textMain.color : GGColors.textMain.night)
          .withOpacity(disable ? 0.5 : 1.0),
      fontWeight: GGFontWeigh.bold,
    );
  }
}
