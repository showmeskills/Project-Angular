import 'package:flutter/material.dart';
import 'package:gogaming_app/common/service/upgrade_app_service.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

class UpdateAppProgressDialog extends StatefulWidget {
  const UpdateAppProgressDialog({super.key});

  @override
  State<StatefulWidget> createState() {
    return UpdateAppProgressDialogState();
  }
}

class UpdateAppProgressDialogState extends State<UpdateAppProgressDialog> {
  double height =
      285.dp + (UpgradeAppService.sharedInstance.isUpgradeOptional ? 34.dp : 0);
  double width = 287.dp;
  double rocketWidth = 90;

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: AlertDialog(
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(4.0.dp))),
          contentPadding: EdgeInsets.only(top: 0.0.dp),
          content: Container(
            width: width,
            constraints: BoxConstraints(
              minHeight: height,
            ),
            decoration: BoxDecoration(
              color: GGColors.alertBackground.color,
              borderRadius: BorderRadius.all(Radius.circular(4.0.dp)),
            ),
            child: Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.topCenter,
              children: [
                Positioned(
                  top: -38.dp,
                  right: 0,
                  child: rocketShip(false, rocketWidth: 120.dp),
                ),

                ///Linear Indicator +  segment
                Container(
                  padding: EdgeInsets.only(
                    top: 90.dp,
                    bottom: 20.dp,
                    right: 20.dp,
                    left: 20.dp,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        localized("new_version_update_please_wait"),
                        style: GGTextStyle(
                          fontSize: GGFontSize.smallTitle,
                          fontWeight: GGFontWeigh.regular,
                          color: GGColors.textMain.color,
                        ),
                      ),
                      Gaps.vGap32,
                      Center(
                        child: Obx(() {
                          return Text(
                            "${UpgradeAppService.sharedInstance.progress}%",
                            style: GGTextStyle(
                              fontSize: GGFontSize.smallTitle,
                              color: GGColors.textMain.color,
                            ),
                          );
                        }),
                      ),
                      SizedBox(
                        height: 8.dp,
                      ),
                      Container(
                        width: 255.dp,
                        height: 12.dp,
                        decoration: BoxDecoration(
                            // border: Border.all(color: GGColors.brand.color),
                            borderRadius:
                                BorderRadius.all(Radius.circular(10.0.dp))),
                        child: ClipRRect(
                          borderRadius:
                              BorderRadius.all(Radius.circular(10.0.dp)),
                          child: Obx(() {
                            return LinearProgressIndicator(
                              backgroundColor: GGColors.border.color,
                              valueColor: AlwaysStoppedAnimation(
                                  GGColors.highlightButton.color),
                              value: UpgradeAppService.sharedInstance.progress /
                                  100.0,
                            );
                          }),
                        ),
                      ),
                      Gaps.vGap20,
                      _buildButton(),
                      Gaps.vGap20,
                      _buildTips(),
                      Gaps.vGap6,
                      // Expanded(
                      //   child: Container(color: Colors.transparent),
                      // ),
                    ],
                  ),
                ),
              ],
            ),
          )),
    );
  }

  Widget _buildButton() {
    if (!UpgradeAppService.sharedInstance.isUpgradeOptional) {
      return Gaps.empty;
    }
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Expanded(
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: () {
              UpgradeAppService.sharedInstance.close();
            },
            child: Container(
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
                child: Text(localized("cancel_update"),
                    style: GGTextStyle(
                        color: GGColors.textMain.color,
                        fontWeight: GGFontWeigh.regular,
                        fontSize: GGFontSize.smallTitle)),
              ),
            ),
          ),
        ),
        SizedBox(width: 8.dp),
        Expanded(
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: () async {
              if (UpgradeAppService.sharedInstance.progress == 100) {
                UpgradeAppService.sharedInstance.install();
              } else {
                UpgradeAppService.sharedInstance.minimize();
              }
            },
            child: Container(
              height: 34.dp,
              decoration: BoxDecoration(
                color: GGColors.brand.color,
                borderRadius: BorderRadius.all(Radius.circular(
                        4.0.dp) //                 <--- border radius here
                    ),
              ),
              child: Center(
                child: Obx(() {
                  return Text(
                    UpgradeAppService.sharedInstance.progress == 100
                        ? localized('install')
                        : localized("minimize"),
                    style: GGTextStyle(
                      color: GGColors.buttonTextWhite.color,
                      fontWeight: GGFontWeigh.regular,
                      fontSize: GGFontSize.smallTitle,
                    ),
                  );
                }),
              ),
            ),
          ),
        )
      ],
    );
  }

  Widget _buildTips() {
    return InkWell(
      onTap: onClickDownload,
      child: Text(
        localized('download_error_through_through_browser'),
        style: GGTextStyle(
          color: GGColors.link.color,
          fontSize: GGFontSize.content,
          decoration: TextDecoration.underline,
        ),
      ),
    );
  }

  void onClickDownload() async {
    UpgradeAppService.sharedInstance.manualUpgrade();
  }

  Widget rocketShip(bool isGrey, {double rocketWidth = 110}) {
    return Image.asset(
      R.iconRocketNew,
      height: rocketWidth,
      width: rocketWidth,
    );
  }
}
