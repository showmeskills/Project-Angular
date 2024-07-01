import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/widget_header.dart';
import 'base_controller.dart';

class TopTipsWidget extends GetView<BaseController> {
  const TopTipsWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (!KycService.sharedInstance.isCloseTips &&
          KycService.sharedInstance.needKycIntermediate) {
        return _build();
      }
      return Gaps.empty;
    });
  }

  Widget _build() {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 16.dp).copyWith(
        top: 10.dp,
        bottom: 6.dp,
      ),
      child: ScaleTap(
        onPressed: () {
          Get.toNamed<void>(Routes.kycMiddle.route);
        },
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 18.dp, vertical: 10.dp),
          decoration: BoxDecoration(
            color: GGColors.error.color
                .withOpacity(ThemeManager.shareInstacne.isDarkMode ? 0.2 : 0.8),
            borderRadius: BorderRadius.circular(4.dp),
          ),
          child: Row(
            children: [
              SvgPicture.asset(
                R.iconRiskError,
                width: 17.dp,
                height: 17.dp,
                color: GGColors.tabBarHighlightButton.color,
              ),
              Gaps.hGap18,
              Expanded(
                child: RichText(
                  text: TextSpan(
                    children: [
                      TextSpan(
                        text: localized('kyc_m_notice'),
                        style: GGTextStyle(
                          fontSize: GGFontSize.hint,
                          color: GGColors.buttonTextWhite.color,
                        ),
                      ),
                      TextSpan(
                        text: ' ${localized('start_now')}>>',
                        style: GGTextStyle(
                          fontSize: GGFontSize.hint,
                          color: GGColors.tabBarHighlightButton.color,
                        ),
                      ),
                    ],
                  ),
                  softWrap: true,
                ),
              ),
              Gaps.hGap18,
              ScaleTap(
                onPressed: () {
                  KycService.sharedInstance.closeTips();
                },
                child: SvgPicture.asset(
                  R.iconToastClose,
                  width: 14.dp,
                  height: 14.dp,
                  color: GGColors.riskIconColor.color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
