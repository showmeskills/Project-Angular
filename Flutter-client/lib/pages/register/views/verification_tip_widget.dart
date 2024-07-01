import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';
import 'package:gogaming_app/common/theme/text_styles/gg_text_styles.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/router/app_pages.dart';

import '../../../common/api/base/base_api.dart';

class VerificationTipWidget extends StatefulWidget {
  const VerificationTipWidget({super.key});

  @override
  State<VerificationTipWidget> createState() => _VerificationState();
}

class _VerificationState extends State<VerificationTipWidget> {
  int selectedIndex = 1;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: GGColors.alertBackground.color,
        borderRadius: BorderRadius.circular(4.dp),
      ),
      constraints: BoxConstraints(
        minHeight: 200.dp,
      ),
      width: double.infinity - 104.dp,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          SizedBox(
            height: 40.dp,
          ),
          _title(),
          SizedBox(
            height: 16.dp,
          ),
          _content(),
          SizedBox(
            height: 16.dp,
          ),
          _moreWidget(),
          SizedBox(
            height: 16.dp,
          ),
          _bottom(context),
          SizedBox(
            height: 40.dp,
          ),
        ],
      ),
    );
  }

  Widget _moreWidget() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        imageLeft(),
        imageRight(),
      ],
    );
  }

  Widget imageLeft() {
    return GestureDetector(
      onTap: () {
        selectedIndex = 1;
        setState(() {});
      },
      child: Container(
        width: 140.dp,
        height: 150.dp,
        color: Colors.transparent,
        child: Stack(
          alignment: Alignment.center,
          children: [
            Visibility(
              visible: selectedIndex == 1,
              child: Image.asset(
                R.registerVerificationTipsSelected,
                width: 140.dp,
                height: 150.dp,
                // color: GGColors.textSecond.color,
                fit: BoxFit.contain,
              ),
            ),
            googleWidget(),
          ],
        ),
      ),
    );
  }

  Widget imageRight() {
    return GestureDetector(
      onTap: () {
        selectedIndex = 2;
        setState(() {});
      },
      child: Container(
        width: 140.dp,
        height: 150.dp,
        color: Colors.transparent,
        child: Stack(
          alignment: Alignment.center,
          children: [
            Visibility(
              visible: selectedIndex == 2,
              child: Image.asset(
                R.registerVerificationTipsSelected,
                width: 140.dp,
                height: 150.dp,
                // color: GGColors.textSecond.color,
                fit: BoxFit.contain,
              ),
            ),
            mobileWidget(),
          ],
        ),
      ),
    );
  }

  Widget googleWidget() {
    return SizedBox(
      width: 140.dp,
      height: 150.dp,
      child: Column(
        children: [
          SizedBox(
            height: 20.dp,
          ),
          Image.asset(
            R.registerVerificationTipsGoogle,
            width: 57.dp,
            height: 57.dp,
            fit: BoxFit.contain,
          ),
          SizedBox(
            height: 12.dp,
          ),
          Text(
            localized('bind_google'),
            textAlign: TextAlign.center,
            style: GGTextStyle(
                color: GGColors.textMain.color,
                fontSize: GGFontSize.content,
                fontWeight: GGFontWeigh.regular),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          SizedBox(
            height: 5.dp,
          ),
          Text(
            localized('recommend'),
            textAlign: TextAlign.center,
            style: GGTextStyle(
                color: GGColors.highlightButton.color,
                fontSize: GGFontSize.content,
                fontWeight: GGFontWeigh.regular),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget mobileWidget() {
    return SizedBox(
      width: 140.dp,
      height: 150.dp,
      child: Column(
        children: [
          SizedBox(
            height: 20.dp,
          ),
          Image.asset(
            R.registerVerificationTipsMobile,
            width: 57.dp,
            height: 57.dp,
            fit: BoxFit.contain,
          ),
          SizedBox(
            height: 12.dp,
          ),
          Text(
            localized('phone_verification'),
            textAlign: TextAlign.center,
            style: GGTextStyle(
                color: GGColors.textMain.color,
                fontSize: GGFontSize.content,
                fontWeight: GGFontWeigh.regular),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _title() {
    return Container(
      padding: EdgeInsets.only(left: 16.dp, right: 16.dp),
      child: Text(
        localized('bind_p_tit'),
        style: GGTextStyle(
          color: GGColors.textMain.color,
          fontSize: GGFontSize.superBigTitle,
          fontWeight: GGFontWeigh.bold,
        ),
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
      ),
    );
  }

  Widget _content() {
    return Container(
      padding: EdgeInsets.only(left: 16.dp, right: 16.dp),
      child: Text(
        localized('bind_p_tip'),
        textAlign: TextAlign.center,
        style: GGTextStyle(
            color: GGColors.textSecond.color,
            fontSize: GGFontSize.content,
            fontWeight: GGFontWeigh.regular),
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
      ),
    );
  }

  Widget _bottom(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        left: 16.dp,
        right: 16.dp,
      ),
      child: Row(
        children: <Widget>[
          _clickView(context, true, localized('bind_p_n'),
              GGColors.textMain.color, GGColors.border.color),
          SizedBox(
            width: 11.dp,
          ),
          _clickView(context, false, localized('bind_p_g'),
              GGColors.buttonTextWhite.color, GGColors.highlightButton.color),
        ],
      ),
    );
  }

  Widget _clickView(
    BuildContext context,
    bool isLeft,
    String btnName,
    Color textColor,
    Color bgColor,
  ) {
    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () {
          if (isLeft) {
            Get.back<dynamic>();
          } else {
            Get.back<dynamic>();
            if (selectedIndex == 1) {
              Get.toNamed<dynamic>(Routes.bindGoogle.route);
            } else {
              Get.toNamed<dynamic>(Routes.bindMobile.route);
            }
          }
        },
        child: Container(
          height: 42.dp,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(4.dp),
          ),
          child: Text(btnName,
              style: GGTextStyle(
                  color: textColor,
                  fontSize: GGFontSize.smallTitle,
                  fontWeight: GGFontWeigh.regular)),
        ),
      ),
    );
  }
}
