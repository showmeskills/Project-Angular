import 'package:flutter/material.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../service/upgrade_app_service.dart';

class UpdateWidget extends StatefulWidget {
  const UpdateWidget({
    Key? key,
    this.isUpgradeOptional = false,
  }) : super(key: key);
  final bool isUpgradeOptional;
  @override
  State<UpdateWidget> createState() => _UpdateWidgetState();
}

class _UpdateWidgetState extends State<UpdateWidget> {
  double height = 285.dp;
  double width = 287.dp;
  @override
  Widget build(BuildContext context) {
    return _buildContent();
  }

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
  }

  Widget _buildContent() {
    return AlertDialog(
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(4.0.dp))),
        contentPadding: const EdgeInsets.only(top: 0.0),
        content: Container(
          height: height,
          width: width,
          decoration: BoxDecoration(
            color: GGColors.alertBackground.color, //Colors.white,
            borderRadius: BorderRadius.all(Radius.circular(4.0.dp)),
          ),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Positioned(
                top: -38.dp,
                right: 0,
                child: rocketShip(false, rocketWidth: 120.dp),
              ),
              Padding(
                padding: EdgeInsets.only(top: 90.dp),
                child: Container(
                    width: double.infinity,
                    height: 0.1,
                    color: GGColors.brand.color),
              ),
              Padding(
                padding: EdgeInsets.only(
                    top: 11.dp, bottom: 20.dp, right: 20.dp, left: 20.dp),
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(localized("new_version_discovered"),
                          maxLines: 1,
                          style: GGTextStyle(
                            fontSize: GGFontSize.superBigTitle28,
                            fontWeight: GGFontWeigh.bold,
                            color: GGColors.textMain.color,
                            fontFamily: GGFontFamily.robot,
                            fontStyle: FontStyle.italic,
                          )),
                      Gaps.vGap6,
                      Stack(
                        alignment: Alignment.centerLeft,
                        children: [
                          SvgPicture.asset(
                            R.iconVersionBg,
                            color: GGColors.borderOpposite.color,
                            width: 120.dp,
                          ),
                          Container(
                            height: 23.dp,
                            width: 120.dp,
                            alignment: Alignment.center,
                            child: Text(
                                "v${UpgradeAppService.sharedInstance.serverBuildNO}",
                                style: GGTextStyle(
                                    fontSize: GGFontSize.smallTitle,
                                    fontWeight: GGFontWeigh.bold,
                                    color: GGColors.buttonTextBlack.color)),
                          ),
                        ],
                      ),
                      Gaps.vGap16,
                      SizedBox(
                        child: Text("  【${localized('version_update')}】",
                            style: GGTextStyle(
                                fontSize: GGFontSize.content,
                                fontWeight: GGFontWeigh.bold,
                                color: GGColors.textMain.color)),
                      ),
                      SizedBox(
                        height: 5.dp,
                      ),
                      _updateSubtitles(),
                    ]),
              ),
              widget.isUpgradeOptional ? optionalUpdateBtn() : updateBtn(),
            ],
          ),
        ));
  }

  Widget _updateSubtitles() {
    return Container(
      height: 96.dp,
      margin: EdgeInsets.only(left: 10.dp, right: 12.dp),
      child: Text(
        UpgradeAppService.sharedInstance.fetchUpdateInfo(),
        style: GGTextStyle(
            color: GGColors.textMain.color,
            fontSize: GGFontSize.content,
            fontWeight: GGFontWeigh.regular),
        maxLines: 4,
      ),
    );
  }

  ///optional 稍后更新 / 立即更新
  Widget optionalUpdateBtn() {
    return Padding(
      padding: EdgeInsets.only(
        top: 228.dp,
        left: 18.dp,
        right: 18.dp,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: UpgradeAppService.sharedInstance.dismissUpgradeDialog,
            child: Container(
              width: 120.dp,
              height: 34.dp,
              decoration: BoxDecoration(
                color: GGColors.border.color,
                borderRadius: BorderRadius.all(
                  Radius.circular(
                    4.0.dp,
                  ),
                ),
              ),
              child: Center(
                child: Text(localized("update_later"),
                    style: GGTextStyle(
                        color: GGColors.textMain.color,
                        fontWeight: GGFontWeigh.regular,
                        fontSize: GGFontSize.smallTitle)),
              ),
            ),
          ),
          SizedBox(width: 8.dp),
          GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: () async {
              upgrade();
            },
            child: Container(
              width: 120.dp,
              height: 34.dp,
              decoration: BoxDecoration(
                color: GGColors.brand.color,
                borderRadius: BorderRadius.all(Radius.circular(
                        4.0.dp) //                 <--- border radius here
                    ),
              ),
              child: Center(
                child: Text(
                  localized("update_immediately"),
                  style: GGTextStyle(
                      color: GGColors.buttonTextWhite.color,
                      fontWeight: GGFontWeigh.regular,
                      fontSize: GGFontSize.smallTitle),
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  ///更新 button
  Widget updateBtn() {
    return Padding(
      padding: EdgeInsets.only(
        top: 228.dp,
        left: 18.dp,
        right: 18.dp,
      ),
      child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () async {
            upgrade();
          },
          child: Container(
            height: 34.dp,
            padding: EdgeInsets.only(left: 20.dp, right: 20.dp),
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: GGColors.highlightButton.color,
              borderRadius: BorderRadius.all(Radius.circular(
                      4.0.dp) //                 <--- border radius here
                  ),
            ),
            child: Center(
              child: Text(
                localized("update_immediately"),
                style: GGTextStyle(
                    color: GGColors.buttonTextWhite.color,
                    fontWeight: GGFontWeigh.regular,
                    fontSize: GGFontSize.smallTitle),
              ),
            ),
          )),
    );
  }

  void upgrade() {
    UpgradeAppService.sharedInstance.upgrade();
  }

  Widget rocketShip(bool isGrey, {double rocketWidth = 120}) {
    return Image.asset(
      R.iconRocketNew,
      height: rocketWidth,
      width: rocketWidth,
    );
  }
}
