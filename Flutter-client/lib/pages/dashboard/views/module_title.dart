import 'package:flutter/material.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

class DashboardModuleContainer extends StatelessWidget {
  const DashboardModuleContainer({
    super.key,
    required this.child,
  });
  final Widget child;
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 16.dp),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(4.dp),
        color: GGColors.moduleBackground.color,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            offset: Offset(0, 3.dp),
            blurRadius: 8.dp,
          )
        ],
      ),
      child: child,
    );
  }
}

class DashboardModuleTitle extends StatelessWidget {
  const DashboardModuleTitle({
    super.key,
    required this.title,
    this.subTitle,
    this.onPressed,
    this.hasDivider = false,
  });
  final String title;
  final String? subTitle;
  final void Function()? onPressed;
  final bool hasDivider;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.vertical(top: Radius.circular(4.dp)),
            color: GGColors.moduleBackground.color,
          ),
          child: Row(
            children: [
              Container(
                padding:
                    EdgeInsets.symmetric(horizontal: 16.dp, vertical: 16.dp),
                child: Text(
                  title,
                  style: GGTextStyle(
                    fontSize: GGFontSize.smallTitle,
                    fontWeight: GGFontWeigh.bold,
                    color: GGColors.textMain.color,
                  ),
                ),
              ),
              const Spacer(),
              ScaleTap(
                opacityMinValue: 0.8,
                scaleMinValue: 0.98,
                onPressed: onPressed,
                child: Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: 16.dp,
                    vertical: 16.dp,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      if (subTitle != null)
                        Container(
                          margin: EdgeInsets.only(right: 16.dp),
                          child: Text(
                            subTitle!,
                            style: GGTextStyle(
                              fontSize: GGFontSize.hint,
                              color: GGColors.brand.color,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                      if (onPressed != null)
                        SvgPicture.asset(
                          R.iconArrowRight,
                          width: 14.dp,
                          height: 14.dp,
                          color: GGColors.textMain.color,
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        if (hasDivider)
          Divider(
            indent: 16.dp,
            endIndent: 16.dp,
            thickness: 1.dp,
            height: 1.dp,
            color: GGColors.border.color,
          ),
      ],
    );
  }
}
