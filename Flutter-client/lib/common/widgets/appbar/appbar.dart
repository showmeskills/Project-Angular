// ignore_for_file: avoid_unnecessary_containers

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/service/gaming_tag_service/gaming_tag_service.dart';
import 'package:gogaming_app/common/widgets/gaming_close_button.dart';
import 'package:gogaming_app/common/widgets/header/gg_user_app_bar.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/config/environment.dart';
import 'package:gogaming_app/widget_header.dart';

class GGAppBar {
  static AppBar normal({
    List<Widget>? actions,
    String? title,
    Widget? titleWidget,
    Widget? leadingIcon,
    double? leadingWidth,
    GGTextStyle? titleStyle,
    PreferredSizeWidget? bottomWidget,
    Color? backgroundColor,
    Key? key,
    int? navKey,
    bool centerTitle = true,
  }) {
    return AppBar(
      key: key,
      backgroundColor: backgroundColor ?? GGColors.background.color,
      // systemOverlayStyle: ThemeManager.shareInstacne.isDarkMode
      //     ? SystemUiOverlayStyle.light
      //     : SystemUiOverlayStyle.dark,
      title: Container(
        child: titleWidget ??
            Text(
              title ?? '',
              style: GGTextStyle(
                fontSize: GGFontSize.bigTitle20,
                color: GGColors.textMain.color,
              ).merge(titleStyle),
            ),
      ),
      toolbarHeight: 60.dp,
      leadingWidth: leadingWidth ?? 50.dp,
      titleSpacing: 0,
      leading: leadingIcon ??
          GamingBackButton(
            padding: EdgeInsets.symmetric(
              horizontal: 16.dp,
              vertical: 16.dp,
            ),
          ),
      actions: [Row(children: actions ?? [])],
      bottomOpacity: bottomWidget != null ? 1.0 : 0.0,
      elevation: 0.0,
      bottom: bottomWidget,
      centerTitle: centerTitle,
    );
  }

  static PreferredSize userAppbar() {
    String? appVersionNumber;
    if (Config.currentConfig.environment != Environment.product &&
        !Config.versionName.contains('#')) {
      appVersionNumber = Config.versionName;
    }
    return PreferredSize(
      preferredSize: Size.fromHeight(
          60.dp + (GamingTagService.sharedInstance.hasNavigation ? 40.dp : 0)),
      child: GGUserAppBar(appVersionNumber: appVersionNumber),
    );
  }

  static PreferredSize userBottomAppbar({
    String? title,
    Widget? titleWidget,
    GGTextStyle? titleStyle,
    Widget? leadingIcon,
    List<Widget>? trailingWidgets,
    Widget? bottomWidget,
    Color? bottomBackgroundColor,
    double? bottomHeight,
    Color? bottomLineColor,
    int? navKey,
    VoidCallback? onBackPressed,
  }) {
    String? appVersionNumber;
    if (Config.currentConfig.environment != Environment.product &&
        !Config.versionName.contains('#')) {
      appVersionNumber = Config.versionName;
    }
    final appbarHeight =
        60.dp + (GamingTagService.sharedInstance.hasNavigation ? 40.dp : 0);
    final appBar = Container(
      height: appbarHeight,
      margin: const EdgeInsets.only(bottom: 4),
      child: GGUserAppBar(
        appVersionNumber: appVersionNumber,
        // boxShadow: const [],
      ),
    );
    return PreferredSize(
        preferredSize: Size.fromHeight(appbarHeight + (bottomHeight ?? 58.dp)),
        child: Container(
          decoration: BoxDecoration(
            color: GGColors.userBarBackground.color,
          ),
          child: SafeArea(
            child: Column(
              children: [
                appBar,
                Expanded(
                  child: bottomWidget ??
                      Material(
                        color: bottomBackgroundColor ??
                            GGColors.userBarBackground.color,
                        child: SizedBox(
                          width: double.infinity,
                          height: 58.dp,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  leadingIcon ??
                                      GamingBackButton(
                                        onPressed: onBackPressed,
                                        padding: EdgeInsets.symmetric(
                                          horizontal: 16.dp,
                                          vertical: 16.dp,
                                        ),
                                      ),
                                  ConstrainedBox(
                                    constraints: BoxConstraints(
                                        maxWidth:
                                            title != null ? 263.dp : 320.dp),
                                    child: titleWidget ??
                                        Text(
                                          title ?? '',
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: GGTextStyle(
                                            fontSize: GGFontSize.bigTitle20,
                                            color: GGColors.textMain.color,
                                            fontWeight: GGFontWeigh.bold,
                                          ).merge(titleStyle),
                                        ),
                                  ),
                                ],
                              ),
                              Expanded(
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.end,
                                  children: trailingWidgets ?? [],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                ),
                if (bottomLineColor != null)
                  Container(
                    color: bottomLineColor,
                    width: double.infinity,
                    height: 1,
                  ),
              ],
            ),
          ),
        ));
  }
}
