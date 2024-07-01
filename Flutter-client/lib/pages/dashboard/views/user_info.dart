import 'package:flutter/material.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/vip_service.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/dashboard/logics/vip_logic.dart';
import 'package:gogaming_app/widget_header.dart';

import '../logics/user_info_logic.dart';

class DashboardUserInfo extends StatelessWidget {
  const DashboardUserInfo({super.key});

  DashboardUserInfoLogic get controller => Get.find<DashboardUserInfoLogic>();
  DashboardVipLogic get vipLogic => Get.find<DashboardVipLogic>();

  DashboardUserInfoState get state => controller.state;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(16.dp),
      decoration: BoxDecoration(
        color: GGColors.moduleBackground.color,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            offset: Offset(0, 3.dp),
            blurRadius: 8.dp,
          )
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AccountService.sharedInstance.buildCustomAvatar(42.dp, 42.dp),
          Gaps.hGap16,
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Obx(
                  () {
                    if (!state.isLogin) {
                      return Gaps.empty;
                    }
                    return SizedBox(
                      width: double.infinity,
                      child: Row(
                        children: [
                          Flexible(
                            child: Text(
                              (state.userName?.isEmpty == true)
                                  ? state.uid ?? ''
                                  : state.userName ?? '',
                              style: GGTextStyle(
                                fontSize: GGFontSize.smallTitle,
                                color: GGColors.textMain.color,
                                fontWeight: GGFontWeigh.medium,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Gaps.hGap12,
                          Text(
                            '${localized('user_id_text')} ',
                            style: GGTextStyle(
                              fontSize: GGFontSize.smallTitle,
                              color: GGColors.textSecond.color,
                            ),
                            maxLines: 1,
                          ),
                          Text(
                            state.uid ?? '',
                            style: GGTextStyle(
                              fontSize: GGFontSize.smallTitle,
                              color: GGColors.textMain.color,
                            ),
                            maxLines: 1,
                          ),
                        ],
                      ),
                    );
                  },
                ),
                Gaps.vGap6,
                Row(
                  children: [
                    Obx(
                      () {
                        return Row(
                          children: [
                            SvgPicture.asset(
                              R.mainMenuDiamonds,
                              width: 14.dp,
                              height: 12.dp,
                              color: GGColors.brand.color,
                              fit: BoxFit.contain,
                            ),
                            Gaps.hGap6,
                            ScaleTap(
                              opacityMinValue: 0.8,
                              scaleMinValue: 0.98,
                              onPressed: () {
                                Get.toNamed<void>(Routes.vip.route);
                              },
                              child: Text(
                                VipService.sharedInstance.vipLevelName,
                                style: GGTextStyle(
                                  color: GGColors.brand.color,
                                  fontSize: GGFontSize.content,
                                  decoration: TextDecoration.underline,
                                ),
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                    Gaps.hGap4,
                    Obx(
                      () {
                        if (!state.isLogin) {
                          return Gaps.empty;
                        }
                        return _buildKycLevel();
                      },
                    ),
                  ],
                ),
                Obx(
                  () {
                    if (!state.isLogin) {
                      return Gaps.empty;
                    }

                    return Container(
                      margin: EdgeInsets.only(top: 16.dp),
                      child: Text(
                        '${localized('last_login_time')} ${state.lastLoginDate ?? '-'}   IP: ${state.lastLoginIp ?? '-'}',
                        style: GGTextStyle(
                          color: GGColors.textSecond.color,
                          fontSize: GGFontSize.hint,
                          fontFamily: GGFontFamily.dingPro,
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildKycLevel() {
    return ScaleTap(
      opacityMinValue: 0.8,
      scaleMinValue: 0.98,
      onPressed: () {
        Get.toNamed<void>(Routes.kycHome.route);
      },
      child: Container(
        decoration: BoxDecoration(
          color: state.isCertified
              ? GGColors.brand.color.withOpacity(0.2)
              : GGColors.border.color,
          borderRadius: BorderRadius.circular(4.dp),
        ),
        padding: EdgeInsets.symmetric(horizontal: 6.dp, vertical: 1.dp),
        alignment: Alignment.center,
        child: Text(
          state.kycTypeText,
          style: GGTextStyle(
            color: state.isCertified
                ? GGColors.brand.color
                : GGColors.textSecond.color,
            fontSize: GGFontSize.content,
          ),
        ),
      ),
    );
  }
}
