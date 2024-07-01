import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/config/gaps.dart';

import '../../../common/theme/colors/go_gaming_colors.dart';
import '../../../common/theme/text_styles/gg_text_styles.dart';

class MainMenuCell extends StatelessWidget {
  const MainMenuCell({
    Key? key,
    this.title = '',
    this.iconPath = '',
    this.textColor,
    this.fontWeight,
    this.badgeNumber = 0,
    this.showBottomLine = false,
    this.enable = true,
    this.onPressed,
  }) : super(key: key);

  final String title;
  final String iconPath;
  final int badgeNumber;
  final bool showBottomLine;
  final Color? textColor;
  final GGFontWeigh? fontWeight;
  final bool enable;
  final void Function()? onPressed;

  Widget _image() {
    if (iconPath.startsWith('assets/')) {
      if (iconPath.endsWith(".svg")) {
        return SvgPicture.asset(
          iconPath,
          width: 14.dp,
          height: 14.dp,
          color: Config.isM1
              ? GGColors.textSecond.color
              : GGColors.textSecond.night,
          fit: BoxFit.contain,
        );
      } else {
        return Image.asset(
          iconPath,
          width: 14.dp,
          height: 14.dp,
          fit: BoxFit.contain,
        );
      }
    } else {
      return GamingImage.network(
        url: iconPath,
        fit: BoxFit.contain,
        width: 14.dp,
        height: 14.dp,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: enable
          ? () {
              onPressed?.call();
            }
          : null,
      child: Opacity(
        opacity: enable ? 1.0 : 0.5,
        child: Padding(
          padding: EdgeInsetsDirectional.only(start: 24.dp, end: 24.dp),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  SizedBox(height: 44.dp),
                  _image(),
                  Gaps.hGap8,
                  Text(
                    title,
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: textColor ??
                          (Config.isM1
                              ? GGColors.textMain.color
                              : GGColors.menuAppBarIconColor.night),
                      fontWeight: fontWeight ?? GGFontWeigh.medium,
                    ),
                  ),
                  if (badgeNumber > 0) Gaps.hGap4,
                  if (badgeNumber > 0)
                    Padding(
                      padding: EdgeInsets.only(right: 15.dp),
                      child: Container(
                        padding: EdgeInsets.symmetric(
                            vertical: 2, horizontal: badgeNumber < 10 ? 6 : 10),
                        decoration: BoxDecoration(
                          borderRadius:
                              BorderRadius.all(Radius.circular(10.0.dp)),
                          color: Config.isM1
                              ? GGColors.link.color
                              : GGColors.brand.night,
                        ),
                        child: Text(
                          "$badgeNumber",
                          style: const TextStyle(
                              color: Colors.white, fontSize: 12),
                        ),
                      ),
                    ),
                ],
              ),
              if (showBottomLine)
                Container(
                  height: 1.dp,
                  color: Config.isM1
                      ? GGColors.border.color
                      : GGColors.border.night,
                  margin: EdgeInsets.symmetric(vertical: 7.dp),
                )
            ],
          ),
        ),
      ),
    );
  }

  MainMenuCell copyWith({
    String? title,
    String? iconPath,
    Color? textColor,
    GGFontWeigh? fontWeight,
    int? badgeNumber,
    bool? showBottomLine,
    bool? enable,
    void Function()? onPressed,
  }) {
    return MainMenuCell(
      title: title ?? this.title,
      iconPath: iconPath ?? this.iconPath,
      textColor: textColor ?? this.textColor,
      fontWeight: fontWeight ?? this.fontWeight,
      badgeNumber: badgeNumber ?? this.badgeNumber,
      showBottomLine: showBottomLine ?? this.showBottomLine,
      enable: enable ?? this.enable,
      onPressed: onPressed ?? this.onPressed,
    );
  }
}
