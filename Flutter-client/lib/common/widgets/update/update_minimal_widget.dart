import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/service/upgrade_app_service.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/widget_header.dart';

class UpdateMinimalWidget extends StatelessWidget {
  const UpdateMinimalWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Positioned(
      bottom: 60.dp,
      right: 0,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            padding: EdgeInsets.only(right: 16.dp, top: 16.dp),
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () {
                UpgradeAppService.sharedInstance.showProgressDialog();
              },
              child: Container(
                width: 60.dp,
                height: 45.dp,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(4.dp),
                  color: GGColors.alertBackground.color,
                  image: const DecorationImage(
                    image: AssetImage(R.iconMinimalRocketBgNew),
                    fit: BoxFit.fitWidth,
                    alignment: Alignment.topCenter,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: GGColors.shadow.color,
                      blurRadius: 3.0,
                      offset: const Offset(0.0, 3),
                    )
                  ],
                ),
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    _buildRocket(),
                    _buildProgress(),
                  ],
                ),
              ),
            ),
          ),
          _buildClose(),
        ],
      ),
    );
  }

  Widget _buildRocket() {
    return Positioned(
      top: -10.dp,
      right: 7.dp,
      child: GamingImage.asset(
        R.iconRocketNew,
        width: 44.dp,
        height: 44.dp,
      ),
    );
  }

  Widget _buildProgress() {
    return Positioned(
      bottom: 5.dp,
      left: 4.dp,
      right: 4.dp,
      child: SizedBox(
        width: double.infinity,
        height: 4.dp,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(2.dp),
          child: Obx(() {
            return LinearProgressIndicator(
              backgroundColor: GGColors.border.color,
              valueColor:
                  AlwaysStoppedAnimation(GGColors.highlightButton.color),
              value: UpgradeAppService.sharedInstance.progress / 100.0,
            );
          }),
        ),
      ),
    );
  }

  Widget _buildClose() {
    return Positioned(
      top: 0,
      right: 0,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () {
          UpgradeAppService.sharedInstance.close();
        },
        child: Container(
          padding: EdgeInsets.all(8.dp),
          child: Container(
            width: 16.dp,
            height: 16.dp,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8.dp),
              color: Colors.black.withOpacity(0.35),
            ),
            child: GamingImage.asset(
              R.iconClose,
              width: 10.dp,
              height: 10.dp,
              color: GGColors.buttonTextWhite.color,
            ),
          ),
        ),
      ),
    );
  }
}
