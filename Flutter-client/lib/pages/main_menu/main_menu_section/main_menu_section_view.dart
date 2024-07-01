import 'package:configurable_expansion_tile_null_safety/configurable_expansion_tile_null_safety.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/config/config.dart';

import '../../../common/theme/colors/go_gaming_colors.dart';
import '../../../common/theme/text_styles/gg_text_styles.dart';
import '../../../generated/r.dart';

class MainMenuSection extends StatefulWidget {
  const MainMenuSection({
    Key? key,
    required this.title,
    this.initiallyExpanded = false,
    this.enableExpand = true,
    this.children = const <Widget>[],
    this.onTap,
  }) : super(key: key);
  final String title;
  final bool initiallyExpanded;
  final bool enableExpand;
  final List<Widget> children;
  final GestureTapCallback? onTap;

  @override
  State createState() => _MainMenuSectionState();
}

class _MainMenuSectionState extends State<MainMenuSection>
    with SingleTickerProviderStateMixin {
  late Animation<double>? arrowTurns;
  late AnimationController? arrowController;

  @override
  void initState() {
    arrowController = AnimationController(
        duration: const Duration(milliseconds: 200), vsync: this);
    arrowTurns = arrowController?.drive(Tween<double>(begin: 0.0, end: -0.25)
        .chain(CurveTween(curve: Curves.easeIn)));
    if (widget.initiallyExpanded) {
      arrowController?.forward();
    }
    super.initState();
  }

  @override
  void dispose() {
    arrowController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.enableExpand) {
      return GestureDetector(
        onTap: widget.onTap,
        child: SizedBox(
          height: 42.dp,
          child: Row(
            children: [
              SizedBox(width: 24.dp),
              Text(
                widget.title,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                  fontWeight: GGFontWeigh.bold,
                ),
              ),
              const Spacer(),
            ],
          ),
        ),
      );
    }
    return ConfigurableExpansionTile(
      childrenBody: Column(
        mainAxisSize: MainAxisSize.min,
        children: widget.children,
      ),
      header: (bool isExpanded, Animation<double> iconTurns,
          Animation<double> heightFactor) {
        return Expanded(
          child: SizedBox(
            height: 42.dp,
            child: Row(
              children: [
                SizedBox(width: 24.dp),
                Text(
                  widget.title,
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: Config.isM1
                        ? GGColors.textMain.color
                        : GGColors.menuAppBarIconColor.color,
                    fontWeight: GGFontWeigh.bold,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: EdgeInsets.only(right: 24.dp),
                  child: RotationTransition(
                    turns: arrowTurns!,
                    child: SvgPicture.asset(
                      R.iconAppbarLeftLeading,
                      width: 14.dp,
                      height: 14.dp,
                      color: Config.isM1
                          ? GGColors.textSecond.color
                          : GGColors.textSecond.night,
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
      onExpansionChanged: (value) {
        if (value == true) {
          arrowController?.forward();
        } else {
          arrowController?.reverse();
        }
      },
      initiallyExpanded: widget.initiallyExpanded,
    );
  }
}
