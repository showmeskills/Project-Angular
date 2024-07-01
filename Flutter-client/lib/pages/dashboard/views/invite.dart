import 'package:flutter/material.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/helper/url_scheme_util.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../common/service/web_url_service/web_url_model.dart';
import '../../../common/service/web_url_service/web_url_service.dart';

class DashboardInvite extends StatelessWidget {
  const DashboardInvite({super.key});

  @override
  Widget build(BuildContext context) {
    return ScaleTap(
      opacityMinValue: 0.8,
      scaleMinValue: 0.98,
      onPressed: () {
        UrlSchemeUtil.navigateTo(
            WebUrlService.url(WebUrl.referralHome.toTarget()),
            title: localized('earn_comm'),
            ignoreToken: false);
      },
      child: Container(
        margin: EdgeInsets.symmetric(horizontal: 16.dp),
        padding: EdgeInsets.all(16.dp),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: Config.isM1
                ? [
                    const Color(0xFFFE8869),
                    const Color(0xFFF04E23),
                  ]
                : [
                    const Color(0xFFDD6A66),
                    const Color(0xFFC70700),
                  ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
          borderRadius: BorderRadius.circular(4.dp),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                localized('earn_reb'),
                style: GGTextStyle(
                  fontSize: GGFontSize.smallTitle,
                  color: GGColors.buttonTextWhite.color,
                  fontWeight: GGFontWeigh.bold,
                ),
              ),
            ),
            SvgPicture.asset(
              R.iconArrowRight,
              width: 14.dp,
              height: 14.dp,
              color: GGColors.buttonTextWhite.color,
            ),
          ],
        ),
      ),
    );
  }
}
